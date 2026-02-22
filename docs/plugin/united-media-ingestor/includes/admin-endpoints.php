<?php
/**
 * United Media Ingestor – Admin endpoints
 *
 * Responsibilities:
 * - Manual triggers for backfill and incremental ingestion
 * - Autorun toggle
 * - Status / health inspection
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Admin Menu Page
   ========================================================= */

add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=um_article',
        'UM Ingestor Control',
        'Ingestor Control',
        'manage_options',
        'um-ingestor-control',
        'um_render_control_page'
    );
});

function um_render_control_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Forbidden');
    }

    $sites = um_sites_config();
    $state = um_backfill_get_state();
    $autorun_enabled = um_autorun_is_enabled();

    // Check if server backfill is active for auto-refresh
    $server_backfill_active = um_is_server_backfill_active();
    if ($server_backfill_active) {
        echo '<meta http-equiv="refresh" content="10">';
    }

    ?>
    <div class="wrap">
        <h1>United Media Ingestor Control</h1>

        <?php if ($server_backfill_active): ?>
            <div class="notice notice-info" style="display: flex; align-items: center; gap: 10px;">
                <span class="dashicons dashicons-update" style="animation: rotation 2s infinite linear;"></span>
                <p style="margin: 0;">Server backfill is running. Page auto-refreshes every 10 seconds to show progress.</p>
            </div>
            <style>
                @keyframes rotation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(359deg); }
                }
            </style>
        <?php endif; ?>

        <!-- Status Section -->
        <div class="card" style="max-width: none; margin-bottom: 20px;">
            <h2>Current Status <span id="um-status-updating" style="display: none; font-size: 14px; color: #0073aa; font-weight: normal;">⟳ Updating...</span></h2>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>Site</th>
                        <th>Local Count</th>
                        <th>Remote Total</th>
                        <th>Backfill Mode</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="um-status-table-body">
                    <?php foreach ($sites as $s):
                        $local = um_local_count_for_site($s['id']);
                        $remote = um_get_site_post_totals($s['base']);
                        $mode = isset($s['backfill_mode']) ? $s['backfill_mode'] : 'page';
                        $is_current = !empty($state['site_id']) && $state['site_id'] === $s['id'];
                    ?>
                    <tr <?php if ($is_current) echo 'style="background-color: #ffffcc;"'; ?>>
                        <td><strong><?php echo esc_html($s['label']); ?></strong></td>
                        <td><?php echo number_format($local); ?></td>
                        <td><?php echo !empty($remote['ok']) ? number_format($remote['total']) : 'Error'; ?></td>
                        <td><code><?php echo esc_html($mode); ?></code></td>
                        <td>
                            <?php
                            if ($is_current) {
                                echo '<span style="color: #0073aa;">● In Progress</span>';
                            } elseif ($local >= ($remote['total'] ?? 0)) {
                                echo '<span style="color: #46b450;">✓ Complete</span>';
                            } else {
                                echo '<span style="color: #999;">○ Pending</span>';
                            }
                            ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php if (!empty($state['last_error'])): ?>
            <div class="notice notice-error" style="margin-top: 10px;">
                <p><strong>Last Error:</strong></p>
                <pre style="font-size: 12px;"><?php echo esc_html(print_r($state['last_error'], true)); ?></pre>
            </div>
            <?php endif; ?>

            <?php if (!empty($state) && !empty($state['site_id'])): ?>
            <div style="margin-top: 15px; padding: 10px; background: #f0f0f1; border-left: 4px solid #0073aa;">
                <p><strong>Current Progress:</strong> <?php echo esc_html($state['site_id']); ?></p>
                <?php if (!empty($state['binary_search_active'])): ?>
                    <div style="padding: 10px; background: #ffffcc; border-left: 3px solid #ff9800; margin: 10px 0;">
                        <p style="color: #0073aa;"><strong>🔍 Binary Search Active</strong></p>
                        <p style="font-size: 13px;">
                            Searching for corrupt article...<br>
                            Window size: <strong><?php echo isset($state['binary_search_per_page']) ? intval($state['binary_search_per_page']) : 100; ?></strong> |
                            Offset: <strong><?php echo isset($state['binary_search_offset']) ? intval($state['binary_search_offset']) : 0; ?></strong> |
                            Iterations: ~<?php echo 7 - (int)log(max(1, isset($state['binary_search_per_page']) ? intval($state['binary_search_per_page']) : 100), 2); ?>/7
                        </p>
                    </div>
                <?php endif; ?>
                <?php if ($mode === 'before_cursor' && !empty($state['cursor'])): ?>
                    <p>Cursor: <code><?php echo esc_html($state['cursor']); ?></code></p>
                <?php elseif (!empty($state['page'])): ?>
                    <p>Page: <strong><?php echo intval($state['page']); ?></strong></p>
                <?php endif; ?>
                <?php if (!empty($state['done'])): ?>
                    <p style="color: #46b450;"><strong>✓ Backfill Complete!</strong></p>
                <?php endif; ?>
                <?php if (!empty($state['skipped_articles']) && count($state['skipped_articles']) > 0): ?>
                    <p style="color: #ff9800; font-size: 13px;">
                        <strong>⚠ Skipped Articles:</strong> <?php echo count($state['skipped_articles']); ?>
                        corrupt article(s) found and skipped
                    </p>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>

        <!-- Backfill Controls -->
        <div class="card" style="max-width: none; margin-bottom: 20px;">
            <h2>Backfill Controls</h2>
            <p>Manual control of historical article ingestion.</p>

            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block; margin-right: 10px;">
                <input type="hidden" name="action" value="um_backfill_run_redirect">
                <?php wp_nonce_field('um_backfill_run'); ?>
                <button type="submit" class="button button-primary button-hero">
                    ▶ Run Single Batch
                </button>
            </form>

            <button type="button" id="um-continuous-run" class="button button-primary button-hero" style="margin-right: 10px;">
                ⏩ Run Continuous
            </button>

            <button type="button" id="um-stop-continuous" class="button button-secondary" style="display: none; margin-right: 10px;">
                ⏸ Stop
            </button>

            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block; margin-right: 10px;">
                <input type="hidden" name="action" value="um_backfill_reset_redirect">
                <?php wp_nonce_field('um_backfill_reset'); ?>
                <button type="submit" class="button button-secondary" onclick="return confirm('Reset backfill state? This will start from the beginning.');">
                    ↻ Reset Backfill
                </button>
            </form>

            <div id="um-continuous-progress" style="display: none; margin-top: 15px; padding: 10px; background: #f0f0f1; border-left: 4px solid #0073aa;">
                <p><strong>Continuous Run Progress:</strong></p>
                <p id="um-progress-text">Initializing...</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div>
                        <strong>Batches:</strong> <span id="um-batches-run">0</span><br>
                        <strong>Time Elapsed:</strong> <span id="um-time-elapsed">0s</span><br>
                        <strong>Last Batch:</strong> <span id="um-last-batch">0</span> articles
                    </div>
                    <div>
                        <strong>Total Articles:</strong><br>
                        <span style="color: #46b450;">✓ <span id="um-articles-inserted">0</span> new</span> |
                        <span style="color: #0073aa;">↻ <span id="um-articles-updated">0</span> updated</span><br>
                        <span style="color: #dba617;">⊘ <span id="um-articles-skipped">0</span> skipped</span> |
                        <span style="color: #d63638;">✗ <span id="um-articles-failed">0</span> failed</span>
                    </div>
                </div>
            </div>

            <div id="um-api-response" style="display: none; margin-top: 15px; padding: 10px; background: #f9f9f9; border-left: 4px solid #666;">
                <p><strong>Last API Response:</strong></p>
                <pre id="um-api-response-content" style="max-height: 400px; overflow-y: auto; background: #fff; padding: 10px; border: 1px solid #ddd; font-size: 11px; line-height: 1.4;"></pre>
            </div>

            <div style="margin-top: 15px; padding: 10px; background: #f9f9f9;">
                <p><strong>Auto-Run:</strong>
                    <?php if ($autorun_enabled): ?>
                        <span style="color: #46b450;">● Enabled</span> - Backfill runs automatically every 15 minutes
                    <?php else: ?>
                        <span style="color: #dc3232;">○ Disabled</span> - Manual runs only
                    <?php endif; ?>
                </p>
                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block;">
                    <?php if ($autorun_enabled): ?>
                        <input type="hidden" name="action" value="um_autorun_off_redirect">
                        <?php wp_nonce_field('um_autorun_off'); ?>
                        <button type="submit" class="button">Disable Auto-Run</button>
                    <?php else: ?>
                        <input type="hidden" name="action" value="um_autorun_on_redirect">
                        <?php wp_nonce_field('um_autorun_on'); ?>
                        <button type="submit" class="button button-primary">Enable Auto-Run</button>
                    <?php endif; ?>
                </form>
            </div>
        </div>

        <!-- Server Backfill Controls -->
        <?php
        $server_backfill_status = um_get_server_backfill_status();
        $is_server_active = $server_backfill_status['active'];
        $last_run = $server_backfill_status['last_run'];
        $started = $server_backfill_status['started'];
        $completed = $server_backfill_status['completed'];
        ?>
        <div class="card" style="max-width: none; margin-bottom: 20px;">
            <h2>Server-Side Backfill</h2>
            <p>Start a fully automated server-side backfill that runs every minute until complete. You can close this page and it will continue running in the background via WordPress cron.</p>

            <?php if ($is_server_active): ?>
                <div style="padding: 12px; background: #d4edda; border-left: 4px solid #28a745; margin-bottom: 15px;">
                    <p style="margin: 0; color: #155724;"><strong>🟢 Server Backfill ACTIVE</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 13px;">
                        Started: <?php echo human_time_diff($started) . ' ago'; ?><br>
                        Last run: <?php echo $last_run ? human_time_diff($last_run) . ' ago' : 'Not yet run'; ?><br>
                        Next run: <?php
                            $next = $server_backfill_status['next_run'];
                            if ($next) {
                                $diff = $next - time();
                                echo $diff > 0 ? 'in ' . $diff . ' seconds' : 'overdue';
                            } else {
                                echo 'Not scheduled';
                            }
                        ?>
                    </p>
                </div>

                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block;">
                    <input type="hidden" name="action" value="um_stop_server_backfill">
                    <?php wp_nonce_field('um_stop_server_backfill'); ?>
                    <button type="submit" class="button button-secondary button-hero">
                        ⏸ Stop Server Backfill
                    </button>
                </form>
            <?php else: ?>
                <?php if ($completed): ?>
                    <div style="padding: 12px; background: #e7f3ff; border-left: 4px solid #0073aa; margin-bottom: 15px;">
                        <p style="margin: 0; color: #004085;"><strong>✓ Server Backfill Completed</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">
                            Completed: <?php echo human_time_diff($completed) . ' ago'; ?>
                        </p>
                    </div>
                <?php endif; ?>

                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block;">
                    <input type="hidden" name="action" value="um_start_server_backfill">
                    <?php wp_nonce_field('um_start_server_backfill'); ?>
                    <button type="submit" class="button button-primary button-hero">
                        🚀 Start Server Backfill
                    </button>
                </form>
            <?php endif; ?>

            <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 13px;"><strong>💡 Tips:</strong></p>
                <ul style="margin: 5px 0 0 20px; font-size: 13px;">
                    <li>Set <strong>Backfill Mode</strong> to "Single Article" to skip bad articles automatically</li>
                    <li>Increase <strong>Backfill Pages Per Run</strong> to 25-50 for faster processing</li>
                    <li>Runs every 60 seconds - no need to keep page open</li>
                    <li>Auto-stops when backfill completes</li>
                </ul>
            </div>
        </div>

        <!-- Refresh Images -->
        <div class="card" style="max-width: none; margin-bottom: 20px;">
            <h2>Refresh Article Images</h2>
            <p>Re-fetch images for existing articles without resetting backfill. This will update the <code>um_image_urls</code> field for all stored articles.</p>

            <button type="button" id="um-refresh-images" class="button button-primary button-hero">
                🖼 Refresh All Images
            </button>

            <button type="button" id="um-stop-refresh-images" class="button button-secondary" style="display: none; margin-left: 10px;">
                ⏸ Stop
            </button>

            <div id="um-refresh-images-progress" style="display: none; margin-top: 15px; padding: 10px; background: #f0f0f1; border-left: 4px solid #0073aa;">
                <p><strong>Refresh Progress:</strong></p>
                <p id="um-refresh-progress-text">Initializing...</p>
                <div style="margin-top: 10px;">
                    <strong>Processed:</strong> <span id="um-refresh-processed">0</span> / <span id="um-refresh-total">0</span><br>
                    <strong>Updated:</strong> <span id="um-refresh-updated">0</span> |
                    <strong>Skipped:</strong> <span id="um-refresh-skipped">0</span> |
                    <strong>Failed:</strong> <span id="um-refresh-failed">0</span>
                </div>
                <div style="margin-top: 10px; background: #e0e0e0; border-radius: 4px; height: 20px;">
                    <div id="um-refresh-progress-bar" style="background: #0073aa; height: 100%; border-radius: 4px; width: 0%; transition: width 0.3s;"></div>
                </div>
            </div>
        </div>

        <!-- Incremental Controls -->
        <div class="card" style="max-width: none; margin-bottom: 20px;">
            <h2>Incremental Update Controls</h2>
            <p>Fetch new posts published since last check.</p>

            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block; margin-right: 10px;">
                <input type="hidden" name="action" value="um_incremental_run_redirect">
                <?php wp_nonce_field('um_incremental_run'); ?>
                <button type="submit" class="button button-primary">
                    ▶ Run Incremental Update
                </button>
            </form>

            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block;">
                <input type="hidden" name="action" value="um_incremental_reset_redirect">
                <?php wp_nonce_field('um_incremental_reset'); ?>
                <button type="submit" class="button button-secondary" onclick="return confirm('Reset incremental cursors?');">
                    ↻ Reset Cursors
                </button>
            </form>

            <div style="margin-top: 15px;">
                <?php foreach ($sites as $s):
                    $cursor = um_get_since($s['id']);
                ?>
                <p style="margin: 5px 0;">
                    <strong><?php echo esc_html($s['label']); ?>:</strong>
                    <?php if ($cursor): ?>
                        <code><?php echo esc_html($cursor); ?></code>
                    <?php else: ?>
                        <em>Not set</em>
                    <?php endif; ?>
                </p>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Danger Zone -->
        <div class="card" style="max-width: none; margin-bottom: 20px; border-left: 4px solid #dc3232;">
            <h2 style="color: #dc3232;">⚠ Danger Zone</h2>
            <p><strong>Delete all imported articles and reset state.</strong> This action cannot be undone.</p>

            <?php
            global $wpdb;
            $total_count = $wpdb->get_var("SELECT COUNT(1) FROM {$wpdb->posts} WHERE post_type = 'um_article'");
            ?>

            <p>Current article count: <strong><?php echo number_format($total_count); ?></strong></p>

            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline-block;">
                <input type="hidden" name="action" value="um_delete_all_redirect">
                <?php wp_nonce_field('um_delete_all'); ?>
                <button type="submit" class="button button-link-delete" style="color: #dc3232;" onclick="return confirm('⚠ WARNING: This will permanently delete ALL <?php echo number_format($total_count); ?> imported articles and reset backfill state.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure?');">
                    🗑 Delete All Articles & Reset State
                </button>
            </form>
        </div>

        <!-- Settings -->
        <div class="card" style="max-width: none;">
            <h2>Settings</h2>
            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                <input type="hidden" name="action" value="um_save_settings">
                <?php wp_nonce_field('um_save_settings'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">Posts Per Page</th>
                        <td>
                            <input type="number" name="um_per_page" value="<?php echo esc_attr(get_option('um_per_page', UMI_PER_PAGE)); ?>" min="1" max="100" class="small-text">
                            <p class="description">Number of posts to fetch per request (1-100). Default: 25</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">HTTP Timeout</th>
                        <td>
                            <input type="number" name="um_http_timeout" value="<?php echo esc_attr(get_option('um_http_timeout', UMI_HTTP_TIMEOUT)); ?>" min="10" max="300" class="small-text"> seconds
                            <p class="description">Timeout for remote requests. Default: 60</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Backfill Pages Per Run</th>
                        <td>
                            <input type="number" name="um_backfill_pages_per_run" value="<?php echo esc_attr(get_option('um_backfill_pages_per_run', UMI_BACKFILL_PAGES_PER_RUN)); ?>" min="1" max="50" class="small-text">
                            <p class="description">Number of pages to process per backfill run. Default: 1</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Backfill Mode</th>
                        <td>
                            <select name="um_backfill_mode">
                                <option value="batch" <?php selected(get_option('um_backfill_mode', 'batch'), 'batch'); ?>>Batch (with binary search)</option>
                                <option value="single" <?php selected(get_option('um_backfill_mode', 'batch'), 'single'); ?>>Single Article (simple, slower)</option>
                            </select>
                            <p class="description">
                                <strong>Batch:</strong> Fetches multiple articles at once. Uses binary search to identify corrupt articles (complex, fast).<br>
                                <strong>Single Article:</strong> Fetches one article at a time, retries 3 times, skips on failure (simple, slower).
                            </p>
                        </td>
                    </tr>
                </table>

                <p class="submit">
                    <button type="submit" class="button button-primary">Save Settings</button>
                </p>
            </form>

            <hr>
            <p><strong>Current Configuration:</strong></p>
            <ul style="font-family: monospace; font-size: 12px;">
                <li>SSL Verify: <code><?php echo UMI_SSL_VERIFY ? 'true' : 'false'; ?></code></li>
                <li>User Agent: <code><?php echo esc_html(UMI_HTTP_USER_AGENT); ?></code></li>
                <li>Lock TTL: <code><?php echo UMI_INGEST_LOCK_TTL; ?>s</code></li>
                <li>Backfill Mode: <code><?php echo defined('UMI_BACKFILL_MODE') ? UMI_BACKFILL_MODE : 'batch'; ?></code></li>
                <li>Enable Autorun Backfill: <code><?php echo UMI_ENABLE_AUTORUN_BACKFILL ? 'true' : 'false'; ?></code></li>
                <li>Enable Incremental: <code><?php echo UMI_ENABLE_INCREMENTAL ? 'true' : 'false'; ?></code></li>
            </ul>
        </div>
    </div>

    <script type="text/javascript">
    jQuery(document).ready(function($) {
        let continuousRunActive = false;
        let batchesRun = 0;
        let totalArticlesInserted = 0;
        let totalArticlesUpdated = 0;
        let totalArticlesSkipped = 0;
        let totalArticlesFailed = 0;
        let lastBatchProcessed = 0;
        let startTime = null;
        let timerInterval = null;
        let statusUpdateInterval = null;

        $('#um-continuous-run').on('click', function() {
            if (continuousRunActive) return;

            continuousRunActive = true;
            batchesRun = 0;
            totalArticlesInserted = 0;
            totalArticlesUpdated = 0;
            totalArticlesSkipped = 0;
            totalArticlesFailed = 0;
            lastBatchProcessed = 0;
            startTime = Date.now();

            $('#um-continuous-run').prop('disabled', true).text('⏳ Running...');
            $('#um-stop-continuous').show();
            $('#um-continuous-progress').show();
            $('#um-api-response').show();
            $('#um-progress-text').text('Starting continuous backfill...');
            $('#um-api-response-content').text('Waiting for first batch...');
            $('#um-batches-run').text(batchesRun);
            $('#um-articles-inserted').text(totalArticlesInserted);
            $('#um-articles-updated').text(totalArticlesUpdated);
            $('#um-articles-skipped').text(totalArticlesSkipped);
            $('#um-articles-failed').text(totalArticlesFailed);
            $('#um-last-batch').text(lastBatchProcessed);
            $('#um-time-elapsed').text('0s');

            // Start status table updates
            statusUpdateInterval = setInterval(updateStatusTable, 3000); // Update every 3 seconds

            // Start timer
            timerInterval = setInterval(updateTimer, 1000); // Update every second

            runNextBatch();
        });

        $('#um-stop-continuous').on('click', function() {
            continuousRunActive = false;
            $('#um-stop-continuous').hide();
            $('#um-continuous-run').prop('disabled', false).text('⏩ Run Continuous');
            $('#um-progress-text').html('<span style="color: #d63638;">⏸ Stopped by user</span>');

            // Stop status updates
            if (statusUpdateInterval) {
                clearInterval(statusUpdateInterval);
                statusUpdateInterval = null;
            }

            // Stop timer
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        });

        function updateTimer() {
            if (!startTime) return;

            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;

            let timeStr = '';
            if (minutes > 0) {
                timeStr = minutes + 'm ' + seconds + 's';
            } else {
                timeStr = seconds + 's';
            }

            $('#um-time-elapsed').text(timeStr);
        }

        function updateStatusTable() {
            $('#um-status-updating').show();

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'um_status_ajax'
                },
                success: function(response) {
                    if (response.success && response.data && response.data.rows) {
                        const rows = response.data.rows;
                        const tbody = $('#um-status-table-body');
                        tbody.empty();

                        rows.forEach(function(row) {
                            let statusHtml = '';
                            let rowStyle = '';

                            if (row.status === 'in_progress') {
                                statusHtml = '<span style="color: #0073aa;">● In Progress</span>';
                                rowStyle = ' style="background-color: #ffffcc;"';
                            } else if (row.status === 'complete') {
                                statusHtml = '<span style="color: #46b450;">✓ Complete</span>';
                            } else {
                                statusHtml = '<span style="color: #999;">○ Pending</span>';
                            }

                            const rowHtml = '<tr' + rowStyle + '>' +
                                '<td><strong>' + escapeHtml(row.label) + '</strong></td>' +
                                '<td>' + formatNumber(row.local) + '</td>' +
                                '<td>' + formatNumber(row.remote) + '</td>' +
                                '<td><code>' + escapeHtml(row.mode) + '</code></td>' +
                                '<td>' + statusHtml + '</td>' +
                                '</tr>';

                            tbody.append(rowHtml);
                        });
                    }
                    $('#um-status-updating').hide();
                },
                error: function() {
                    $('#um-status-updating').hide();
                }
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function runNextBatch() {
            if (!continuousRunActive) {
                return;
            }

            $('#um-progress-text').html('<span style="color: #0073aa;">⏳ Running batch ' + (batchesRun + 1) + '...</span>');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'um_backfill_ajax'
                },
                success: function(response) {
                    if (!continuousRunActive) {
                        return; // User stopped it
                    }

                    if (response.success && response.data) {
                        const result = response.data;

                        // Display the API response JSON
                        $('#um-api-response-content').text(JSON.stringify(result, null, 2));

                        batchesRun++;
                        totalArticlesInserted += (result.inserted || 0);
                        totalArticlesUpdated += (result.updated || 0);
                        totalArticlesSkipped += (result.skipped || 0);
                        totalArticlesFailed += (result.failed || 0);
                        lastBatchProcessed = (result.inserted || 0) + (result.updated || 0) + (result.skipped || 0);

                        $('#um-batches-run').text(batchesRun);
                        $('#um-articles-inserted').text(totalArticlesInserted);
                        $('#um-articles-updated').text(totalArticlesUpdated);
                        $('#um-articles-skipped').text(totalArticlesSkipped);
                        $('#um-articles-failed').text(totalArticlesFailed);
                        $('#um-last-batch').text(lastBatchProcessed);

                        // Check if backfill is complete
                        if (result.state && result.state.done) {
                            continuousRunActive = false;
                            $('#um-continuous-run').prop('disabled', false).text('⏩ Run Continuous');
                            $('#um-stop-continuous').hide();
                            $('#um-progress-text').html('<span style="color: #46b450;">✓ Backfill complete!</span>');

                            // Stop status updates
                            if (statusUpdateInterval) {
                                clearInterval(statusUpdateInterval);
                                statusUpdateInterval = null;
                            }

                            // Stop timer
                            if (timerInterval) {
                                clearInterval(timerInterval);
                                timerInterval = null;
                            }

                            // One final status update
                            updateStatusTable();

                            // Reload page to show final status
                            setTimeout(function() {
                                window.location.reload();
                            }, 2000);
                            return;
                        }

                        // Check for errors
                        if (!result.ok) {
                            continuousRunActive = false;
                            $('#um-continuous-run').prop('disabled', false).text('⏩ Run Continuous');
                            $('#um-stop-continuous').hide();
                            $('#um-progress-text').html('<span style="color: #d63638;">⚠ Error: ' + (result.message || 'Unknown error') + '</span>');

                            // Stop status updates
                            if (statusUpdateInterval) {
                                clearInterval(statusUpdateInterval);
                                statusUpdateInterval = null;
                            }

                            // Stop timer
                            if (timerInterval) {
                                clearInterval(timerInterval);
                                timerInterval = null;
                            }

                            // Reload page to show error details
                            setTimeout(function() {
                                window.location.reload();
                            }, 3000);
                            return;
                        }

                        // Update progress text with current site
                        let progressMsg = '';

                        // Check if binary search is active
                        if (result.state && result.state.binary_search_active) {
                            let windowSize = result.state.binary_search_per_page || 100;
                            let offset = result.state.binary_search_offset || 0;
                            let iterations = 7 - Math.floor(Math.log2(Math.max(1, windowSize)));

                            progressMsg = '🔍 <strong>Binary Search Active:</strong> ' +
                                'Window size ' + windowSize + ' | ' +
                                'Offset ' + offset + ' | ' +
                                'Iteration ~' + iterations + '/7';
                        } else {
                            // Normal processing
                            progressMsg = 'Processing: ' + (result.site || 'Unknown');
                            if (result.mode === 'before_cursor' && result.cursor) {
                                progressMsg += ' (cursor: ' + result.cursor.substring(0, 10) + '...)';
                            } else if (result.next_page) {
                                progressMsg += ' (page: ' + result.next_page + ')';
                            }
                            progressMsg += ' | Last batch: +' + ((result.inserted || 0) + (result.updated || 0)) + ' articles';
                        }

                        $('#um-progress-text').html('<span style="color: #0073aa;">' + progressMsg + '</span>');

                        // Continue to next batch after short delay
                        setTimeout(runNextBatch, 1000);
                    } else {
                        // Unexpected response format
                        continuousRunActive = false;
                        $('#um-continuous-run').prop('disabled', false).text('⏩ Run Continuous');
                        $('#um-stop-continuous').hide();
                        $('#um-progress-text').html('<span style="color: #d63638;">⚠ Unexpected response from server</span>');

                        // Stop status updates
                        if (statusUpdateInterval) {
                            clearInterval(statusUpdateInterval);
                            statusUpdateInterval = null;
                        }
                    }
                },
                error: function(xhr, status, error) {
                    continuousRunActive = false;
                    $('#um-continuous-run').prop('disabled', false).text('⏩ Run Continuous');
                    $('#um-stop-continuous').hide();
                    $('#um-progress-text').html('<span style="color: #d63638;">⚠ AJAX error: ' + error + '</span>');

                    // Stop status updates
                    if (statusUpdateInterval) {
                        clearInterval(statusUpdateInterval);
                        statusUpdateInterval = null;
                    }
                }
            });
        }

        // Refresh Images functionality
        let refreshActive = false;
        let refreshOffset = 0;
        let refreshTotal = 0;
        let refreshUpdated = 0;
        let refreshSkipped = 0;
        let refreshFailed = 0;

        $('#um-refresh-images').on('click', function() {
            if (refreshActive) return;

            refreshActive = true;
            refreshOffset = 0;
            refreshTotal = 0;
            refreshUpdated = 0;
            refreshSkipped = 0;
            refreshFailed = 0;

            $('#um-refresh-images').prop('disabled', true).text('⏳ Running...');
            $('#um-stop-refresh-images').show();
            $('#um-refresh-images-progress').show();
            $('#um-refresh-progress-text').text('Starting image refresh...');
            $('#um-refresh-processed').text('0');
            $('#um-refresh-total').text('...');
            $('#um-refresh-updated').text('0');
            $('#um-refresh-skipped').text('0');
            $('#um-refresh-failed').text('0');
            $('#um-refresh-progress-bar').css('width', '0%');

            runRefreshBatch();
        });

        $('#um-stop-refresh-images').on('click', function() {
            refreshActive = false;
            $('#um-stop-refresh-images').hide();
            $('#um-refresh-images').prop('disabled', false).text('🖼 Refresh All Images');
            $('#um-refresh-progress-text').html('<span style="color: #d63638;">⏸ Stopped by user</span>');
        });

        function runRefreshBatch() {
            if (!refreshActive) return;

            $('#um-refresh-progress-text').html('<span style="color: #0073aa;">⏳ Processing batch at offset ' + refreshOffset + '...</span>');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'um_refresh_images_ajax',
                    offset: refreshOffset
                },
                success: function(response) {
                    if (!refreshActive) return;

                    if (response.success && response.data) {
                        const result = response.data;

                        refreshTotal = result.total || refreshTotal;
                        refreshUpdated += (result.updated || 0);
                        refreshSkipped += (result.skipped || 0);
                        refreshFailed += (result.failed || 0);
                        refreshOffset = result.next_offset || (refreshOffset + result.processed);

                        const processed = Math.min(refreshOffset, refreshTotal);
                        const percent = refreshTotal > 0 ? Math.round((processed / refreshTotal) * 100) : 0;

                        $('#um-refresh-processed').text(processed);
                        $('#um-refresh-total').text(refreshTotal);
                        $('#um-refresh-updated').text(refreshUpdated);
                        $('#um-refresh-skipped').text(refreshSkipped);
                        $('#um-refresh-failed').text(refreshFailed);
                        $('#um-refresh-progress-bar').css('width', percent + '%');

                        if (result.done) {
                            refreshActive = false;
                            $('#um-refresh-images').prop('disabled', false).text('🖼 Refresh All Images');
                            $('#um-stop-refresh-images').hide();
                            $('#um-refresh-progress-text').html('<span style="color: #46b450;">✓ Image refresh complete!</span>');
                            return;
                        }

                        // Continue to next batch
                        setTimeout(runRefreshBatch, 500);
                    } else {
                        refreshActive = false;
                        $('#um-refresh-images').prop('disabled', false).text('🖼 Refresh All Images');
                        $('#um-stop-refresh-images').hide();
                        $('#um-refresh-progress-text').html('<span style="color: #d63638;">⚠ Error: ' + (response.data?.message || 'Unknown error') + '</span>');
                    }
                },
                error: function(xhr, status, error) {
                    refreshActive = false;
                    $('#um-refresh-images').prop('disabled', false).text('🖼 Refresh All Images');
                    $('#um-stop-refresh-images').hide();
                    $('#um-refresh-progress-text').html('<span style="color: #d63638;">⚠ AJAX error: ' + error + '</span>');
                }
            });
        }
    });
    </script>
    <?php
}

