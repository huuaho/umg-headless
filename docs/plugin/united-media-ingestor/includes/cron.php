<?php
/**
 * United Media Ingestor – Cron scheduling
 *
 * Responsibilities:
 * - Register custom cron intervals
 * - Schedule/unschedule cron events
 * - Dispatch backfill + incremental runners
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Cron intervals
   ========================================================= */

add_filter('cron_schedules', function ($schedules) {

    if (!isset($schedules['um_every_minute'])) {
        $schedules['um_every_minute'] = array(
            'interval' => 60,
            'display'  => 'Every 1 minute (UM)',
        );
    }

    if (!isset($schedules['um_every_5_minutes'])) {
        $schedules['um_every_5_minutes'] = array(
            'interval' => 5 * 60,
            'display'  => 'Every 5 minutes (UM)',
        );
    }

    if (!isset($schedules['um_every_15_minutes'])) {
        $schedules['um_every_15_minutes'] = array(
            'interval' => 15 * 60,
            'display'  => 'Every 15 minutes (UM)',
        );
    }

    return $schedules;
});

/* =========================================================
   Scheduling on activation / deactivation
   ========================================================= */

function um_schedule_cron_events() {

    // Incremental updates (new posts)
    if (UMI_ENABLE_INCREMENTAL && !wp_next_scheduled('um_cron_incremental')) {
        wp_schedule_event(time() + 120, 'um_every_5_minutes', 'um_cron_incremental');
    }

    // Backfill continuation (archive)
    if (UMI_ENABLE_AUTORUN_BACKFILL && !wp_next_scheduled('um_cron_backfill')) {
        wp_schedule_event(time() + 300, 'um_every_15_minutes', 'um_cron_backfill');
    }
}

function um_unschedule_cron_events() {

    $ts = wp_next_scheduled('um_cron_incremental');
    if ($ts) {
        wp_unschedule_event($ts, 'um_cron_incremental');
    }

    $ts2 = wp_next_scheduled('um_cron_backfill');
    if ($ts2) {
        wp_unschedule_event($ts2, 'um_cron_backfill');
    }

    $ts3 = wp_next_scheduled('um_cron_server_backfill');
    if ($ts3) {
        wp_unschedule_event($ts3, 'um_cron_server_backfill');
    }
}

/**
 * NOTE:
 * These hooks must be registered from the MAIN plugin file,
 * not from this include. The main file should call:
 *
 * register_activation_hook(__FILE__, 'um_schedule_cron_events');
 * register_deactivation_hook(__FILE__, 'um_unschedule_cron_events');
 */

/* =========================================================
   Cron handlers
   ========================================================= */

add_action('um_cron_incremental', function () {
    if (!UMI_ENABLE_INCREMENTAL) return;

    // Quiet run; output suppressed
    um_run_incremental_once();
});

add_action('um_cron_backfill', function () {
    if (!UMI_ENABLE_AUTORUN_BACKFILL) return;

    // Gentle continuation of archive ingestion
    um_run_backfill_batch(um_sites_config());
});

add_action('um_cron_server_backfill', function () {
    // Check if server backfill is enabled
    if (!get_option('um_server_backfill_active', false)) {
        return;
    }

    // Run backfill batch
    $result = um_run_backfill_batch(um_sites_config());

    // Update last run time
    update_option('um_server_backfill_last_run', time(), false);

    // Check if backfill is complete
    if (!empty($result['state']['done'])) {
        // Stop server backfill automatically
        um_stop_server_backfill();
        update_option('um_server_backfill_completed', time(), false);
    }
});

/* =========================================================
   Server Backfill Control Functions
   ========================================================= */

/**
 * Start aggressive server-side backfill
 */
function um_start_server_backfill() {
    // Enable the flag
    update_option('um_server_backfill_active', true, false);
    update_option('um_server_backfill_started', time(), false);
    delete_option('um_server_backfill_completed');

    // Schedule cron if not already scheduled
    if (!wp_next_scheduled('um_cron_server_backfill')) {
        wp_schedule_event(time() + 10, 'um_every_minute', 'um_cron_server_backfill');
    }
}

/**
 * Stop server-side backfill
 */
function um_stop_server_backfill() {
    // Disable the flag
    update_option('um_server_backfill_active', false, false);

    // Unschedule cron event
    $ts = wp_next_scheduled('um_cron_server_backfill');
    if ($ts) {
        wp_unschedule_event($ts, 'um_cron_server_backfill');
    }
}

/**
 * Check if server backfill is currently active
 */
function um_is_server_backfill_active() {
    return (bool) get_option('um_server_backfill_active', false);
}

/**
 * Get server backfill status
 */
function um_get_server_backfill_status() {
    $active = um_is_server_backfill_active();
    $started = get_option('um_server_backfill_started', 0);
    $last_run = get_option('um_server_backfill_last_run', 0);
    $completed = get_option('um_server_backfill_completed', 0);

    return array(
        'active' => $active,
        'started' => $started,
        'last_run' => $last_run,
        'completed' => $completed,
        'next_run' => wp_next_scheduled('um_cron_server_backfill'),
    );
}
