<?php
/**
 * United Media Ingestor – REST API
 *
 * Responsibilities:
 * - Expose local aggregated articles for display/search
 * - Filter excluded items
 * - Never serve full article pages (redirect to source instead)
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   REST route registration
   ========================================================= */

add_action('rest_api_init', function () {

    register_rest_route('um/v1', '/articles', array(
        'methods'  => 'GET',
        'callback' => 'um_rest_get_articles',
        'permission_callback' => '__return_true',
        'args' => array(
            'search' => array(
                'description' => 'Full-text search query',
                'type'        => 'string',
            ),
            'source' => array(
                'description' => 'Source site id',
                'type'        => 'string',
            ),
            'category' => array(
                'description' => 'UM category slug',
                'type'        => 'string',
            ),
            'page' => array(
                'description' => 'Page number',
                'type'        => 'integer',
                'default'     => 1,
            ),
            'per_page' => array(
                'description' => 'Items per page',
                'type'        => 'integer',
                'default'     => 20,
            ),
            'include_excluded' => array(
                'description' => 'Include excluded items',
                'type'        => 'boolean',
                'default'     => false,
            ),
            'include_content' => array(
                'description' => 'Include full plaintext content',
                'type'        => 'boolean',
                'default'     => false,
            ),
        ),
    ));
});

/* =========================================================
   REST callback
   ========================================================= */

function um_rest_get_articles(WP_REST_Request $request) {

    $page     = max(1, intval($request->get_param('page')));
    $per_page = min(100, max(1, intval($request->get_param('per_page'))));
    $search   = trim((string)$request->get_param('search'));
    $source   = sanitize_key((string)$request->get_param('source'));
    $category = sanitize_key((string)$request->get_param('category'));
    $include_excluded = (bool)$request->get_param('include_excluded');
    $include_content = (bool)$request->get_param('include_content');

    $meta_query = array();

    if (!$include_excluded) {
        $meta_query[] = array(
            'relation' => 'OR',
            array(
                'key'     => UMI_EXCLUDED_META_KEY,
                'compare' => 'NOT EXISTS',
            ),
            array(
                'key'     => UMI_EXCLUDED_META_KEY,
                'value'   => '0',
                'compare' => '=',
            ),
        );
    }

    if ($source) {
        $meta_query[] = array(
            'key'   => UMI_SOURCE_SITE_META_KEY,
            'value' => $source,
        );
    }

    $args = array(
        'post_type'      => 'um_article',
        'post_status'    => array('publish','private'),
        'posts_per_page' => $per_page,
        'paged'          => $page,
        's'              => $search ?: null,
        'meta_query'     => $meta_query ?: null,
        'meta_key'       => 'um_date_gmt',
        'orderby'        => 'meta_value',
        'order'          => 'DESC',
        'no_found_rows'  => false,
    );

    if ($category) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'um_category',
                'field'    => 'slug',
                'terms'    => $category,
            ),
        );
    }

    $q = new WP_Query($args);

    $items = array();

    foreach ($q->posts as $p) {
        // Get categories for this post
        $categories = array();
        $parent_category = '';
        $terms = get_the_terms($p->ID, 'um_category');

        if ($terms && !is_wp_error($terms)) {
            foreach ($terms as $term) {
                $categories[] = array(
                    'id' => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'parent' => $term->parent,
                );

                // Find the parent category (top-level bucket)
                if (empty($parent_category) && $term->parent !== 0) {
                    // This is a child category, get its parent
                    $parent_term = get_term($term->parent, 'um_category');
                    if ($parent_term && !is_wp_error($parent_term)) {
                        $parent_category = $parent_term->name;
                    }
                } elseif (empty($parent_category) && $term->parent === 0) {
                    // This is already a parent category
                    $parent_category = $term->name;
                }
            }
        }

        // Calculate read time (based on 200 words per minute)
        $word_count = (int)get_post_meta($p->ID, 'um_word_count', true);
        $read_time_minutes = 0;
        if ($word_count > 0) {
            $read_time_minutes = max(1, ceil($word_count / 200));
        }

        $item = array(
            'id'              => $p->ID,
            'title'           => get_the_title($p),
            'slug'            => get_post_meta($p->ID, 'um_remote_slug', true),
            'date'            => get_post_meta($p->ID, 'um_date_gmt', true) ?: get_the_date('c', $p),
            'source'          => get_post_meta($p->ID, UMI_SOURCE_SITE_META_KEY, true),
            'source_label'    => get_post_meta($p->ID, 'um_source_label', true),
            'source_url'      => get_post_meta($p->ID, UMI_SOURCE_URL_META_KEY, true),
            'excerpt'         => wp_trim_words($p->post_content, 30),
            'featured_image'  => get_post_meta($p->ID, 'um_featured_image_url', true),
            'images'          => json_decode(get_post_meta($p->ID, 'um_image_urls', true), true) ?: array(),
            'author_name'     => get_post_meta($p->ID, 'um_author_name', true),
            'category'        => $parent_category,            // Parent category (unified bucket) for cards
            'categories'      => $categories,                 // Full array for advanced use
            'read_time_minutes' => $read_time_minutes,       // Estimated read time
            'is_excluded'     => (bool)get_post_meta($p->ID, UMI_EXCLUDED_META_KEY, true),
        );

        // Optionally include full plaintext content (can be large)
        if ($include_content) {
            $item['content'] = get_post_meta($p->ID, 'um_plaintext', true);
        }

        $items[] = $item;
    }

    return rest_ensure_response(array(
        'page'       => $page,
        'per_page'   => $per_page,
        'total'      => intval($q->found_posts),
        'total_pages'=> intval($q->max_num_pages),
        'items'      => $items,
    ));
}
