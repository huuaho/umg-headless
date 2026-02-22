<?php
/**
 * United Media Ingestor – Storage (CPT + Upsert)
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   CPT: um_article
   - Not public, not queryable on front-end
   - Used only as a local data store
   ========================================================= */

add_action('init', function () {
    register_post_type('um_article', array(
        'labels' => array(
            'name'          => 'UM Articles',
            'singular_name' => 'UM Article',
        ),
        'public'              => false,   // not publicly visible
        'publicly_queryable'  => false,   // no single pages
        'show_ui'             => true,    // visible in wp-admin for debugging
        'show_in_menu'        => true,
        'show_in_rest'        => false,   // keep it internal (we'll add our own REST later)
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'supports'            => array('title', 'editor', 'custom-fields'),
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
        'menu_icon'           => 'dashicons-database',
    ));

    // Register um_category taxonomy (hierarchical, internal only)
    register_taxonomy('um_category', array('um_article'), array(
        'labels' => array(
            'name'          => 'UM Categories',
            'singular_name' => 'UM Category',
        ),
        'hierarchical'      => true,    // Parent/child structure
        'public'            => false,   // Internal only
        'show_ui'           => true,    // Show in admin for debugging
        'show_in_rest'      => true,    // Enable REST API filtering
        'rewrite'           => false,   // No public URLs
        'query_var'         => false,
        'show_admin_column' => true,    // Show in articles list
    ));
});

/**
 * Hard-block attempts to render single um_article on front-end (extra safety).
 */
add_action('template_redirect', function () {
    if (is_singular('um_article')) {
        status_header(404);
        nocache_headers();
        exit;
    }
});

/* =========================================================
   Helpers
   ========================================================= */

/**
 * Build a stable unique key for a remote post.
 */
function um_article_unique_key($site_id, $remote_post_id) {
    return sanitize_key($site_id) . ':' . intval($remote_post_id);
}

/**
 * Find local um_article post_id by (site, remote_post_id).
 * Returns int post_id or 0.
 */
function um_find_article_id($site_id, $remote_post_id) {
    $site_id = sanitize_key($site_id);
    $remote_post_id = intval($remote_post_id);

    if (!$site_id || !$remote_post_id) return 0;

    $q = new WP_Query(array(
        'post_type'      => 'um_article',
        'post_status'    => array('publish', 'private', 'draft'),
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'meta_query'     => array(
            'relation' => 'AND',
            array(
                'key'   => UMI_SOURCE_SITE_META_KEY,
                'value' => $site_id,
            ),
            array(
                'key'   => UMI_REMOTE_ID_META_KEY,
                'value' => (string)$remote_post_id,
            ),
        ),
        'no_found_rows'  => true,
    ));

    if (!empty($q->posts[0])) return intval($q->posts[0]);
    return 0;
}

/**
 * Local count of stored articles for a site (used for totals/health checks).
 */
function um_local_count_for_site($site_id) {
    global $wpdb;

    $site_id = sanitize_key($site_id);

    $sql = "
      SELECT COUNT(1)
      FROM {$wpdb->posts} p
      INNER JOIN {$wpdb->postmeta} pm
        ON pm.post_id = p.ID
      WHERE p.post_type = 'um_article'
        AND p.post_status IN ('publish','private','draft')
        AND pm.meta_key = %s
        AND pm.meta_value = %s
    ";

    return (int) $wpdb->get_var($wpdb->prepare($sql, UMI_SOURCE_SITE_META_KEY, $site_id));
}

/* =========================================================
   Upsert
   ========================================================= */

/**
 * Upsert a remote WP post into local storage.
 *
 * @param array $site One entry from um_sites_config() (id,label,base)
 * @param array $remote_post Raw JSON decoded array from /wp-json/wp/v2/posts
 *
 * @return array { ok, action, post_id, skipped?, error? }
 */
