<?php
/**
 * United Media Ingestor – Backfill (archive ingestion)
 *
 * Responsibilities:
 * - Paginated ingestion of historical posts
 * - Resume-safe via stored state
 * - Gentle batching to avoid remote 500s
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Backfill runner
   ========================================================= */

/**
 * Handle fetch error with binary search to find corrupt article.
 *
 * @param array $state Current backfill state
 * @param array $site Site config
 * @param int $page Current page number
 * @param int $per_page Current per_page size
 * @param string $error Error message
 * @return array ['action' => 'retry'|'skip_article'|'pause', 'state' => ..., 'page' => ..., 'per_page' => ...]
 */
function um_handle_fetch_error($state, $site, $page, $per_page, $error) {
    $site_id = $site['id'];

    // Check if same page/offset as last error
    $is_same_position = (
        !empty($state['last_error']['site']) &&
        $state['last_error']['site'] === $site_id &&
        !empty($state['last_error']['page']) &&
        $state['last_error']['page'] === $page &&
        isset($state['last_error']['offset']) &&
        $state['last_error']['offset'] === (isset($state['binary_search_offset']) ? $state['binary_search_offset'] : 0)
    );

    if (!$is_same_position) {
        // First failure at this position, activate binary search
        $state['binary_search_active'] = true;
        $state['binary_search_page'] = $page;
        $state['binary_search_offset'] = 0;
        $state['binary_search_per_page'] = $per_page;
        $state['binary_search_imported'] = 0;
        $state['failure_count'] = 1;
        $state['last_error'] = array(
            'site' => $site_id,
            'page' => $page,
            'offset' => 0,
            'per_page' => $per_page,
            'error' => $error,
            'time' => time(),
        );

        // Retry with half page size
        $new_per_page = max(1, floor($per_page / 2));

        return array(
            'action' => 'retry',
            'state' => $state,
            'page' => $page,
            'per_page' => $new_per_page,
        );
    }

    // Same position, increment failure count
    $state['failure_count']++;

    // If we've hit the same position 3 times, proceed with binary search
    if ($state['failure_count'] >= 3) {
        $current_per_page = isset($state['binary_search_per_page']) ? $state['binary_search_per_page'] : $per_page;

        if ($current_per_page > 1) {
            // Halve the search window
            $new_per_page = max(1, floor($current_per_page / 2));
            $state['binary_search_per_page'] = $new_per_page;
            $state['failure_count'] = 0;  // Reset for new window size

            $state['last_error'] = array(
                'site' => $site_id,
                'page' => $page,
                'offset' => isset($state['binary_search_offset']) ? $state['binary_search_offset'] : 0,
                'per_page' => $new_per_page,
                'error' => '🔍 Binary Search: Testing window size ' . $new_per_page . '...',
                'time' => time(),
            );

            return array(
                'action' => 'retry',
                'state' => $state,
                'page' => $page,
                'per_page' => $new_per_page,
            );
        } else {
            // per_page=1 and still failing → exact corrupt article found
            $corrupt_offset = isset($state['binary_search_offset']) ? $state['binary_search_offset'] : 0;

            // Log the skipped article
            if (!isset($state['skipped_articles'])) {
                $state['skipped_articles'] = array();
            }
            $state['skipped_articles'][] = array(
                'site' => $site_id,
                'page' => $page,
                'offset' => $corrupt_offset,
                'reason' => 'HTTP 500 error (corrupt article)',
                'time' => time(),
            );

            // Increment offset to skip this article
            $state['binary_search_offset'] = $corrupt_offset + 1;
            $state['binary_search_per_page'] = UMI_PER_PAGE;  // Resume full page size
            $state['failure_count'] = 0;
            $state['last_error'] = array(
                'site' => $site_id,
                'page' => $page,
                'offset' => $corrupt_offset,
                'error' => 'SKIPPED: Corrupt article at offset ' . $corrupt_offset,
                'time' => time(),
            );

            // Check if we've completed the original page
            $original_per_page = UMI_PER_PAGE;
            $remaining = $original_per_page - $state['binary_search_offset'];

            if ($remaining > 0) {
                // More articles to fetch on this page
                return array(
                    'action' => 'retry',
                    'state' => $state,
                    'page' => $page,
                    'per_page' => min($remaining, UMI_PER_PAGE),
                );
            } else {
                // Completed this page, move to next
                $state['binary_search_active'] = false;
                $state['binary_search_page'] = null;
                $state['binary_search_offset'] = 0;
                $state['page'] = $page + 1;

                return array(
                    'action' => 'skip_article',
                    'state' => $state,
                );
            }
        }
    }

    // Not enough failures yet, pause and let user retry
    $state['last_error'] = array(
        'site' => $site_id,
        'page' => $page,
        'offset' => isset($state['binary_search_offset']) ? $state['binary_search_offset'] : 0,
        'per_page' => $per_page,
        'error' => $error,
        'time' => time(),
    );

    return array(
        'action' => 'pause',
        'state' => $state,
    );
}

