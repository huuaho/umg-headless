<?php
/**
 * UMG Photo Contest - Authentication Endpoints
 *
 * Passwordless email code flow:
 * 1. POST /umg/v1/auth/request-code  — send 6-digit code to email
 * 2. POST /umg/v1/auth/verify-code   — validate code, return JWT + user
 * 3. GET  /umg/v1/me                 — return current user from JWT
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    // POST /umg/v1/auth/request-code
    register_rest_route('umg/v1', '/auth/request-code', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_request_code',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
            ),
        ),
    ));

    // POST /umg/v1/auth/verify-code
    register_rest_route('umg/v1', '/auth/verify-code', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_verify_code',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
            ),
            'code' => array(
                'required' => true,
                'type'     => 'string',
            ),
        ),
    ));

    // GET /umg/v1/me
    register_rest_route('umg/v1', '/me', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_me',
        'permission_callback' => '__return_true',
    ));
});

/**
 * POST /umg/v1/auth/request-code
 *
 * Find or create WP user by email, generate a 6-digit code, send via wp_mail().
 */
function umgpc_request_code(WP_REST_Request $request) {
    $email = $request->get_param('email');

    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
    }

    // Find existing user or create new one
    $user = get_user_by('email', $email);

    if (!$user) {
        $username = sanitize_user(strstr($email, '@', true), true);

        // Ensure unique username
        if (username_exists($username)) {
            $username = $username . '_' . wp_rand(100, 999);
        }

        $user_id = wp_insert_user(array(
            'user_login'   => $username,
            'user_email'   => $email,
            'user_pass'    => wp_generate_password(32, true, true),
            'display_name' => strstr($email, '@', true),
            'role'         => 'subscriber',
        ));

        if (is_wp_error($user_id)) {
            return new WP_Error('user_creation_failed', 'Could not create account.', array('status' => 500));
        }

        // Initialize payment status for new users
        update_user_meta($user_id, 'umgpc_payment_status', 'unpaid');

        $user = get_user_by('id', $user_id);
    }

    // Generate 6-digit code
    $code = str_pad(wp_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    update_user_meta($user->ID, 'umgpc_auth_code', $code);
    update_user_meta($user->ID, 'umgpc_auth_code_expiry', time() + UMGPC_CODE_EXPIRY);

    // Send code via email
    $subject = 'Your verification code';
    $message = "Your verification code is: $code\n\nThis code expires in 15 minutes.";
    $sent = wp_mail($email, $subject, $message);

    if (!$sent) {
        return new WP_Error('email_failed', 'Could not send verification email. Please try again.', array('status' => 500));
    }

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/auth/verify-code
 *
 * Validate the 6-digit code, clear it, return JWT + user object.
 */
function umgpc_verify_code(WP_REST_Request $request) {
    $email = $request->get_param('email');
    $code  = $request->get_param('code');

    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'No account found for this email.', array('status' => 404));
    }

    $stored_code   = get_user_meta($user->ID, 'umgpc_auth_code', true);
    $code_expiry   = (int) get_user_meta($user->ID, 'umgpc_auth_code_expiry', true);

    if (!$stored_code || $stored_code !== $code) {
        return new WP_Error('invalid_code', 'Invalid verification code.', array('status' => 401));
    }

    if ($code_expiry < time()) {
        // Clear expired code
        delete_user_meta($user->ID, 'umgpc_auth_code');
        delete_user_meta($user->ID, 'umgpc_auth_code_expiry');
        return new WP_Error('code_expired', 'Verification code has expired. Please request a new one.', array('status' => 401));
    }

    // Clear code after successful verification
    delete_user_meta($user->ID, 'umgpc_auth_code');
    delete_user_meta($user->ID, 'umgpc_auth_code_expiry');

    // Generate JWT
    $token = umgpc_generate_jwt($user->ID, $user->user_email);

    $payment_status = get_user_meta($user->ID, 'umgpc_payment_status', true);
    if (!$payment_status) {
        $payment_status = 'unpaid';
    }

    return rest_ensure_response(array(
        'token' => $token,
        'user'  => array(
            'id'             => $user->ID,
            'email'          => $user->user_email,
            'name'           => $user->display_name,
            'payment_status' => $payment_status,
        ),
    ));
}

/**
 * GET /umg/v1/me
 *
 * Return current user from JWT.
 */
function umgpc_me(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);

    if (is_wp_error($user_id)) {
        return $user_id;
    }

    $user = get_user_by('id', $user_id);

    $payment_status = get_user_meta($user_id, 'umgpc_payment_status', true);
    if (!$payment_status) {
        $payment_status = 'unpaid';
    }

    return rest_ensure_response(array(
        'id'             => $user->ID,
        'email'          => $user->user_email,
        'name'           => $user->display_name,
        'payment_status' => $payment_status,
    ));
}
