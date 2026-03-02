<?php
/**
 * Plugin Name: UMG Photo Contest
 * Description: Passwordless auth, Stripe payment, draft management, and photo submission for the UMG photography competition.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

define('UMGPC_PATH', plugin_dir_path(__FILE__));

require_once UMGPC_PATH . 'includes/config.php';
require_once UMGPC_PATH . 'includes/cors.php';
require_once UMGPC_PATH . 'includes/post-types.php';
require_once UMGPC_PATH . 'includes/jwt.php';
require_once UMGPC_PATH . 'includes/auth.php';
require_once UMGPC_PATH . 'includes/payment.php';
require_once UMGPC_PATH . 'includes/draft.php';
require_once UMGPC_PATH . 'includes/submission.php';
require_once UMGPC_PATH . 'includes/cleanup.php';

/* =========================================================
   Activation / Deactivation
   ========================================================= */

register_activation_hook(__FILE__, function () {
    // Trigger CPT registration so flush works
    umgpc_register_post_types();
    flush_rewrite_rules();

    // Schedule cleanup cron
    if (!wp_next_scheduled('umgpc_cleanup_orphaned_drafts')) {
        wp_schedule_event(time(), 'weekly', 'umgpc_cleanup_orphaned_drafts');
    }
});

register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook('umgpc_cleanup_orphaned_drafts');
    flush_rewrite_rules();
});
