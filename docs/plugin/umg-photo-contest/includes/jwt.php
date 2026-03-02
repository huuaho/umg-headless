<?php
/**
 * UMG Photo Contest - JWT Authentication Helpers
 *
 * Pure PHP JWT implementation using HMAC-SHA256.
 * No external libraries required.
 */

if (!defined('ABSPATH')) exit;

/**
 * Base64url encode (URL-safe base64 without padding).
 */
function umgpc_base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64url decode.
 */
function umgpc_base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generate a JWT token for a user.
 *
 * @param int    $user_id WordPress user ID
 * @param string $email   User email
 * @return string Signed JWT token
 */
function umgpc_generate_jwt($user_id, $email) {
    $header = umgpc_base64url_encode(wp_json_encode(array(
        'alg' => 'HS256',
        'typ' => 'JWT',
    )));

    $payload = umgpc_base64url_encode(wp_json_encode(array(
        'user_id' => (int) $user_id,
        'email'   => $email,
        'exp'     => time() + UMGPC_JWT_EXPIRY,
    )));

    $signature = umgpc_base64url_encode(
        hash_hmac('sha256', "$header.$payload", UMGPC_JWT_SECRET, true)
    );

    return "$header.$payload.$signature";
}

/**
 * Validate a JWT token.
 *
 * @param string $token JWT token string
 * @return array|WP_Error Decoded payload on success, WP_Error on failure
 */
function umgpc_validate_jwt($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return new WP_Error('invalid_token', 'Malformed token.', array('status' => 401));
    }

    list($header, $payload, $signature) = $parts;

    // Verify signature
    $expected = umgpc_base64url_encode(
        hash_hmac('sha256', "$header.$payload", UMGPC_JWT_SECRET, true)
    );

    if (!hash_equals($expected, $signature)) {
        return new WP_Error('invalid_token', 'Invalid token signature.', array('status' => 401));
    }

    // Decode payload
    $data = json_decode(umgpc_base64url_decode($payload), true);
    if (!$data) {
        return new WP_Error('invalid_token', 'Could not decode token.', array('status' => 401));
    }

    // Check expiry
    if (empty($data['exp']) || $data['exp'] < time()) {
        return new WP_Error('token_expired', 'Token has expired.', array('status' => 401));
    }

    return $data;
}

/**
 * Extract and validate the Bearer token from a REST request.
 *
 * @param WP_REST_Request $request
 * @return int|WP_Error WordPress user ID on success, WP_Error on failure
 */
function umgpc_get_user_from_request($request) {
    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || stripos($auth_header, 'Bearer ') !== 0) {
        return new WP_Error('missing_token', 'Authorization header required.', array('status' => 401));
    }

    $token = substr($auth_header, 7);
    $payload = umgpc_validate_jwt($token);

    if (is_wp_error($payload)) {
        return $payload;
    }

    $user_id = (int) $payload['user_id'];
    $user = get_user_by('id', $user_id);

    if (!$user) {
        return new WP_Error('invalid_user', 'User not found.', array('status' => 401));
    }

    return $user_id;
}
