<?php
/**
 * United Media Ingestor – Shared Helpers
 *
 * Responsibilities:
 * - Locks (prevent overlapping runs)
 * - Backfill / incremental state helpers
 * - Simple utility helpers
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Locking (prevent concurrent ingest)
   ========================================================= */

function um_lock_key() {
    return 'um_ingest_lock_v1';
}

/**
 * Acquire an atomic lock using wp_options.
 *
 * Uses add_option() for atomic INSERT (prevents two processes both
 * acquiring on first run). Falls back to expiration check + overwrite
 * for expired locks.
 *
 * @param int $ttl_seconds Lock duration in seconds
 * @return bool True if lock acquired, false if already held
 */
function um_acquire_lock($ttl_seconds = UMI_INGEST_LOCK_TTL) {
    $now = time();
    $key = um_lock_key();
    $value = array('expires' => $now + intval($ttl_seconds));

    // Atomic insert — only succeeds if key doesn't exist yet
    if (add_option($key, $value, '', 'no')) {
        return true;
    }

    // Key exists — check if lock is expired
    $existing = get_option($key);
    if (is_array($existing) && !empty($existing['expires']) && $existing['expires'] > $now) {
        return false; // Lock is still valid
    }

    // Lock is expired — overwrite it
    update_option($key, $value, false);
    return true;
}

/**
 * Release the ingest lock.
 */
function um_release_lock() {
    delete_option(um_lock_key());
}

/* =========================================================
   Backfill state helpers
   ========================================================= */

function um_backfill_state_key() {
    return 'um_backfill_state_v1';
}

function um_backfill_get_state() {
    $state = get_option(um_backfill_state_key(), array());
    return is_array($state) ? $state : array();
}

function um_backfill_set_state($state) {
    update_option(um_backfill_state_key(), $state, false);
}

function um_backfill_reset_state() {
    delete_option(um_backfill_state_key());
}

/* =========================================================
   Incremental "since" cursor helpers
   ========================================================= */

function um_since_key($site_id) {
    return 'um_since_' . sanitize_key($site_id);
}

function um_get_since($site_id) {
    $v = get_option(um_since_key($site_id), '');
    return is_string($v) ? $v : '';
}

function um_set_since($site_id, $iso8601) {
    update_option(um_since_key($site_id), (string)$iso8601, false);
}

function um_reset_all_since() {
    foreach (um_sites_config() as $s) {
        delete_option(um_since_key($s['id']));
    }
}

/* =========================================================
   Autorun toggle
   ========================================================= */

function um_autorun_key() {
    return 'um_backfill_autorun_enabled';
}

function um_autorun_is_enabled() {
    return (bool) get_option(um_autorun_key(), false);
}

function um_autorun_set($enabled) {
    update_option(um_autorun_key(), $enabled ? 1 : 0, false);
}

/* =========================================================
   Logging
   ========================================================= */

/**
 * Log a message to the WordPress debug log.
 * Only logs when WP_DEBUG and WP_DEBUG_LOG are enabled.
 *
 * @param string $message Log message
 * @param string $level   'info', 'warn', or 'error'
 */
function um_log($message, $level = 'info') {
    if (!defined('WP_DEBUG') || !WP_DEBUG) {
        return;
    }

    $prefix = '[UM]';
    if ($level === 'error') {
        $prefix = '[UM ERROR]';
    } else if ($level === 'warn') {
        $prefix = '[UM WARN]';
    }

    error_log($prefix . ' ' . $message);
}

/* =========================================================
   Upsert result tallying
   ========================================================= */

/**
 * Tally an upsert result into counter variables.
 * Extracts the duplicated counting logic from backfill and incremental.
 *
 * @param array $result  Return value from um_upsert_article()
 * @param int   &$inserted  Counter for inserted articles
 * @param int   &$updated   Counter for updated articles
 * @param int   &$skipped   Counter for skipped articles
 * @param int   &$failed    Counter for failed articles
 */
function um_tally_upsert_result($result, &$inserted, &$updated, &$skipped, &$failed) {
    if (empty($result['ok'])) {
        $failed++;
        return;
    }

    if (!empty($result['skipped'])) {
        $skipped++;
        return;
    }

    if (!empty($result['action']) && $result['action'] === 'inserted') {
        $inserted++;
    } else {
        $updated++;
    }
}

/* =========================================================
   Small utilities
   ========================================================= */

/**
 * Normalize strings (HTML decode, trim, collapse whitespace).
 */
function um_normalize_text($s) {
    $s = wp_strip_all_tags((string)$s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

/**
 * Safe array getter.
 */
function um_array_get($arr, $key, $default = null) {
    return is_array($arr) && array_key_exists($key, $arr) ? $arr[$key] : $default;
}
