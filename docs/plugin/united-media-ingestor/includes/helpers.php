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
 * Acquire a transient lock.
 * Returns true if acquired, false if already locked.
 */
function um_acquire_lock($ttl_seconds = UMI_INGEST_LOCK_TTL) {
    $now = time();
    $lock = get_transient(um_lock_key());

    if (is_array($lock) && !empty($lock['expires']) && $lock['expires'] > $now) {
        return false;
    }

    set_transient(
        um_lock_key(),
        array('expires' => $now + intval($ttl_seconds)),
        intval($ttl_seconds)
    );

    return true;
}

/**
 * Release the ingest lock.
 */
function um_release_lock() {
    delete_transient(um_lock_key());
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