/* =========================================================
   Backfill endpoints
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

/* =========================================================
   Incremental endpoints
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

/* =========================================================
   Autorun toggle
   ========================================================= */

add_action('admin_post_um_autorun_on', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    um_autorun_set(true);
    echo '<pre>Auto backfill enabled.</pre>';
    exit;
});

add_action('admin_post_um_autorun_off', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    um_autorun_set(false);
    echo '<pre>Auto backfill disabled.</pre>';
    exit;
});

/* =========================================================
   Redirect handlers for control page buttons
   ========================================================= */

add_action('admin_post_um_backfill_run_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_backfill_run');

    um_run_backfill_batch(um_sites_config());

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'backfill_run'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_backfill_reset_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_backfill_reset');

    um_backfill_reset_state();

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'backfill_reset'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_autorun_on_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_autorun_on');

    um_autorun_set(true);

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'autorun_enabled'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_autorun_off_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_autorun_off');

    um_autorun_set(false);

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'autorun_disabled'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_incremental_run_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_incremental_run');

    um_run_incremental_once();

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'incremental_run'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_incremental_reset_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_incremental_reset');

    um_reset_all_since();

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'incremental_reset'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_start_server_backfill', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_start_server_backfill');

    um_start_server_backfill();

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'server_backfill_started'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_stop_server_backfill', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_stop_server_backfill');

    um_stop_server_backfill();

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'server_backfill_stopped'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_save_settings', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_save_settings');

    // Save settings
    if (isset($_POST['um_per_page'])) {
        $per_page = max(1, min(100, intval($_POST['um_per_page'])));
        update_option('um_per_page', $per_page, false);
    }

    if (isset($_POST['um_http_timeout'])) {
        $timeout = max(10, min(300, intval($_POST['um_http_timeout'])));
        update_option('um_http_timeout', $timeout, false);
    }

    if (isset($_POST['um_backfill_pages_per_run'])) {
        $pages = max(1, min(50, intval($_POST['um_backfill_pages_per_run'])));
        update_option('um_backfill_pages_per_run', $pages, false);
    }

    if (isset($_POST['um_backfill_mode'])) {
        $mode = sanitize_text_field($_POST['um_backfill_mode']);
        if (in_array($mode, array('batch', 'single'), true)) {
            update_option('um_backfill_mode', $mode, false);
        }
    }

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'settings_saved'),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

