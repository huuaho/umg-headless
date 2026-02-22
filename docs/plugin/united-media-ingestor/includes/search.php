<?php
/**
 * Search functionality for United Media Ingestor
 *
 * Intercepts WordPress search and displays only ingested articles (um_article CPT)
 * with full-text search across title, excerpt, and plaintext content.
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Template Loading
   ========================================================= */

/**
 * Override search template to use our custom template
 * Uses template_include with very high priority to override Divi
 */
function um_search_template_override($template) {
    if (is_search()) {
        $search_query = get_search_query();

        if (!empty($search_query)) {
            // Use our custom template
            $custom_template = plugin_dir_path(__FILE__) . '../templates/search-results.php';

            if (file_exists($custom_template)) {
                return $custom_template;
            }
        }
    }

    return $template;
}
add_filter('template_include', 'um_search_template_override', PHP_INT_MAX);

/* =========================================================
   Search Query Functions
   ========================================================= */

/**
 * Get search results for ingested articles
 *
 * @param string $search_term The search query
 * @param int $page Page number for pagination
 * @param int $per_page Results per page
 * @return WP_Query Query object with results
 */
function um_get_search_results($search_term, $page = 1, $per_page = 20) {
    // Store search term globally for filters
    global $um_current_search_term;
    $um_current_search_term = $search_term;

    $args = array(
        'post_type' => 'um_article',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'post_status' => 'publish',
        'orderby' => 'meta_value',
        'meta_key' => 'um_date_gmt',
        'order' => 'DESC',
        'meta_query' => array(
            'relation' => 'OR',
            array(
                'key' => 'um_is_excluded',
                'compare' => 'NOT EXISTS',
            ),
            array(
                'key' => 'um_is_excluded',
                'value' => '1',
                'compare' => '!=',
            ),
        ),
    );

    // Add custom search filters
    add_filter('posts_where', 'um_search_where_custom', 10, 2);
    add_filter('posts_join', 'um_search_join_custom', 10, 2);
    add_filter('posts_groupby', 'um_search_groupby_custom', 10, 2);

    $query = new WP_Query($args);

    // Remove filters after query
    remove_filter('posts_where', 'um_search_where_custom', 10);
    remove_filter('posts_join', 'um_search_join_custom', 10);
    remove_filter('posts_groupby', 'um_search_groupby_custom', 10);

    return $query;
}

/**
 * Modify WHERE clause to search title, excerpt, and um_plaintext
 *
 * @param string $where WHERE clause
 * @param WP_Query $query Query object
 * @return string Modified WHERE clause
 */
function um_search_where_custom($where, $query) {
    global $wpdb, $um_current_search_term;

    if (empty($um_current_search_term)) {
        return $where;
    }

    // Sanitize search term
    $search_term = '%' . $wpdb->esc_like($um_current_search_term) . '%';

    // Search in title, post_content (excerpt), and um_plaintext meta
    $search_clause = $wpdb->prepare(
        " AND (
            {$wpdb->posts}.post_title LIKE %s
            OR {$wpdb->posts}.post_content LIKE %s
            OR mt_plaintext.meta_value LIKE %s
        )",
        $search_term,
        $search_term,
        $search_term
    );

    $where .= $search_clause;

    return $where;
}

/**
 * Join postmeta table for um_plaintext field
 *
 * @param string $join JOIN clause
 * @param WP_Query $query Query object
 * @return string Modified JOIN clause
 */
function um_search_join_custom($join, $query) {
    global $wpdb;

    // Join postmeta table for um_plaintext
    $join .= " LEFT JOIN {$wpdb->postmeta} AS mt_plaintext
               ON ({$wpdb->posts}.ID = mt_plaintext.post_id
                   AND mt_plaintext.meta_key = 'um_plaintext')";

    return $join;
}

/**
 * Group results by post ID to avoid duplicates from LEFT JOIN
 *
 * @param string $groupby GROUP BY clause
 * @param WP_Query $query Query object
 * @return string Modified GROUP BY clause
 */
function um_search_groupby_custom($groupby, $query) {
    global $wpdb;

    if (empty($groupby)) {
        $groupby = "{$wpdb->posts}.ID";
    }

    return $groupby;
}

/* =========================================================
   Helper Functions
   ========================================================= */

/**
 * Get formatted article data for search results display
 *
 * @param WP_Post $post Post object
 * @return array Formatted article data
 */
function um_get_search_result_data($post) {
    $source_site = get_post_meta($post->ID, 'um_source_site', true);
    $source_url = get_post_meta($post->ID, 'um_source_url', true);
    $featured_image = get_post_meta($post->ID, 'um_featured_image_url', true);
    $author_name = get_post_meta($post->ID, 'um_author_name', true);
    $date_gmt = get_post_meta($post->ID, 'um_date_gmt', true);

    // Get source label
    $sites = um_sites_config();
    $source_label = 'Unknown Source';
    foreach ($sites as $site) {
        if ($site['id'] === $source_site) {
            $source_label = $site['label'];
            break;
        }
    }

    // Format date
    $formatted_date = '';
    if ($date_gmt) {
        $timestamp = strtotime($date_gmt);
        $formatted_date = date('F j, Y \a\t g:i a', $timestamp);
    }

    return array(
        'id' => $post->ID,
        'title' => get_the_title($post),
        'excerpt' => $post->post_content, // Stored as excerpt
        'url' => $source_url,
        'thumbnail' => $featured_image,
        'author' => $author_name,
        'source' => $source_label,
        'date' => $formatted_date,
    );
}

/**
 * Enqueue search results stylesheet
 */
function um_enqueue_search_assets() {
    if (is_search()) {
        wp_enqueue_style(
            'um-search-results',
            UMI_URL . 'assets/search-results.css',
            array(),
            '1.0.0'
        );
    }
}
add_action('wp_enqueue_scripts', 'um_enqueue_search_assets');
