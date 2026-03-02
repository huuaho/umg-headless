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