add_action('admin_post_um_delete_all_redirect', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');
    check_admin_referer('um_delete_all');

    global $wpdb;

    // Delete all um_article posts
    $ids = $wpdb->get_col("
        SELECT ID
        FROM {$wpdb->posts}
        WHERE post_type = 'um_article'
    ");

    $count = 0;
    if ($ids) {
        foreach ($ids as $id) {
            wp_delete_post((int)$id, true); // Force delete (bypass trash)
            $count++;
        }
    }

    // Reset backfill state
    um_backfill_reset_state();

    // Reset incremental cursors
    um_reset_all_since();

    wp_safe_redirect(add_query_arg(
        array('page' => 'um-ingestor-control', 'um_action' => 'deleted_all', 'um_count' => $count),
        admin_url('edit.php?post_type=um_article')
    ));
    exit;
});

/* =========================================================
   AJAX handler for continuous backfill
   ========================================================= */

add_action('wp_ajax_um_backfill_ajax', function () {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
        return;
    }

    $result = um_run_backfill_batch(um_sites_config());
    wp_send_json_success($result);
});

/* =========================================================
   AJAX handler for status table updates
   ========================================================= */

/* =========================================================
   AJAX handler for image refresh
   ========================================================= */

add_action('wp_ajax_um_refresh_images_ajax', function () {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
        return;
    }

    $offset = isset($_POST['offset']) ? intval($_POST['offset']) : 0;
    $batch_size = 10; // Process 10 articles per batch

    // Get total count
    global $wpdb;
    $total = (int) $wpdb->get_var("SELECT COUNT(1) FROM {$wpdb->posts} WHERE post_type = 'um_article' AND post_status = 'publish'");

    // Get batch of articles
    $articles = get_posts(array(
        'post_type'      => 'um_article',
        'post_status'    => 'publish',
        'posts_per_page' => $batch_size,
        'offset'         => $offset,
        'orderby'        => 'ID',
        'order'          => 'DESC',
    ));

    if (empty($articles)) {
        wp_send_json_success(array(
            'done'      => true,
            'total'     => $total,
            'processed' => 0,
            'updated'   => 0,
            'skipped'   => 0,
            'failed'    => 0,
        ));
        return;
    }

    // Build site lookup
    $sites_config = um_sites_config();
    $sites_by_id = array();
    foreach ($sites_config as $site) {
        $sites_by_id[$site['id']] = $site;
    }

    $updated = 0;
    $skipped = 0;
    $failed = 0;

    foreach ($articles as $article) {
        $post_id = $article->ID;
        $site_id = get_post_meta($post_id, UMI_SOURCE_SITE_META_KEY, true);
        $remote_id = get_post_meta($post_id, UMI_REMOTE_ID_META_KEY, true);

        if (empty($site_id) || empty($remote_id) || !isset($sites_by_id[$site_id])) {
            $skipped++;
            continue;
        }

        $site = $sites_by_id[$site_id];
        $base = $site['base'];

        // Fetch the remote post by ID
        $url = rtrim($base, '/') . '/wp-json/wp/v2/posts/' . intval($remote_id) . '?_embed=1';
        $result = um_http_get($url, 2);

        if (!$result['ok'] || empty($result['data'])) {
            $failed++;
            continue;
        }

        $remote_post = $result['data'];

        // Extract featured image
        $featured_image = '';
        if (!empty($remote_post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
            $featured_image = esc_url_raw($remote_post['_embedded']['wp:featuredmedia'][0]['source_url']);
        }

        // Extract ALL images
        $all_image_urls = array();

        // 1. Add featured image first
        if ($featured_image) {
            $all_image_urls[] = $featured_image;
        }

        // 2. Extract gallery media IDs and fetch their URLs
        $content_html = !empty($remote_post['content']['rendered']) ? $remote_post['content']['rendered'] : '';
        $gallery_ids = um_extract_gallery_ids($content_html);

        if (!empty($gallery_ids)) {
            $media_result = um_fetch_media_urls($base, $gallery_ids);
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

        // Dedupe while preserving order
        $all_image_urls = array_values(array_unique($all_image_urls));

        // Update the meta field
        if (!empty($all_image_urls)) {
            update_post_meta($post_id, 'um_image_urls', wp_json_encode($all_image_urls));
            $updated++;
        } else {
            $skipped++;
        }
    }

    $next_offset = $offset + count($articles);
    $done = $next_offset >= $total;

    wp_send_json_success(array(
        'done'        => $done,
        'total'       => $total,
        'processed'   => count($articles),
        'updated'     => $updated,
        'skipped'     => $skipped,
        'failed'      => $failed,
        'next_offset' => $next_offset,
    ));
});

/* =========================================================
   AJAX handler for status table updates
   ========================================================= */

add_action('wp_ajax_um_status_ajax', function () {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
        return;
    }

    $sites = um_sites_config();
    $state = um_backfill_get_state();

    $rows = array();

    foreach ($sites as $s) {
        $local = um_local_count_for_site($s['id']);
        $remote = um_get_site_post_totals($s['base']);
        $mode = isset($s['backfill_mode']) ? $s['backfill_mode'] : 'page';
        $is_current = !empty($state['site_id']) && $state['site_id'] === $s['id'];

        $status = 'pending';
        if ($is_current) {
            $status = 'in_progress';
        } elseif ($local >= ($remote['total'] ?? 0)) {
            $status = 'complete';
        }

        $rows[] = array(
            'id' => $s['id'],
            'label' => $s['label'],
            'local' => $local,
            'remote' => !empty($remote['ok']) ? $remote['total'] : 0,
            'mode' => $mode,
            'status' => $status,
            'is_current' => $is_current,
        );
    }

    wp_send_json_success(array('rows' => $rows));
});

