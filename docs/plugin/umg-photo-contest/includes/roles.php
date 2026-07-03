<?php
/**
 * UMG Photo Contest - Judge Role & Capability Helpers
 *
 * Registers the "Contest Judge" role and the capabilities that gate the
 * judging REST endpoints:
 *   - umgpc_judge_submissions : may list/read submitted entries and save
 *                               their own scores (judges + administrators)
 *   - umgpc_admin_results     : may read cross-judge aggregated results
 *                               (administrators only)
 *
 * Registration runs idempotently on init (not only on plugin activation) so
 * deploying updated plugin files to a live install takes effect without a
 * deactivate/reactivate cycle.
 */

if (!defined('ABSPATH')) exit;

add_action('init', 'umgpc_register_roles');

function umgpc_register_roles() {
    // Judge role: created once (add_role returns null if it already exists).
    if (!get_role('umgpc_judge')) {
        add_role('umgpc_judge', 'Contest Judge', array(
            'read'                     => true,
            'umgpc_judge_submissions'  => true,
        ));
    }

    // Administrators can judge and see aggregated results.
    $admin = get_role('administrator');
    if ($admin) {
        if (!$admin->has_cap('umgpc_judge_submissions')) {
            $admin->add_cap('umgpc_judge_submissions');
        }
        if (!$admin->has_cap('umgpc_admin_results')) {
            $admin->add_cap('umgpc_admin_results');
        }
    }
}

/**
 * Validate the request's Bearer token AND require a capability.
 *
 * Authenticated ≠ authorized: request-code creates a subscriber for any
 * email, so every judging endpoint must assert the capability itself.
 *
 * @param WP_REST_Request $request
 * @param string          $cap     Capability to require.
 * @return int|WP_Error User ID when authorized; WP_Error 401/403 otherwise.
 */
function umgpc_require_cap(WP_REST_Request $request, $cap) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) {
        return $user_id; // 401 — missing/invalid/expired token
    }

    if (!user_can($user_id, $cap)) {
        return new WP_Error('forbidden', 'You are not authorized to access this resource.', array('status' => 403));
    }

    return $user_id;
}

/**
 * Whether judge-facing views hide entrant PII (blind judging).
 * Stored as a WP option so it can be flipped without a deploy;
 * defaults to ON (safest — entries contain minors' PII).
 */
function umgpc_is_blind_judging() {
    return get_option('umgpc_blind_judging', '1') === '1';
}
