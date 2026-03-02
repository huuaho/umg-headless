<?php
/**
 * UMG Photo Contest - Payment Endpoints
 *
 * 1. GET  /umg/v1/payment-status  — return payment status for authenticated user
 * 2. POST /umg/v1/stripe-webhook  — handle Stripe checkout.session.completed
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
 * Verify Stripe signature, handle checkout.session.completed,
 * mark user as paid by matching customer_email.
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

    // Only handle checkout.session.completed
    if ($event['type'] !== 'checkout.session.completed') {
        return rest_ensure_response(array('received' => true));
    }

    $session = isset($event['data']['object']) ? $event['data']['object'] : array();
    $customer_email = isset($session['customer_email']) ? sanitize_email($session['customer_email']) : '';

    // Also check customer_details.email as fallback
    if (!$customer_email && !empty($session['customer_details']['email'])) {
        $customer_email = sanitize_email($session['customer_details']['email']);
    }

    if (!$customer_email) {
        return new WP_Error('webhook_error', 'No customer email in session.', array('status' => 400));
    }

    // Find WP user by email
    $user = get_user_by('email', $customer_email);
    if (!$user) {
        // User hasn't signed up yet - this is unusual but not an error for Stripe
        return rest_ensure_response(array('received' => true));
    }

    // Mark as paid
    update_user_meta($user->ID, 'umgpc_payment_status', 'paid');
    update_user_meta($user->ID, 'umgpc_stripe_payment_id', sanitize_text_field($session['id'] ?? ''));
    update_user_meta($user->ID, 'umgpc_payment_date', current_time('mysql'));

    return rest_ensure_response(array('received' => true));
}
