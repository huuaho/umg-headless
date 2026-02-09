<?php
/**
 * Plugin Name: IS Headless Config
 * Description: CORS, caching, and redirect settings for headless WordPress
 */

// CORS headers for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed = array(
            'http://localhost:3000',
            'https://www.internationalspectrum.org',
            'https://internationalspectrum.org'
        );
        if (in_array($origin, $allowed)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }
        return $value;
    });
});

// Register video_url custom field for REST API (Video Interviews)
add_action('init', function() {
    register_post_meta('post', 'video_url', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'default'       => '',
    ));
});

// Add a dedicated "Video URL" meta box (replaces raw Custom Fields panel)
add_action('add_meta_boxes', function() {
    add_meta_box(
        'is_video_url',
        'Video URL (YouTube)',
        function($post) {
            $value = get_post_meta($post->ID, 'video_url', true);
            wp_nonce_field('is_video_url_nonce', 'is_video_url_nonce');
            echo '<input type="url" name="video_url" value="' . esc_attr($value) . '" style="width:100%;" placeholder="https://www.youtube.com/watch?v=..." />';
            echo '<p class="description">Paste a YouTube URL. This will display as an embedded video on the article page.</p>';
        },
        'post',
        'side',
        'default'
    );
});

// Save the video_url meta box value
add_action('save_post', function($post_id) {
    if (!isset($_POST['is_video_url_nonce']) || !wp_verify_nonce($_POST['is_video_url_nonce'], 'is_video_url_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['video_url'])) {
        update_post_meta($post_id, 'video_url', sanitize_url($_POST['video_url']));
    }
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
            'event_type' => 'deploy-international-spectrum',
        )),
        'timeout' => 10,
    ));
}, 10, 3);

// Redirect frontend to main site (TEMPORARILY DISABLED for WP access)
// add_action('template_redirect', function() {
//     if (!is_admin() && !str_starts_with($_SERVER['REQUEST_URI'], '/wp-json')) {
//         wp_redirect('https://www.internationalspectrum.org', 301);
//         exit;
//     }
// });
