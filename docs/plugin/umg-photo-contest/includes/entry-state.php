<?php
/**
 * UMG Photo Contest - Shared Entry Lifecycle
 *
 * ONE implementation of the draft → submitted → paid state machine, used by
 * both the individual flow (submission.php) and the school flow (school.php).
 * Route handlers keep only what genuinely differs between the flows —
 * ownership and lookup; every status transition and guard lives here.
 */

if (!defined('ABSPATH')) exit;

/**
 * Whether the entry's fee has been paid.
 *
 * The two flows record payment differently: school applications carry it as
 * post meta (credited per-application by the batch checkout webhook), while
 * individual entrants carry it as user meta on the author. Checking both
 * here is what lets every caller stay payment-model-agnostic.
 */
function umgpc_entry_is_paid($post_id) {
    if (get_post_meta($post_id, 'umgpc_payment_status', true) === 'paid') {
        return true;
    }
    $post = get_post($post_id);
    return $post
        && get_user_meta($post->post_author, 'umgpc_payment_status', true) === 'paid';
}

/**
 * Flip a draft entry to submitted.
 *
 * @return true|WP_Error
 */
function umgpc_entry_submit($post_id) {
    if (get_post_meta($post_id, 'umgpc_status', true) === 'submitted') {
        return new WP_Error('already_submitted', 'Entry has already been submitted.', array('status' => 400));
    }

    update_post_meta($post_id, 'umgpc_status', 'submitted');
    update_post_meta($post_id, 'umgpc_submitted_at', current_time('mysql'));

    return true;
}

/**
 * Revert a submitted entry to draft so it can be edited before payment.
 * Blocked once paid — per the rights statement, paid entries are final.
 *
 * @return true|WP_Error
 */
function umgpc_entry_unsubmit($post_id) {
    if (get_post_meta($post_id, 'umgpc_status', true) !== 'submitted') {
        return new WP_Error('not_submitted', 'Entry has not been submitted.', array('status' => 400));
    }

    if (umgpc_entry_is_paid($post_id)) {
        return new WP_Error('entry_final', 'Entries are final after payment and can no longer be edited.', array('status' => 403));
    }

    update_post_meta($post_id, 'umgpc_status', 'draft');
    delete_post_meta($post_id, 'umgpc_submitted_at');

    return true;
}
