<?php
/**
 * UMG Photo Contest - CORS Handling
 *
 * Reuses the same pattern as United Media Ingestor.
 * Handles preflight OPTIONS requests and adds CORS headers to all REST responses.
 */

if (!defined('ABSPATH')) exit;

/**
 * Handle OPTIONS preflight requests before WordPress processes them.
 * Must run early (init hook) to catch preflight before REST API routing.
 */
add_action('init', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') return;

    // Only handle preflight for our API namespace
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($request_uri, '/wp-json/umg/v1') === false) return;

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if (in_array($origin, umgpc_allowed_origins())) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept');
        header('Access-Control-Max-Age: 86400');
    }

    header('Content-Length: 0');
    header('Content-Type: text/plain');
    status_header(200);
    exit;
});

/**
 * Add CORS headers to all REST API responses.
 */
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $origin = get_http_origin();
        if (in_array($origin, umgpc_allowed_origins())) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }
        return $value;
    });
});

/**
 * Prevent caching of REST API responses.
 */
add_filter('rest_post_dispatch', function ($response) {
    $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    $response->header('Pragma', 'no-cache');
    $response->header('Expires', '0');
    return $response;
});
