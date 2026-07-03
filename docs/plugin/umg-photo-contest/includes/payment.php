<?php
/**
 * UMG Photo Contest - Payment Endpoints
 *
 * 1. GET  /umg/v1/payment-status  — return payment status for authenticated user
 * 2. POST /umg/v1/stripe-webhook  — handle Stripe checkout settlement events
 *    (checkout.session.completed [paid] and checkout.session.async_payment_succeeded)
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    // GET /umg/v1/payment-status
    register_rest_route('umg/v1', '/payment-status', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_payment_status',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/stripe-webhook
    register_rest_route('umg/v1', '/stripe-webhook', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_stripe_webhook',
        'permission_callback' => '__return_true',
    ));
});

/**
 * GET /umg/v1/payment-status
 *
 * Return payment status and date for the authenticated user.
 */
function umgpc_payment_status(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);

    if (is_wp_error($user_id)) {
        return $user_id;
    }

    $payment_status = get_user_meta($user_id, 'umgpc_payment_status', true);
    if (!$payment_status) {
        $payment_status = 'unpaid';
    }

    $payment_date = get_user_meta($user_id, 'umgpc_payment_date', true);

    return rest_ensure_response(array(
        'payment_status' => $payment_status,
        'payment_date'   => $payment_date ?: null,
    ));
}

/**
 * POST /umg/v1/stripe-webhook
 *
 * Verify Stripe signature, then mark the user paid (matched by
 * client_reference_id, falling back to customer_email) on a settled payment:
 * checkout.session.completed with payment_status "paid" (immediate methods) or
 * checkout.session.async_payment_succeeded (asynchronous methods like Alipay,
 * which complete first as "processing" and settle later).
 *
 * Only entry-fee checkouts are acted on: a session whose metadata carries a
 * purpose other than "entry_fee" is acknowledged and skipped. Sessions with no
 * purpose metadata are treated as entry fees (the current entry-fee Payment
 * Link predates the metadata); any future Payment Link on this Stripe account
 * (e.g. donations) MUST set its own purpose metadata or it will be treated as
 * an entry fee.
 */
function umgpc_stripe_webhook(WP_REST_Request $request) {
    $payload = file_get_contents('php://input');
    $sig_header = isset($_SERVER['HTTP_STRIPE_SIGNATURE']) ? $_SERVER['HTTP_STRIPE_SIGNATURE'] : '';

    if (!$sig_header || !UMGPC_STRIPE_WEBHOOK_SECRET) {
        return new WP_Error('webhook_error', 'Missing signature or webhook secret.', array('status' => 400));
    }

    // Parse Stripe signature header
    $sig_parts = array();
    foreach (explode(',', $sig_header) as $part) {
        $kv = explode('=', trim($part), 2);
        if (count($kv) === 2) {
            $sig_parts[$kv[0]] = $kv[1];
        }
    }

    $timestamp = isset($sig_parts['t']) ? $sig_parts['t'] : '';
    $signature = isset($sig_parts['v1']) ? $sig_parts['v1'] : '';

    if (!$timestamp || !$signature) {
        return new WP_Error('webhook_error', 'Invalid signature format.', array('status' => 400));
    }

    // Verify signature: HMAC-SHA256 of "timestamp.payload"
    $signed_payload = $timestamp . '.' . $payload;
    $expected = hash_hmac('sha256', $signed_payload, UMGPC_STRIPE_WEBHOOK_SECRET);

    if (!hash_equals($expected, $signature)) {
        return new WP_Error('webhook_error', 'Signature verification failed.', array('status' => 400));
    }

    // Reject events older than 5 minutes (replay protection)
    if (abs(time() - (int) $timestamp) > 300) {
        return new WP_Error('webhook_error', 'Timestamp too old.', array('status' => 400));
    }

    // Parse event
    $event = json_decode($payload, true);
    if (!$event || empty($event['type'])) {
        return new WP_Error('webhook_error', 'Invalid event payload.', array('status' => 400));
    }

    // Determine whether this event represents a *settled* payment.
    //
    // Immediate methods (cards, wallets) settle on checkout.session.completed
    // with payment_status "paid". Asynchronous methods (Alipay, etc.) complete
    // first with payment_status "unpaid"/"processing" and only settle later via
    // checkout.session.async_payment_succeeded. We must act on that async event,
    // and must NOT grant access on a completed-but-still-processing session.
    $session = isset($event['data']['object']) ? $event['data']['object'] : array();
    $session_payment_status = isset($session['payment_status']) ? $session['payment_status'] : '';

    $is_completed_paid = ($event['type'] === 'checkout.session.completed'
        && $session_payment_status === 'paid');
    $is_async_success = ($event['type'] === 'checkout.session.async_payment_succeeded');

    if (!$is_completed_paid && !$is_async_success) {
        // Not a settlement event we act on. This includes async_payment_failed
        // and completed-but-still-processing sessions. Acknowledge so Stripe
        // stops retrying; the definitive settlement event will follow later.
        return rest_ensure_response(array('received' => true));
    }

    // Only act on entry-fee checkouts. Sessions without purpose metadata are
    // treated as entry fees (the current entry-fee link predates the metadata);
    // any other purpose (e.g. a future donations link) is acknowledged and
    // skipped so its payers are never flagged as paid contest entrants.
    $purpose = isset($session['metadata']['purpose']) ? $session['metadata']['purpose'] : '';
    if ($purpose !== '' && $purpose !== 'entry_fee') {
        return rest_ensure_response(array('received' => true));
    }

    $customer_email = isset($session['customer_email']) ? sanitize_email($session['customer_email']) : '';

    // Also check customer_details.email as fallback
    if (!$customer_email && !empty($session['customer_details']['email'])) {
        $customer_email = sanitize_email($session['customer_details']['email']);
    }

    // Prefer client_reference_id (the WP user id we set on the payment link):
    // it survives payer-email edits and wallet flows that settle under a
    // different email. Fall back to email so in-flight sessions created before
    // this change (no client_reference_id) still resolve.
    $user = null;

    $client_reference_id = isset($session['client_reference_id'])
        ? sanitize_text_field($session['client_reference_id'])
        : '';
    if ($client_reference_id !== '' && ctype_digit($client_reference_id)) {
        $user = get_user_by('id', (int) $client_reference_id);
    }

    if (!$user && $customer_email) {
        $user = get_user_by('email', $customer_email);
    }

    if (!$user) {
        // No user matched by id or email. Payment may be orphaned (see I-5).
        // Acknowledge so Stripe stops retrying; the miss is logged below.
        error_log(sprintf(
            '[umgpc webhook] UNMATCHED payment: event=%s type=%s email=%s amount=%s session=%s client_ref=%s',
            isset($event['id']) ? $event['id'] : '(none)',
            $event['type'],
            $customer_email ?: '(none)',
            isset($session['amount_total']) ? $session['amount_total'] : '(none)',
            isset($session['id']) ? $session['id'] : '(none)',
            $client_reference_id ?: '(none)'
        ));
        return rest_ensure_response(array('received' => true));
    }

    // Mark as paid
    update_user_meta($user->ID, 'umgpc_payment_status', 'paid');
    update_user_meta($user->ID, 'umgpc_stripe_payment_id', sanitize_text_field($session['id'] ?? ''));
    update_user_meta($user->ID, 'umgpc_payment_date', current_time('mysql'));

    return rest_ensure_response(array('received' => true));
}
