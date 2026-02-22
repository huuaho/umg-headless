<?php
/**
 * Plugin Name: United Media Ingestor
 * Description: Aggregates posts from multiple WP sites + headless CORS/cache/redirect config.
 * Version: 0.9.0
 */

if (!defined('ABSPATH')) exit;

define('UMI_PATH', plugin_dir_path(__FILE__));
define('UMI_URL', plugin_dir_url(__FILE__));

require_once UMI_PATH . 'includes/config.php';
require_once UMI_PATH . 'includes/helpers.php';
require_once UMI_PATH . 'includes/http.php';
require_once UMI_PATH . 'includes/normalize.php';
require_once UMI_PATH . 'includes/mapping.php';
require_once UMI_PATH . 'includes/storage.php';
require_once UMI_PATH . 'includes/backfill.php';
require_once UMI_PATH . 'includes/incremental.php';
require_once UMI_PATH . 'includes/cron.php';
require_once UMI_PATH . 'includes/admin-endpoints.php';
require_once UMI_PATH . 'includes/rest-api.php';
require_once UMI_PATH . 'includes/search.php';

/* =========================================================
   Headless config (CORS, caching, redirect)
   ========================================================= */

// CORS headers for REST API (origins defined in config.php → um_allowed_origins())
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        if (in_array($origin, um_allowed_origins())) {
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

// Redirect frontend to main site (URL defined in config.php → UMI_REDIRECT_URL)
add_action('template_redirect', function() {
    if (!is_admin() && !str_starts_with($_SERVER['REQUEST_URI'], '/wp-json')) {
        wp_redirect(UMI_REDIRECT_URL, 301);
        exit;
    }
});

/* =========================================================
   Activation / Deactivation hooks
   ========================================================= */

register_activation_hook(__FILE__, 'um_activate_plugin');
register_deactivation_hook(__FILE__, 'um_unschedule_cron_events');

/**
 * Plugin activation - populate taxonomy terms and schedule cron
 */
function um_activate_plugin() {
    // Schedule cron events
    um_schedule_cron_events();

    // Populate um_category terms from mapping
    um_populate_category_terms();

    // Flush rewrite rules
    flush_rewrite_rules();
}

/**
 * Populate all um_category terms from mapping definitions
 */
function um_populate_category_terms() {
    // Create parent categories
    $parents = um_category_parents();

    foreach ($parents as $slug => $name) {
        if (!term_exists($slug, 'um_category')) {
            $result = wp_insert_term($name, 'um_category', array(
                'slug' => $slug,
                'description' => '',
            ));

            if (is_wp_error($result)) {
                um_log('Failed to create parent category: ' . $slug . ' - ' . $result->get_error_message(), 'error');
            }
        }
    }

    // Create child categories
    $children = um_category_children_spec();

    foreach ($children as $child_slug => $child_data) {
        if (!term_exists($child_slug, 'um_category')) {
            $parent_slug = isset($child_data['parent']) ? $child_data['parent'] : '';
            $parent_term = $parent_slug ? get_term_by('slug', $parent_slug, 'um_category') : false;

            if (!$parent_term) {
                um_log('Parent category not found for child: ' . $child_slug . ' (parent: ' . $parent_slug . ')', 'error');
                continue;
            }

            $result = wp_insert_term($child_data['name'], 'um_category', array(
                'slug' => $child_slug,
                'description' => isset($child_data['desc']) ? $child_data['desc'] : '',
                'parent' => $parent_term->term_id,
            ));

            if (is_wp_error($result)) {
                um_log('Failed to create child category: ' . $child_slug . ' - ' . $result->get_error_message(), 'error');
            }
        }
    }
}