function um_upsert_article($site, $remote_post) {
    try {
        $site_id = isset($site['id']) ? sanitize_key($site['id']) : '';
        $site_label = isset($site['label']) ? $site['label'] : $site_id;

        if (!$site_id) {
            return array('ok' => false, 'error' => 'Missing site id');
        }

        $remote_id = isset($remote_post['id']) ? intval($remote_post['id']) : 0;
        if (!$remote_id) {
            return array('ok' => false, 'error' => 'Missing remote post id');
        }

        $title = '';
        if (!empty($remote_post['title']['rendered'])) {
            $title = wp_strip_all_tags(html_entity_decode($remote_post['title']['rendered'], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        } else {
            $title = $site_label . ' #' . $remote_id;
        }

        $source_url = !empty($remote_post['link']) ? esc_url_raw($remote_post['link']) : '';
        $remote_slug = !empty($remote_post['slug']) ? sanitize_title($remote_post['slug']) : '';
        $date_gmt = !empty($remote_post['date_gmt']) ? $remote_post['date_gmt'] : '';
        $date_local = !empty($remote_post['date']) ? $remote_post['date'] : '';

        // Use excerpt as searchable body (lighter than full content)
        $excerpt = '';
        if (!empty($remote_post['excerpt']['rendered'])) {
            $excerpt = wp_strip_all_tags(html_entity_decode($remote_post['excerpt']['rendered'], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }

        // Extract full content as plaintext (for enhanced search)
        $plaintext = '';
        if (!empty($remote_post['content']['rendered'])) {
            $html = $remote_post['content']['rendered'];
            // Strip all HTML tags and shortcodes
            $plaintext = wp_strip_all_tags(strip_shortcodes($html));
            // Decode HTML entities
            $plaintext = html_entity_decode($plaintext, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            // Normalize whitespace
            $plaintext = preg_replace('/\s+/', ' ', $plaintext);
            $plaintext = trim($plaintext);
        }

        // Extract featured image
        $featured_image = '';
        if (!empty($remote_post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
            $featured_image = esc_url_raw($remote_post['_embedded']['wp:featuredmedia'][0]['source_url']);
        }

        // Extract ALL images from the article
        $all_image_urls = array();

        // 1. Add featured image first (if exists)
        if ($featured_image) {
            $all_image_urls[] = $featured_image;
        }

        // 2. Extract gallery media IDs from content and fetch their URLs
        $content_html = !empty($remote_post['content']['rendered']) ? $remote_post['content']['rendered'] : '';
        $gallery_ids = um_extract_gallery_ids($content_html);

        if (!empty($gallery_ids) && !empty($site['base'])) {
            $media_result = um_fetch_media_urls($site['base'], $gallery_ids);
            if ($media_result['ok'] && !empty($media_result['data'])) {
                foreach ($media_result['data'] as $media_item) {
                    if (!empty($media_item['source_url'])) {
                        $all_image_urls[] = $media_item['source_url'];
                    }
                }
            }
        }

        // 3. Extract direct <img> URLs from content
        $content_img_urls = um_extract_content_image_urls($content_html);
        $all_image_urls = array_merge($all_image_urls, $content_img_urls);

        // Dedupe while preserving order (featured image stays first)
        $all_image_urls = array_values(array_unique($all_image_urls));

        // Extract author name (try custom authors plugin first, then standard WP)
        $author_name = 'Not Credited'; // Default fallback

        // Custom authors plugin (multi-author / guest authors)
        if (!empty($remote_post['authors'][0]['display_name'])) {
            $author_name = sanitize_text_field($remote_post['authors'][0]['display_name']);
        }
        // Standard WP author (from _embed)
        else if (!empty($remote_post['_embedded']['author'][0]['name'])) {
            $author_name = sanitize_text_field($remote_post['_embedded']['author'][0]['name']);
        }

        // Dedupe lookup
        $existing_id = um_find_article_id($site_id, $remote_id);

        $postarr = array(
            'post_type'    => 'um_article',
            'post_title'   => $title,
            'post_content' => $excerpt,     // store excerpt for search; we can store full content later if you want
            'post_status'  => 'publish',
        );

        $action = 'inserted';
        if ($existing_id) {
            $postarr['ID'] = $existing_id;
            $action = 'updated';
            $post_id = wp_update_post($postarr, true);
        } else {
            $post_id = wp_insert_post($postarr, true);
        }

        if (is_wp_error($post_id)) {
            return array('ok' => false, 'error' => $post_id->get_error_message());
        }

        $post_id = intval($post_id);

        // Required identity metas
        update_post_meta($post_id, UMI_SOURCE_SITE_META_KEY, $site_id);
        update_post_meta($post_id, UMI_REMOTE_ID_META_KEY, (string)$remote_id);
        update_post_meta($post_id, UMI_SOURCE_URL_META_KEY, $source_url);
        if ($remote_slug) update_post_meta($post_id, 'um_remote_slug', $remote_slug);

        // Useful metadata for display/search
        if ($date_gmt) update_post_meta($post_id, 'um_date_gmt', $date_gmt);
        if ($date_local) update_post_meta($post_id, 'um_date_local', $date_local);

        // Store site label too (handy for rendering)
        update_post_meta($post_id, 'um_source_label', $site_label);

        // Store featured image and author
        if ($featured_image) {
            update_post_meta($post_id, 'um_featured_image_url', $featured_image);
        }
        if ($author_name) {
            update_post_meta($post_id, 'um_author_name', $author_name);
        }

        // Store all image URLs as JSON array
        if (!empty($all_image_urls)) {
            update_post_meta($post_id, 'um_image_urls', wp_json_encode($all_image_urls));
        }

        // Store full plaintext content for search
        if ($plaintext) {
            update_post_meta($post_id, 'um_plaintext', $plaintext);

            // Calculate and store word count for read time estimation
            $word_count = str_word_count($plaintext);
            update_post_meta($post_id, 'um_word_count', $word_count);
        }

        // Extract and assign categories
        $remote_categories = um_extract_remote_categories($remote_post);

        if (!empty($remote_categories)) {
            $resolution = um_resolve_categories($site_id, $remote_categories);

            // Assign mapped categories to post
            if (!empty($resolution['mapped_slugs'])) {
                wp_set_object_terms($post_id, $resolution['mapped_slugs'], 'um_category', false);
            }

            // Track unmapped categories for admin review
            if (!empty($resolution['unmapped'])) {
                um_track_unmapped_categories($site_id, $resolution['unmapped']);
            }

            // Mark as excluded if all categories are excluded
            if ($resolution['is_excluded']) {
                update_post_meta($post_id, UMI_EXCLUDED_META_KEY, 1);
                if (!empty($resolution['excluded_reason'])) {
                    update_post_meta($post_id, 'um_excluded_reason', $resolution['excluded_reason']);
                }
            }
        }

        // Store raw minimal fields for later (JSON)
        // Keep this small; avoid huge content blobs in postmeta unless needed.
        $raw_pack = array(
            'id'     => $remote_id,
            'link'   => $source_url,
            'date'   => $date_local,
            'date_gmt' => $date_gmt,
            'title'  => $title,
        );
        update_post_meta($post_id, 'um_raw_min', wp_json_encode($raw_pack));

        return array(
            'ok'      => true,
            'action'  => $action,
            'post_id' => $post_id,
        );
    } catch (Exception $e) {
        return array('ok' => false, 'error' => $e->getMessage());
    }
}

/**
 * Track unmapped categories for admin review
 *
 * @param string $site_id Site identifier
 * @param array $unmapped_categories Array of category names that couldn't be mapped
 */
function um_track_unmapped_categories($site_id, $unmapped_categories) {
    if (empty($unmapped_categories)) return;

    $option_key = 'um_unmapped_categories';
    $tracked = get_option($option_key, array());

    if (!is_array($tracked)) {
        $tracked = array();
    }

    foreach ($unmapped_categories as $cat_name) {
        $key = $site_id . '|' . sanitize_key($cat_name);

        if (isset($tracked[$key])) {
            // Increment count
            $tracked[$key]['count']++;
            $tracked[$key]['last_seen'] = time();
        } else {
            // New unmapped category
            $tracked[$key] = array(
                'site_id' => $site_id,
                'category_name' => $cat_name,
                'count' => 1,
                'first_seen' => time(),
                'last_seen' => time(),
            );
        }
    }

    update_option($option_key, $tracked);
}