/* =========================================================
   Admin notices for control page actions
   ========================================================= */

add_action('admin_notices', function () {
    if (empty($_GET['page']) || $_GET['page'] !== 'um-ingestor-control') {
        return;
    }

    if (empty($_GET['um_action'])) {
        return;
    }

    $action = sanitize_key($_GET['um_action']);

    if ($action === 'deleted_all') {
        $count = isset($_GET['um_count']) ? intval($_GET['um_count']) : 0;
        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p><strong>Deleted ' . number_format($count) . ' articles.</strong> Backfill and incremental state have been reset.</p>';
        echo '</div>';
        return;
    }

    $messages = array(
        'backfill_run' => array('success', 'Backfill batch executed successfully.'),
        'backfill_reset' => array('success', 'Backfill state has been reset.'),
        'autorun_enabled' => array('success', 'Auto-run backfill enabled.'),
        'autorun_disabled' => array('info', 'Auto-run backfill disabled.'),
        'incremental_run' => array('success', 'Incremental update executed successfully.'),
        'incremental_reset' => array('success', 'Incremental cursors have been reset.'),
        'settings_saved' => array('success', 'Settings saved successfully.'),
        'server_backfill_started' => array('success', 'Server-side backfill started! It will run every minute in the background. You can close this page.'),
        'server_backfill_stopped' => array('info', 'Server-side backfill stopped.'),
    );

    if (isset($messages[$action])) {
        list($type, $message) = $messages[$action];
        echo '<div class="notice notice-' . esc_attr($type) . ' is-dismissible"><p>' . esc_html($message) . '</p></div>';
    }
});

