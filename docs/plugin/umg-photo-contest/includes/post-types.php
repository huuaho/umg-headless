<?php
/**
 * UMG Photo Contest - Custom Post Types
 */

if (!defined('ABSPATH')) exit;

add_action('init', 'umgpc_register_post_types');

/**
 * Register the umg_submission CPT.
 * Not public - used as internal data store, visible in wp-admin for management.
 */
function umgpc_register_post_types() {
    register_post_type('umg_submission', array(
        'labels' => array(
            'name'          => 'Submissions',
            'singular_name' => 'Submission',
            'menu_name'     => 'Photo Contest',
        ),
        'public'              => false,
        'publicly_queryable'  => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'supports'            => array('title', 'custom-fields'),
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
        'menu_icon'           => 'dashicons-camera',
    ));
}

/**
 * Cascade-delete a submission's attached photos and student-proof document
 * whenever the post itself is permanently deleted, regardless of how the
 * deletion happens (wp-admin "Delete Permanently", WP-CLI, the cleanup cron,
 * or a plugin endpoint). WordPress core does NOT do this by default —
 * wp_delete_post() only detaches child attachments (sets their post_parent
 * to 0), it doesn't delete them, which otherwise leaves orphaned Media
 * Library items behind every time a submission is removed outside the
 * plugin's own delete endpoints.
 */
add_action('before_delete_post', 'umgpc_cascade_delete_submission_media', 10, 2);

function umgpc_cascade_delete_submission_media($post_id, $post) {
    if (!$post || $post->post_type !== 'umg_submission') return;

    for ($i = 1; $i <= 3; $i++) {
        $media_id = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
        if ($media_id) {
            wp_delete_attachment($media_id, true);
        }
    }

    $proof_id = (int) get_post_meta($post_id, 'umgpc_student_proof_id', true);
    if ($proof_id) {
        wp_delete_attachment($proof_id, true);
    }
}
