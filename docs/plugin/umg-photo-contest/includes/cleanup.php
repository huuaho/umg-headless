<?php
/**
 * UMG Photo Contest - Orphan Draft Cleanup
 *
 * Weekly cron job that deletes draft submissions with no activity for 90+ days.
 * Removes attached media (photos) from Media Library before deleting the post.
 */

if (!defined('ABSPATH')) exit;

add_action('umgpc_cleanup_orphaned_drafts', 'umgpc_run_cleanup');

/**
 * Find and delete orphaned drafts older than 90 days.
 */
function umgpc_run_cleanup() {
    $cutoff = date('Y-m-d H:i:s', strtotime('-90 days'));

    $q = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => 'publish',
        'posts_per_page' => 50,
        'meta_query'     => array(
            array(
                'key'   => 'umgpc_status',
                'value' => 'draft',
            ),
        ),
        'date_query' => array(
            array(
                'column' => 'post_modified',
                'before' => $cutoff,
            ),
        ),
        'no_found_rows' => true,
    ));

    foreach ($q->posts as $post) {
        // Delete attached photos from Media Library
        for ($i = 1; $i <= 3; $i++) {
            $media_id = (int) get_post_meta($post->ID, "umgpc_photo_{$i}_id", true);
            if ($media_id) {
                wp_delete_attachment($media_id, true);
            }
        }

        // Delete the draft post
        wp_delete_post($post->ID, true);
    }
}
