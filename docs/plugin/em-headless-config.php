<?php
/**
 * Plugin Name: EM Headless Config
 * Description: CORS, caching, and redirect settings for headless WordPress
 */

// CORS headers for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed = array(
            'http://localhost:3000',
            'https://www.echo-media.info',
            'https://echo-media.info'
        );
        if (in_array($origin, $allowed)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }
        return $value;
    });
});

// Prevent caching of REST API responses
add_filter('rest_post_dispatch', function($response) {
    $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    $response->header('Pragma', 'no-cache');
    $response->header('Expires', '0');
    return $response;
});

// Trigger frontend rebuild on post publish/update/delete
add_action('transition_post_status', function($new_status, $old_status, $post) {
    if ($post->post_type !== 'post') return;
    if ($new_status !== 'publish' && $old_status !== 'publish') return;
    if ($new_status === $old_status && $new_status !== 'publish') return;
    if (!defined('GH_REBUILD_TOKEN')) return;

    wp_remote_post('https://api.github.com/repos/huuaho/umg-headless/dispatches', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . GH_REBUILD_TOKEN,
            'Accept'        => 'application/vnd.github+json',
            'Content-Type'  => 'application/json',
        ),
        'body' => json_encode(array(
            'event_type' => 'deploy-echo-media',
        )),
        'timeout' => 10,
    ));
}, 10, 3);

// Redirect frontend to main site
add_action('template_redirect', function() {
    if (!is_admin() && !str_starts_with($_SERVER['REQUEST_URI'], '/wp-json')) {
        wp_redirect('https://www.echo-media.info', 301);
        exit;
    }
});