/**
 * Run backfill in single-article mode (simple, one article at a time).
 * Fetches one article, retries 3 times, skips on failure.
 * Much simpler than batch mode, no binary search needed.
 *
 * @param array $sites Result of um_sites_config()
 * @return array Summary of this batch
 */
function um_run_backfill_single_article(array $sites) {
    if (!um_acquire_lock()) {
        return array(
            'ok'      => true,
            'message' => 'Skipped: backfill already running.',
        );
    }

    $state = um_backfill_get_state();

    // Initialize state on first run
    if (empty($state)) {
        $state = array(
            'site_index' => 0,
            'site_id'    => $sites[0]['id'],
            'offset'     => 0,  // Single article mode uses offset instead of page
            'started_at' => time(),
            'done'       => false,
            'totals'     => array(),
            'last_error' => null,
            'skipped_articles' => array(),
        );

        // Preload totals
        foreach ($sites as $s) {
            $tot = um_get_site_post_totals($s['base']);
            $state['totals'][$s['id']] = $tot;
            usleep(200000); // 0.2s
        }

        um_backfill_set_state($state);
    }

    if (!empty($state['done'])) {
        um_release_lock();
        return array(
            'ok'      => true,
            'message' => 'Backfill already complete.',
            'state'   => $state,
        );
    }

    $inserted = 0;
    $updated  = 0;
    $skipped  = 0;
    $failed   = 0;
    $articles_processed = 0;
    $articles_per_run = UMI_BACKFILL_PAGES_PER_RUN; // Reuse same setting (treat as "articles per run")

    $site_index = intval($state['site_index']);
    $offset     = max(0, intval($state['offset']));

    while ($articles_processed < $articles_per_run) {
        if (!isset($sites[$site_index])) {
            // All sites processed
            $state['done'] = true;
            um_backfill_set_state($state);
            break;
        }

        $site = $sites[$site_index];
        $site_id = $site['id'];

        // Fetch single article at current offset
        $resp = um_fetch_single_article($site['base'], $offset);

        if (empty($resp['ok'])) {
            // Failed after 3 retries (built into um_http_get)
            // Log and skip this article
            if (!isset($state['skipped_articles'])) {
                $state['skipped_articles'] = array();
            }
            $state['skipped_articles'][] = array(
                'site' => $site_id,
                'offset' => $offset,
                'reason' => $resp['error'],
                'time' => time(),
            );

            $state['last_error'] = array(
                'site' => $site_id,
                'offset' => $offset,
                'error' => 'SKIPPED after 3 retries: ' . $resp['error'],
                'time' => time(),
            );

            $failed++;
            $offset++;
            $state['offset'] = $offset;
            um_backfill_set_state($state);

            $articles_processed++;
            usleep(400000); // 0.4s pause before next
            continue;
        }

        $posts = is_array($resp['data']) ? $resp['data'] : array();

        // If no posts returned, move to next site
        if (empty($posts)) {
            // Check if this is the first fetch (offset 0)
            if ($offset === 0) {
                // First fetch returned nothing - site may be empty or unavailable
                $state['last_error'] = array(
                    'site'   => $site_id,
                    'offset' => $offset,
                    'error'  => 'Site returned no articles at offset 0',
                    'time'   => time(),
                );
            } else {
                // Normal completion - reached end of site
                $state['last_error'] = null;
            }

            // Move to next site
            $site_index++;
            $state['site_index'] = $site_index;
            $state['site_id']    = isset($sites[$site_index]) ? $sites[$site_index]['id'] : null;
            $state['offset']     = 0;
            $offset = 0;

            um_backfill_set_state($state);
            continue;
        }

        // Process the single article
        $p = $posts[0]; // Should only be one article
        $res = um_upsert_article($site, $p);
        um_tally_upsert_result($res, $inserted, $updated, $skipped, $failed);

        // Move to next offset
        $offset++;
        $state['offset'] = $offset;
        $state['last_error'] = null; // Clear error on success

        um_backfill_set_state($state);

        $articles_processed++;
        usleep(400000); // 0.4s pause between articles
    }

    um_release_lock();

    return array(
        'ok'        => true,
        'message'   => 'Backfill batch complete (single-article mode).',
        'mode'      => 'single',
        'site'      => isset($sites[$site_index]) ? $sites[$site_index]['id'] : null,
        'offset'    => $offset,
        'inserted'  => $inserted,
        'updated'   => $updated,
        'skipped'   => $skipped,
        'failed'    => $failed,
        'state'     => $state,
    );
}