/* =========================================================
   Status endpoint
   ========================================================= */

add_action('admin_post_um_status', function () {
    if (!current_user_can('manage_options')) wp_die('Forbidden');

    $sites = um_sites_config();
    $rows = array();

    foreach ($sites as $s) {
        $site_id = $s['id'];

        $local = um_local_count_for_site($site_id);
        $remote = um_get_site_post_totals($s['base']);

        $rows[] = array(
            'site'          => $site_id,
            'local_count'   => $local,
            'remote_total'  => !empty($remote['ok']) ? $remote['total'] : null,
            'remote_pages'  => !empty($remote['ok']) ? $remote['pages'] : null,
            'remote_ok'     => !empty($remote['ok']),
            'autorun'       => um_autorun_is_enabled(),
        );

        usleep(200000);
    }

    echo '<pre>' . esc_html(print_r($rows, true)) . '</pre>';
    exit;
});

/* =========================================================
   Admin UI: Quick Link to Control Page
   ========================================================= */

/**
 * Add a quick link to the control page on the UM Articles list.
 */
add_action('admin_notices', function () {
    $screen = get_current_screen();

    if (!$screen || $screen->id !== 'edit-um_article') {
        return;
    }

    $control_url = admin_url('edit.php?post_type=um_article&page=um-ingestor-control');

    echo '<div class="notice notice-info">';
    echo '<p>';
    echo '<strong>Ingestor Control:</strong> ';
    echo '<a href="' . esc_url($control_url) . '" class="button button-primary">Open Control Panel</a> ';
    echo 'to run backfill, view status, adjust settings, or manage articles.';
    echo '</p>';
    echo '</div>';
});

