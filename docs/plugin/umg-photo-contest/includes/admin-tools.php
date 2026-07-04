<?php
/**
 * UMG Photo Contest - Admin Tools
 *
 * A wp-admin-only maintenance page (Tools > Retitle Submissions) for
 * one-time/occasional bulk maintenance that must NOT be reachable through
 * the plugin's REST API. The JWT auth used everywhere else in this plugin
 * only ever grants "subscriber"-level access (every account created via
 * request-code is a subscriber, see includes/auth.php) — there is no
 * capability tier above that, so any action that needs to touch *all*
 * submissions regardless of owner must be gated by WordPress's own native
 * admin session (current_user_can), not a bearer token any applicant could
 * hold. Safe to leave installed permanently: every action here is
 * idempotent and only touches post_title, never application content.
 */

if (!defined('ABSPATH')) exit;

add_action('admin_menu', function () {
    add_management_page(
        'Retitle Submissions',
        'Retitle Submissions',
        'manage_options',
        'umgpc-retitle-submissions',
        'umgpc_render_retitle_page'
    );
});

/**
 * Recompute the post_title for every umg_submission post from its
 * currently-stored owner/name meta, regardless of status or owner.
 * Reuses the same title-computation helpers the REST endpoints use
 * (umgpc_compute_draft_title in draft.php, umgpc_school_compute_title in
 * school.php) so the format is identical either way. Posts with no name
 * entered yet are left untouched (nothing meaningful to title them with).
 *
 * @return array{retitled:int,skipped:int}
 */
function umgpc_retitle_all_submissions() {
    $retitled = 0;
    $skipped = 0;

    $q = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
    ));

    foreach ($q->posts as $post_id) {
        $owner_id = (int) get_post_meta($post_id, 'umgpc_user_id', true);
        if (!$owner_id) {
            $skipped++;
            continue;
        }

        $is_school_batch = get_post_meta($post_id, 'umgpc_school_batch', true) === '1';

        $title = $is_school_batch
            ? umgpc_school_compute_title($post_id, $owner_id)
            : umgpc_compute_draft_title($post_id, $owner_id);

        // umgpc_school_compute_title() can return WP_Error('lock_busy', ...)
        // under rare contention, distinct from null ("no name yet") — both
        // mean "nothing to do this pass" here; re-running this tool retries
        // any WP_Error skips (lock contention is transient), while a null
        // skip only resolves once a name is entered.
        if (!is_string($title)) {
            $skipped++;
            continue;
        }

        wp_update_post(array('ID' => $post_id, 'post_title' => $title));
        $retitled++;
    }

    return array('retitled' => $retitled, 'skipped' => $skipped);
}

function umgpc_render_retitle_page() {
    if (!current_user_can('manage_options')) {
        wp_die('You do not have permission to access this page.');
    }

    $result = null;

    if (
        isset($_POST['umgpc_retitle_nonce'])
        && wp_verify_nonce($_POST['umgpc_retitle_nonce'], 'umgpc_retitle_submissions')
    ) {
        $result = umgpc_retitle_all_submissions();
    }

    echo '<div class="wrap"><h1>Retitle Submissions</h1>';
    echo '<p>Recomputes the wp-admin title of every submission (individual and school) '
        . 'from its currently-stored applicant name and account email — '
        . '<code>"{Name} - {email}"</code> for individual entries, '
        . '<code>"School Application #N {Name} - {email}"</code> for school-batch entries. '
        . 'Entries with no name entered yet are left as-is. Safe to run more than once.</p>';

    if ($result !== null) {
        printf(
            '<div class="notice notice-success"><p>Retitled %d submission(s); %d skipped (no name on file yet).</p></div>',
            (int) $result['retitled'],
            (int) $result['skipped']
        );
    }

    echo '<form method="post">';
    wp_nonce_field('umgpc_retitle_submissions', 'umgpc_retitle_nonce');
    submit_button('Retitle all submissions now');
    echo '</form></div>';
}
