<?php
/**
 * United Media Ingestor – Incremental ingestion
 *
 * Responsibilities:
 * - Fetch new posts since last cursor per site
 * - Upsert into local storage
 * - Advance cursor safely
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Incremental runner
   ========================================================= */

/**
 * Run one incremental ingestion pass across all sites.
 *
 * @return array Summary
 */
function um_run_incremental_once() {

    if (!um_acquire_lock()) {
        return array(
            'ok'      => true,
            'message' => 'Skipped: ingest already running.',
        );
    }

    $summary = array();

    foreach (um_sites_config() as $site) {

        $site_id = $site['id'];
        $base    = $site['base'];

        $after = um_get_since($site_id);

        $resp = um_fetch_posts_since($base, $after, 100);

        if (empty($resp['ok'])) {
            $summary[] = array(
                'site'  => $site_id,
                'ok'    => false,
                'error' => $resp['error'],
            );
            continue;
        }

        $inserted = 0;
        $updated  = 0;
        $skipped  = 0;
        $failed   = 0;
        $max_gmt  = '';

        $posts = is_array($resp['data']) ? $resp['data'] : array();

        foreach ($posts as $p) {
            $res = um_upsert_article($site, $p);

            if (empty($res['ok'])) {
                $failed++;
                continue;
            }

            if (!empty($res['skipped'])) {
                $skipped++;
                continue;
            }

            if (!empty($res['action']) && $res['action'] === 'inserted') {
                $inserted++;
            } else {
                $updated++;
            }

            // Track newest GMT date for cursor
            if (!empty($p['date_gmt'])) {
                if ($max_gmt === '' || strtotime($p['date_gmt']) > strtotime($max_gmt)) {
                    $max_gmt = $p['date_gmt'];
                }
            }
        }

        // Advance cursor
        if ($max_gmt) {
            $iso = gmdate('Y-m-d\TH:i:s', strtotime($max_gmt));
            um_set_since($site_id, $iso);
        } else {
            // On first run with no results, set cursor to now
            if (empty($after)) {
                um_set_since($site_id, gmdate('Y-m-d\TH:i:s'));
            }
        }

        $summary[] = array(
            'site'      => $site_id,
            'ok'        => true,
            'after_used'=> $after,
            'inserted'  => $inserted,
            'updated'   => $updated,
            'skipped'   => $skipped,
            'failed'    => $failed,
            'cursor'    => um_get_since($site_id),
        );

        // Gentle pause between sites
        usleep(250000); // 0.25s
    }

    um_release_lock();

    return array(
        'ok'      => true,
        'message' => 'Incremental ingest complete.',
        'summary' => $summary,
    );
}

/* =========================================================
   Admin endpoints (manual control)
   ========================================================= */

add_action('admin_post_um_incremental_run', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    $result = um_run_incremental_once();
    echo '<pre>' . esc_html(print_r($result, true)) . '</pre>';
    exit;
});

add_action('admin_post_um_incremental_reset', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    um_reset_all_since();
    echo '<pre>Incremental cursors reset.</pre>';
    exit;
});
