<?php
/**
 * UMG Photo Contest - Submission Endpoint
 *
 * POST /umg/v1/submit — finalize draft into a submitted entry
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    // POST /umg/v1/submit
    register_rest_route('umg/v1', '/submit', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_submit_entry',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/unsubmit
    register_rest_route('umg/v1', '/unsubmit', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_unsubmit_entry',
        'permission_callback' => '__return_true',
    ));
});

/**
 * POST /umg/v1/submit
 *
 * Changes draft status to "submitted" and sets submitted_at timestamp.
 * No re-upload needed — photos are already in Media Library.
 */
function umgpc_submit_entry(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);
    if (!$post_id) {
        return new WP_Error('no_draft', 'No draft found to submit.', array('status' => 404));
    }

    $result = umgpc_entry_submit($post_id);
    if (is_wp_error($result)) return $result;

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/unsubmit
 *
 * Reverts a submitted entry to draft so the entrant can edit it before
 * paying. Guards (not-paid, must-be-submitted) live in entry-state.php.
 */
function umgpc_unsubmit_entry(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);
    if (!$post_id) {
        return new WP_Error('no_draft', 'No entry found.', array('status' => 404));
    }

    $result = umgpc_entry_unsubmit($post_id);
    if (is_wp_error($result)) return $result;

    return rest_ensure_response(array('success' => true));
}