/* =========================================================
   Admin UI: Custom Columns for UM Articles List
   ========================================================= */

/**
 * Add custom columns to the UM Articles list table.
 */
add_filter('manage_um_article_posts_columns', function ($columns) {
    // Insert source column after title
    $new_columns = array();
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        if ($key === 'title') {
            $new_columns['um_source'] = 'Source';
        }
    }
    return $new_columns;
});

/**
 * Populate the source column with data.
 */
add_action('manage_um_article_posts_custom_column', function ($column_name, $post_id) {
    if ($column_name === 'um_source') {
        $source_id = get_post_meta($post_id, UMI_SOURCE_SITE_META_KEY, true);
        $source_label = get_post_meta($post_id, 'um_source_label', true);
        $source_url = get_post_meta($post_id, UMI_SOURCE_URL_META_KEY, true);

        if ($source_label) {
            // Add color coding based on source
            $colors = array(
                'echo-media' => '#ff6600',
                'internationalspectrum' => '#00a32a',
                'diplomaticwatch' => '#0073aa',
            );
            $color = isset($colors[$source_id]) ? $colors[$source_id] : '#999';

            echo '<span style="display: inline-block; padding: 3px 8px; background: ' . esc_attr($color) . '; color: white; border-radius: 3px; font-size: 11px; font-weight: 600;">';
            echo esc_html($source_label);
            echo '</span>';

            if ($source_url) {
                echo '<br><small><a href="' . esc_url($source_url) . '" target="_blank" style="text-decoration: none;">View Original →</a></small>';
            }
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}, 10, 2);

/**
 * Make the source column sortable.
 */
add_filter('manage_edit-um_article_sortable_columns', function ($columns) {
    $columns['um_source'] = 'um_source_site';
    return $columns;
});

/**
 * Handle sorting by source.
 */
add_action('pre_get_posts', function ($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }

    $orderby = $query->get('orderby');

    if ($orderby === 'um_source_site') {
        $query->set('meta_key', UMI_SOURCE_SITE_META_KEY);
        $query->set('orderby', 'meta_value');
    }
});
