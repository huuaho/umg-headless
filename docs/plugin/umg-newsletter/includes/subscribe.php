<?php
/**
 * UMG Newsletter - Subscribe Endpoint
 *
 * POST /wp-json/umg/v1/subscribe
 * Proxies email signup to the Mailchimp Marketing API.
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('umg/v1', '/subscribe', array(
        'methods'             => 'POST',
        'callback'            => 'umg_newsletter_subscribe',
        'permission_callback' => '__return_true',
        'args'                => array(
            'email_address' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
            ),
        ),
    ));
});

/**
 * Handle newsletter subscription request.
 */
function umg_newsletter_subscribe(WP_REST_Request $request) {
    // Check Mailchimp is configured
    if (empty(MAILCHIMP_API_KEY) || empty(MAILCHIMP_LIST_ID) || empty(MAILCHIMP_SERVER_PREFIX)) {
        return new WP_Error('not_configured', 'Newsletter service is not configured.', array('status' => 500));
    }

    // Rate limit by IP
    $ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $transient_key = 'umg_nl_rate_' . substr($ip_hash, 0, 32);
    $count = (int) get_transient($transient_key);

    if ($count >= UMG_NL_RATE_LIMIT) {
        return new WP_Error('rate_limited', 'Too many requests. Please try again later.', array('status' => 429));
    }

    set_transient($transient_key, $count + 1, HOUR_IN_SECONDS);

    // Validate email
    $email = $request->get_param('email_address');
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Please enter a valid email address.', array('status' => 400));
    }

    // Call Mailchimp API - Add/update member
    $api_url = sprintf(
        'https://%s.api.mailchimp.com/3.0/lists/%s/members',
        MAILCHIMP_SERVER_PREFIX,
        MAILCHIMP_LIST_ID
    );

    $response = wp_remote_post($api_url, array(
        'timeout' => 15,
        'headers' => array(
            'Authorization' => 'Basic ' . base64_encode('anystring:' . MAILCHIMP_API_KEY),
            'Content-Type'  => 'application/json',
        ),
        'body' => wp_json_encode(array(
            'email_address' => strtolower($email),
            'status'        => 'pending', // Double opt-in
        )),
    ));

    if (is_wp_error($response)) {
        error_log('UMG Newsletter: wp_remote_post failed - ' . $response->get_error_message());
        return new WP_Error('mailchimp_error', 'Could not connect to newsletter service. Please try again.', array('status' => 502));
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    // Success - new subscriber added
    if ($status_code === 200) {
        umg_newsletter_apply_tags($email);
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Please check your email to confirm your subscription.',
        ));
    }

    // Already subscribed
    if ($status_code === 400 && isset($body['title']) && $body['title'] === 'Member Exists') {
        return rest_ensure_response(array(
            'success' => true,
            'message' => "You're already subscribed!",
        ));
    }

    // Compliance state - previously unsubscribed
    if ($status_code === 400 && isset($body['title']) && $body['title'] === 'Forgotten Email Not Subscribed') {
        return new WP_Error(
            'compliance_block',
            'This email was previously unsubscribed. Please contact us for assistance.',
            array('status' => 400)
        );
    }

    // Other Mailchimp errors
    error_log('UMG Newsletter: Mailchimp API error - ' . wp_json_encode($body));
    return new WP_Error('mailchimp_error', 'Something went wrong. Please try again later.', array('status' => 502));
}

/**
 * Apply tags to a newly subscribed member.
 * Tags require a separate API call in Mailchimp v3.
 */
function umg_newsletter_apply_tags($email) {
    $subscriber_hash = md5(strtolower($email));
    $api_url = sprintf(
        'https://%s.api.mailchimp.com/3.0/lists/%s/members/%s/tags',
        MAILCHIMP_SERVER_PREFIX,
        MAILCHIMP_LIST_ID,
        $subscriber_hash
    );

    $response = wp_remote_post($api_url, array(
        'timeout' => 10,
        'headers' => array(
            'Authorization' => 'Basic ' . base64_encode('anystring:' . MAILCHIMP_API_KEY),
            'Content-Type'  => 'application/json',
        ),
        'body' => wp_json_encode(array(
            'tags' => array(
                array('name' => 'website-signup', 'status' => 'active'),
                array('name' => 'umg-main', 'status' => 'active'),
            ),
        )),
    ));

    if (is_wp_error($response)) {
        error_log('UMG Newsletter: Failed to apply tags for ' . $email . ' - ' . $response->get_error_message());
    }
}
