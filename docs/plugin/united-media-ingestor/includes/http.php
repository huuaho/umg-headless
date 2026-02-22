<?php
/**
 * United Media Ingestor – HTTP layer
 *
 * Responsibilities:
 * - All wp_remote_get calls
 * - Retry + backoff
 * - Header capture (x-wp-total / x-wp-totalpages)
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   URL helpers
   ========================================================= */

function um_is_valid_base_url($base) {
    $base = trim((string)$base);
    if ($base === '') return false;
    return (bool) preg_match('#^https?://#i', $base);
}

function um_build_posts_url($base, $params = array()) {
    if (!um_is_valid_base_url($base)) return '';

    $base = rtrim($base, '/');
    $url  = $base . '/wp-json/wp/v2/posts';

    if (!empty($params)) {
        $url .= '?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    }

    return $url;
}

/* =========================================================
   Core HTTP request
   ========================================================= */

function um_http_get($url, $attempts = 3) {
    if (!$url) {
        return array('ok'=>false, 'error'=>'Empty URL', 'data'=>null, 'headers'=>array());
    }

    $attempt = 0;
    $last_error = null;

    while ($attempt < $attempts) {
        $attempt++;

        $res = wp_remote_get($url, array(
            'timeout'     => UMI_HTTP_TIMEOUT,
            'redirection' => 5,
            'sslverify'   => UMI_SSL_VERIFY,
            'headers'     => array(
                'Accept'     => 'application/json',
                'User-Agent' => UMI_HTTP_USER_AGENT,
            ),
        ));

        if (is_wp_error($res)) {
            $last_error = $res->get_error_message();
        } else {
            $code = wp_remote_retrieve_response_code($res);
            $body = wp_remote_retrieve_body($res);
            $headers = wp_remote_retrieve_headers($res);

            if ($code >= 200 && $code < 300) {
                $json = json_decode($body, true);
                if (is_array($json)) {
                    return array(
                        'ok'      => true,
                        'error'   => null,
                        'data'    => $json,
                        'headers' => $headers,
                    );
                }
                $last_error = 'JSON decode failed';
            } else {
                $last_error = "HTTP $code";
            }
        }

        // Retry only for server errors
        if ($attempt < $attempts && $last_error && strpos($last_error, 'HTTP 5') === 0) {
            usleep(500000 * $attempt); // 0.5s, 1s, 1.5s
            continue;
        }

        break;
    }

    return array(
        'ok'      => false,
        'error'   => $last_error ?: 'Unknown HTTP error',
        'data'    => null,
        'headers' => array(),
    );
}

/* =========================================================
   Public API
   ========================================================= */

/**
 * Fetch a single page of posts (for backfill).
 * Supports optional offset parameter for binary search of corrupt articles.
 */
function um_fetch_posts_page($base, $page, $per_page, $offset = null) {
    $params = array(
        'per_page' => min(100, max(1, intval($per_page))),
        'orderby'  => 'date',
        'order'    => 'desc',
        '_embed'   => 1,
    );

    if ($offset !== null) {
        // Use absolute offset instead of page (for binary search)
        $params['offset'] = intval($offset);
    } else {
        // Use page-based pagination (default)
        $params['page'] = max(1, intval($page));
    }

    $url = um_build_posts_url($base, $params);
    return um_http_get($url);
}

/**
 * Fetch recent posts since an ISO8601 timestamp (incremental).
 */
function um_fetch_posts_since($base, $after_iso, $per_page = 30) {
    $params = array(
        'per_page' => min(100, max(1, intval($per_page))),
        'orderby'  => 'date',
        'order'    => 'desc',
        '_embed'   => 1,
    );

    if ($after_iso) {
        $params['after'] = $after_iso;
    }

    $url = um_build_posts_url($base, $params);
    return um_http_get($url);
}

/**
 * Fetch posts before an ISO8601 timestamp (cursor-based backfill).
 * Used to avoid deep pagination issues (HTTP 500 at high page numbers).
 */
function um_fetch_posts_before($base, $before_iso, $per_page = 25) {
    $params = array(
        'per_page' => min(100, max(1, intval($per_page))),
        'orderby'  => 'date',
        'order'    => 'desc',
        '_embed'   => 1,
    );

    if ($before_iso) {
        $params['before'] = $before_iso;
    }

    $url = um_build_posts_url($base, $params);
    return um_http_get($url);
}

/**
 * Fetch a single article by absolute offset (for single-article mode).
 * Returns an array with exactly one article, or empty array if none found.
 * Retries 3 times automatically via um_http_get().
 *
 * @param string $base Site base URL
 * @param int $offset Absolute offset (0-indexed)
 * @return array Same format as um_fetch_posts_page
 */
function um_fetch_single_article($base, $offset) {
    $params = array(
        'per_page' => 1,
        'offset'   => max(0, intval($offset)),
        'orderby'  => 'date',
        'order'    => 'desc',
        '_embed'   => 1,
    );

    $url = um_build_posts_url($base, $params);
    return um_http_get($url);
}

/**
 * Fetch media URLs by IDs.
 * Used to resolve gallery shortcode IDs to actual image URLs.
 *
 * @param string $base Site base URL
 * @param array $media_ids Array of media attachment IDs
 * @return array {ok, data: [{id, source_url}, ...], error}
 */
function um_fetch_media_urls($base, $media_ids) {
    if (empty($media_ids)) {
        return array('ok' => true, 'data' => array());
    }

    // Filter to valid integers and limit to 100 (WP REST max)
    $ids = array_slice(array_filter(array_map('intval', $media_ids)), 0, 100);
    if (empty($ids)) {
        return array('ok' => true, 'data' => array());
    }

    $base = rtrim($base, '/');
    $url = $base . '/wp-json/wp/v2/media?' . http_build_query(array(
        'include'  => implode(',', $ids),
        'per_page' => count($ids),
    ), '', '&', PHP_QUERY_RFC3986);

    $result = um_http_get($url, 2); // 2 attempts for media

    if (!$result['ok']) {
        return array('ok' => false, 'error' => $result['error'], 'data' => array());
    }

    // Extract just id and source_url from each media item
    $media = array();
    foreach ($result['data'] as $item) {
        if (!empty($item['id']) && !empty($item['source_url'])) {
            $media[] = array(
                'id'         => intval($item['id']),
                'source_url' => esc_url_raw($item['source_url']),
            );
        }
    }

    return array('ok' => true, 'data' => $media);
}

/**
 * Get total post counts for a site.
 * Uses headers: x-wp-total, x-wp-totalpages
 */
function um_get_site_post_totals($base) {
    $url = um_build_posts_url($base, array(
        'per_page' => 1,
        'page'     => 1,
    ));

    $res = um_http_get($url, 1);
    if (empty($res['ok'])) {
        return array('ok'=>false, 'error'=>$res['error']);
    }

    // FIX: normalize headers to array safely
    $headers_raw = $res['headers'];

    if ($headers_raw instanceof \WpOrg\Requests\Utility\CaseInsensitiveDictionary) {
        $headers = $headers_raw->getAll();
    } elseif (is_array($headers_raw)) {
        $headers = $headers_raw;
    } else {
        $headers = array();
    }

    // Normalize header keys
    $headers = array_change_key_case($headers, CASE_LOWER);

    return array(
        'ok'    => true,
        'total' => isset($headers['x-wp-total']) ? intval($headers['x-wp-total']) : 0,
        'pages' => isset($headers['x-wp-totalpages']) ? intval($headers['x-wp-totalpages']) : 0,
    );
}
