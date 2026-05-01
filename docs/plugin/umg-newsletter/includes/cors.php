<?php
/**
 * UMG Newsletter - CORS Handling
 *
 * Handles preflight OPTIONS requests and adds CORS headers to REST responses.
 * Only activates if the photo contest plugin's CORS handler is not already loaded.
 */

if (!defined('ABSPATH')) exit;

/**
 * Handle OPTIONS preflight requests before WordPress processes them.
 */
add_action('init', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') return;

    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($request_uri, '/wp-json/umg/v1/subscribe') === false) return;

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if (in_array($origin, umg_nl_allowed_origins())) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        header('Access-Control-Max-Age: 86400');
    }

    header('Content-Length: 0');
    header('Content-Type: text/plain');
    status_header(200);
    exit;
});

/**
 * Add CORS headers to REST API responses for the subscribe endpoint.
 * Skips if the photo contest plugin already handles CORS for umg/v1.
 */
if (!function_exists('umgpc_allowed_origins')) {
    add_action('rest_api_init', function () {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function ($value) {
            $origin = get_http_origin();
            if (in_array($origin, umg_nl_allowed_origins())) {
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Credentials: true');
            }
            return $value;
        });
    });
}