/**
 * Run a single backfill batch across sites.
 * Routes to either batch mode (with binary search) or single-article mode.
 *
 * @param array $sites Result of um_sites_config()
 * @return array Summary of this batch
 */
function um_run_backfill_batch(array $sites) {

    // Route to appropriate mode
    if (defined('UMI_BACKFILL_MODE') && UMI_BACKFILL_MODE === 'single') {
        return um_run_backfill_single_article($sites);
    }

    // Default: batch mode with binary search
    if (!um_acquire_lock()) {
        return array(
            'ok'      => true,
            'message' => 'Skipped: backfill already running.',
        );
    }

    $state = um_backfill_get_state();

    // Initialize state on first run
    if (empty($state)) {
        $state = array(
            'site_index' => 0,
            'site_id'    => $sites[0]['id'],
            'page'       => 1,
            'cursor'     => null,  // For cursor-based backfill
            'per_page'   => UMI_PER_PAGE,
            'started_at' => time(),
            'done'       => false,
            'totals'     => array(),
            'last_error' => null,
            'failure_count' => 0,  // Track repeated failures at same page/cursor
            'skipped_pages' => array(),  // Log of auto-skipped pages
            'skipped_ranges' => array(),  // Log of auto-skipped date ranges (cursor mode)
            'binary_search_active' => false,  // Is binary search in progress?
            'binary_search_page' => null,  // Original page that failed
            'binary_search_offset' => 0,  // Current offset within page
            'binary_search_per_page' => 100,  // Current search window size
            'binary_search_imported' => 0,  // Articles imported during search
            'skipped_articles' => array(),  // Log of individually skipped corrupt articles
        );

        // Preload totals (for status/visibility)
        foreach ($sites as $s) {
            $tot = um_get_site_post_totals($s['base']);
            $state['totals'][$s['id']] = $tot;
            usleep(200000); // 0.2s
        }

        um_backfill_set_state($state);
    }

    if (!empty($state['done'])) {
        um_release_lock();
        return array(
            'ok'      => true,
            'message' => 'Backfill already complete.',
            'state'   => $state,
        );
    }

    $inserted = 0;
    $updated  = 0;
    $skipped  = 0;
    $failed   = 0;
    $pages_done = 0;

    $site_index = intval($state['site_index']);
    $page       = max(1, intval($state['page']));

    // If binary search is active, calculate per_page based on remaining articles in page
    if (!empty($state['binary_search_active'])) {
        $original_per_page = UMI_PER_PAGE;
        $current_offset = isset($state['binary_search_offset']) ? intval($state['binary_search_offset']) : 0;
        $remaining = $original_per_page - $current_offset;
        $per_page = min($original_per_page, max(1, $remaining));
    } else {
        $per_page = max(1, min(100, intval($state['per_page'])));
    }

    while ($pages_done < UMI_BACKFILL_PAGES_PER_RUN) {

        if (!isset($sites[$site_index])) {
            // All sites processed
            $state['done'] = true;
            um_backfill_set_state($state);
            break;
        }

        $site = $sites[$site_index];
        $site_id = $site['id'];
        $backfill_mode = isset($site['backfill_mode']) ? $site['backfill_mode'] : 'page';

        // Fetch posts based on backfill mode
        if ($backfill_mode === 'before_cursor') {
            // Cursor-based backfill (avoids deep pagination issues)
            $cursor = isset($state['cursor']) ? $state['cursor'] : null;

            // On first run for this site, start with current time
            if ($cursor === null) {
                $cursor = gmdate('Y-m-d\TH:i:s');
                $state['cursor'] = $cursor;
            }

            $resp = um_fetch_posts_before($site['base'], $cursor, $per_page);
        } else {
            // Page-based backfill (default)
            $offset = null;

            if (!empty($state['binary_search_active'])) {
                // Calculate absolute offset for binary search
                $original_per_page = UMI_PER_PAGE;
                $offset = (($state['binary_search_page'] - 1) * $original_per_page) + $state['binary_search_offset'];
            }

            $resp = um_fetch_posts_page($site['base'], $page, $per_page, $offset);
        }

        if (empty($resp['ok'])) {
            // Check if this is a "no more pages" error (HTTP 400 or 404)
            // WordPress REST API returns 400 when requesting a page that doesn't exist
            $is_end_of_pages = (
                preg_match('/HTTP (400|404)/', $resp['error']) &&
                $backfill_mode === 'page' &&
                $page > 1  // We've already fetched at least one page
            );

            if ($is_end_of_pages) {
                // This site is done, move to next
                $site_index++;
                $state['site_index'] = $site_index;
                $state['site_id']    = isset($sites[$site_index]) ? $sites[$site_index]['id'] : null;
                $state['page']       = 1;
                $state['cursor']     = null;
                $state['last_error'] = null;  // Clear error since this is normal completion
                $state['failure_count'] = 0;  // Reset failure count for new site

                // Reset binary search state for new site
                $state['binary_search_active'] = false;
                $state['binary_search_page'] = null;
                $state['binary_search_offset'] = 0;
                $state['binary_search_per_page'] = UMI_PER_PAGE;
                $state['binary_search_imported'] = 0;

                // Reload local variables from state for new site
                $page = 1;

                um_backfill_set_state($state);
                continue;
            }

            // Use binary search to find and skip corrupt article (page mode only)
            if ($backfill_mode === 'page') {
                $result = um_handle_fetch_error($state, $site, $page, $per_page, $resp['error']);

                if ($result['action'] === 'retry') {
                    // Binary search: retry with new parameters
                    $state = $result['state'];
                    $page = $result['page'];
                    $per_page = $result['per_page'];
                    um_backfill_set_state($state);
                    // Don't increment pages_done, retry same batch
                    continue;
                } else if ($result['action'] === 'skip_article') {
                    // Found and skipped corrupt article, continue
                    $state = $result['state'];
                    $page = $state['page'];
                    um_backfill_set_state($state);
                    continue;
                } else if ($result['action'] === 'pause') {
                    // Non-recoverable error or not enough retries yet, pause
                    $state = $result['state'];
                    um_backfill_set_state($state);
                    um_release_lock();
                    return array(
                        'ok'      => false,
                        'message' => 'Backfill paused due to fetch error.',
                        'state'   => $state,
                    );
                }
            } else {
                // Cursor mode: use old skip-ahead logic
                $current_cursor = isset($state['cursor']) ? $state['cursor'] : null;
                $stuck = false;

                // Check if stuck at same cursor
                if ($current_cursor &&
                    !empty($state['last_error']['cursor']) &&
                    $state['last_error']['cursor'] === $current_cursor &&
                    !empty($state['last_error']['site']) &&
                    $state['last_error']['site'] === $site_id) {

                    if (empty($state['failure_count'])) {
                        $state['failure_count'] = 1;
                    } else {
                        $state['failure_count']++;
                    }

                    if ($state['failure_count'] >= 3) {
                        $stuck = true;
                    }
                } else {
                    $state['failure_count'] = 1;
                }

                // If stuck, skip ahead by 1 day
                if ($stuck) {
                    $old_cursor = $current_cursor;
                    $cursor_timestamp = strtotime($current_cursor);
                    $new_cursor_timestamp = $cursor_timestamp - 86400;
                    $new_cursor = gmdate('Y-m-d\TH:i:s', $new_cursor_timestamp);

                    $state['cursor'] = $new_cursor;
                    $state['failure_count'] = 0;
                    $state['last_error'] = array(
                        'site'  => $site_id,
                        'page'  => $page,
                        'cursor' => $old_cursor,
                        'error' => 'AUTO-SKIPPED: Repeated failures at cursor ' . $old_cursor . ', jumped to ' . $new_cursor,
                        'time'  => time(),
                    );

                    if (!isset($state['skipped_ranges'])) {
                        $state['skipped_ranges'] = array();
                    }
                    $state['skipped_ranges'][] = array(
                        'site' => $site_id,
                        'cursor' => $old_cursor,
                        'skipped_to' => $new_cursor,
                        'reason' => 'Repeated HTTP 500 errors (likely corrupt article)',
                        'time' => time(),
                    );

                    um_backfill_set_state($state);
                    continue;
                }

                // Otherwise, pause on error (retry later)
                $state['last_error'] = array(
                    'site'  => $site_id,
                    'page'  => $page,
                    'cursor' => $current_cursor,
                    'error' => $resp['error'],
                    'time'  => time(),
                );
                um_backfill_set_state($state);
                um_release_lock();

                return array(
                    'ok'      => false,
                    'message' => 'Backfill paused due to fetch error.',
                    'state'   => $state,
                );
            }
        }

        $posts = is_array($resp['data']) ? $resp['data'] : array();

        // If no posts returned, check if this is first fetch or normal completion
        if (empty($posts)) {
            // Determine if this is the first fetch attempt for this site
            $is_first_fetch = false;

            if ($backfill_mode === 'before_cursor') {
                // For cursor mode: first fetch if cursor is still at "now"
                $initial_cursor = gmdate('Y-m-d\TH:i:s');
                $is_first_fetch = ($state['cursor'] === null || $state['cursor'] === $initial_cursor);
            } else {
                // For page mode: first fetch if we're on page 1
                $is_first_fetch = ($page === 1);
            }

            // If this is the first fetch and we got no posts, pause with error
            if ($is_first_fetch) {
                $state['last_error'] = array(
                    'site'   => $site_id,
                    'page'   => $page,
                    'cursor' => isset($state['cursor']) ? $state['cursor'] : null,
                    'error'  => 'Empty posts array on first fetch - site may be unavailable or returning invalid data',
                    'time'   => time(),
                );
                um_backfill_set_state($state);
                um_release_lock();

                return array(
                    'ok'      => false,
                    'message' => 'Backfill paused: ' . $site_id . ' returned no posts on first fetch',
                    'state'   => $state,
                );
            }

            // Otherwise, this is normal completion - move to next site
            $site_index++;
            $state['site_index'] = $site_index;
            $state['site_id']    = isset($sites[$site_index]) ? $sites[$site_index]['id'] : null;
            $state['page']       = 1;
            $state['cursor']     = null;  // Reset cursor for next site
            $state['last_error'] = null;  // Clear error since this is normal completion
            $state['failure_count'] = 0;  // Reset failure count for new site

            // Reset binary search state for new site
            $state['binary_search_active'] = false;
            $state['binary_search_page'] = null;
            $state['binary_search_offset'] = 0;
            $state['binary_search_per_page'] = UMI_PER_PAGE;
            $state['binary_search_imported'] = 0;

            // Reload local variables from state for new site
            $page = 1;

            um_backfill_set_state($state);
            continue;
        }

        // Track oldest date for cursor advancement
        $oldest_date_gmt = null;

        foreach ($posts as $p) {
            $res = um_upsert_article($site, $p);
            um_tally_upsert_result($res, $inserted, $updated, $skipped, $failed);

            // Track oldest date_gmt for cursor mode
            if ($backfill_mode === 'before_cursor' && !empty($p['date_gmt'])) {
                if ($oldest_date_gmt === null || strtotime($p['date_gmt']) < strtotime($oldest_date_gmt)) {
                    $oldest_date_gmt = $p['date_gmt'];
                }
            }
        }

        // Advance state based on mode
        if ($backfill_mode === 'before_cursor') {
            // Update cursor to oldest date from this batch
            if ($oldest_date_gmt) {
                $state['cursor'] = gmdate('Y-m-d\TH:i:s', strtotime($oldest_date_gmt));
            }
        } else {
            // Page-based: increment page (unless in binary search mode)
            if (empty($state['binary_search_active'])) {
                $page++;
                $state['page'] = $page;
            } else {
                // During binary search, advance offset instead of page
                $articles_fetched = count($posts);
                $state['binary_search_offset'] += $articles_fetched;
                $state['binary_search_imported'] += $inserted;

                // Check if we've completed the original page
                $original_per_page = UMI_PER_PAGE;
                if ($state['binary_search_offset'] >= $original_per_page) {
                    // Binary search complete for this page, move to next
                    $state['binary_search_active'] = false;
                    $state['binary_search_page'] = null;
                    $state['binary_search_offset'] = 0;
                    $state['binary_search_per_page'] = $original_per_page;
                    $state['binary_search_imported'] = 0;
                    $page++;
                    $state['page'] = $page;

                    // Reset per_page for next page
                    $per_page = $original_per_page;
                }
            }
        }

        $pages_done++;
        $state['site_index'] = $site_index;
        $state['site_id']    = $site_id;
        $state['failure_count'] = 0;  // Reset failure count on successful batch

        um_backfill_set_state($state);

        // Gentle pause to avoid rate limits
        usleep(400000); // 0.4s
    }

    um_release_lock();

    return array(
        'ok'        => true,
        'message'   => 'Backfill batch complete.',
        'site'      => isset($sites[$site_index]) ? $sites[$site_index]['id'] : null,
        'mode'      => isset($sites[$site_index]['backfill_mode']) ? $sites[$site_index]['backfill_mode'] : 'page',
        'next_page' => isset($state['page']) ? $state['page'] : null,
        'cursor'    => isset($state['cursor']) ? $state['cursor'] : null,
        'inserted'  => $inserted,
        'updated'   => $updated,
        'skipped'   => $skipped,
        'failed'    => $failed,
        'state'     => $state,
    );
}

/* =========================================================
   Simple admin endpoints (manual control)
   ========================================================= */

add_action('admin_post_um_backfill_run', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    $result = um_run_backfill_batch(um_sites_config());
    echo '<pre>' . esc_html(print_r($result, true)) . '</pre>';
    exit;
});

add_action('admin_post_um_backfill_reset', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    um_backfill_reset_state();
    echo '<pre>Backfill state reset.</pre>';
    exit;
});
