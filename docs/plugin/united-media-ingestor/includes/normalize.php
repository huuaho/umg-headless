<?php
/**
 * United Media Ingestor – Normalization Helpers
 *
 * Pure extraction/normalization functions for processing remote post data.
 * No side effects - just input → output transformations.
 */

if (!defined('ABSPATH')) exit;

/**
 * Extract category names from remote post's _embedded data.
 *
 * @param array $remote_post Raw post data from WP REST API with _embed=1
 * @return array Array of category name strings
 */
function um_extract_remote_categories($remote_post) {
    $categories = array();

    if (empty($remote_post['_embedded']['wp:term'])) {
        return $categories;
    }

    // wp:term is an array of arrays
    // First sub-array usually contains categories, second contains tags
    foreach ($remote_post['_embedded']['wp:term'] as $term_group) {
        if (!is_array($term_group)) continue;

        foreach ($term_group as $term) {
            // Only extract categories (not tags or other taxonomies)
            if (!empty($term['taxonomy']) && $term['taxonomy'] === 'category') {
                if (!empty($term['name'])) {
                    $categories[] = sanitize_text_field($term['name']);
                }
            }
        }
    }

    return $categories;
}

/**
 * Normalize title text.
 *
 * @param string $raw_title HTML-encoded title from remote
 * @return string Clean text title
 */
function um_normalize_title($raw_title) {
    if (empty($raw_title)) return '';
    return wp_strip_all_tags(html_entity_decode($raw_title, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

/**
 * Normalize excerpt text.
 *
 * @param string $raw_excerpt HTML excerpt from remote
 * @return string Clean text excerpt
 */
function um_normalize_excerpt($raw_excerpt) {
    if (empty($raw_excerpt)) return '';
    $text = wp_strip_all_tags(html_entity_decode($raw_excerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    return trim($text);
}

/**
 * Extract best GMT date from remote post.
 *
 * @param array $remote_post Raw post data
 * @return string ISO8601 GMT timestamp
 */
function um_normalize_date_gmt($remote_post) {
    if (!empty($remote_post['date_gmt'])) {
        return $remote_post['date_gmt'];
    }
    if (!empty($remote_post['date'])) {
        return $remote_post['date'];
    }
    return gmdate('Y-m-d\TH:i:s');
}

/**
 * Extract gallery media IDs from content HTML.
 * Handles Divi et_pb_gallery shortcodes and WordPress gallery shortcodes.
 *
 * @param string $content_html Raw HTML content from remote post
 * @return array Array of integer media IDs
 */
function um_extract_gallery_ids($content_html) {
    if (empty($content_html)) return array();

    $ids = array();

    // Match Divi gallery: [et_pb_gallery ... gallery_ids="1,2,3" ...]
    if (preg_match_all('/\[et_pb_gallery[^\]]*gallery_ids=["\']([^"\']+)["\'][^\]]*\]/i', $content_html, $matches)) {
        foreach ($matches[1] as $id_string) {
            $ids = array_merge($ids, array_map('intval', explode(',', $id_string)));
        }
    }

    // Match WordPress gallery: [gallery ids="1,2,3"]
    if (preg_match_all('/\[gallery[^\]]*ids=["\']([^"\']+)["\'][^\]]*\]/i', $content_html, $matches)) {
        foreach ($matches[1] as $id_string) {
            $ids = array_merge($ids, array_map('intval', explode(',', $id_string)));
        }
    }

    // Filter valid IDs and dedupe
    return array_unique(array_filter($ids, function($id) {
        return $id > 0;
    }));
}

/**
 * Extract direct image URLs from content HTML.
 * Finds all <img src="..."> URLs in the content.
 * Converts WordPress thumbnail URLs to full-size versions.
 *
 * @param string $content_html Raw HTML content from remote post
 * @return array Array of image URL strings (full-size)
 */
function um_extract_content_image_urls($content_html) {
    if (empty($content_html)) return array();

    $urls = array();

    // Match img src attributes
    if (preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $content_html, $matches)) {
        foreach ($matches[1] as $url) {
            // Only include valid http(s) URLs
            if (preg_match('#^https?://#i', $url)) {
                // Convert to full-size by stripping WordPress dimension suffix
                $full_url = um_get_full_size_image_url($url);
                $urls[] = esc_url_raw($full_url);
            }
        }
    }

    return array_unique($urls);
}

/**
 * Convert a WordPress thumbnail URL to its full-size version.
 * Strips dimension suffixes like -400x284, -1024x683, etc.
 *
 * @param string $url Image URL (possibly with dimensions)
 * @return string Full-size image URL
 */
function um_get_full_size_image_url($url) {
    // Pattern: filename-{width}x{height}.ext
    // Examples: image-400x284.jpg, photo-1024x683.png
    return preg_replace('/-\d+x\d+(\.[a-zA-Z]{3,4})$/', '$1', $url);
}
