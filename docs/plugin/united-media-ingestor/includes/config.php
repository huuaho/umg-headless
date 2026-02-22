<?php
/**
 * United Media Ingestor – Configuration
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Remote sites configuration
   ========================================================= */

/**
 * Canonical list of source sites.
 * This is the ONLY place site URLs should live.
 *
 * Order matters: sites are processed in the order listed.
 * Smaller sites (Echo Media, International Spectrum) are prioritized
 * to complete quickly before the larger Diplomatic Watch archive.
 */
function um_sites_config() {
  return array(
    array(
      'id' => 'echo-media',
      'base' => 'https://api.echo-media.info',
      'label' => 'Echo Media',
      'backfill_mode' => 'page',
    ),
    array(
      'id' => 'internationalspectrum',
      'base' => 'https://api.internationalspectrum.org',
      'label' => 'International Spectrum',
      'backfill_mode' => 'page',
    ),
    array(
      'id' => 'diplomaticwatch',
      'base' => 'https://diplomaticwatch.com',
      'label' => 'Diplomatic Watch',
      'backfill_mode' => 'page',
    ),
  );
}


/* =========================================================
   HTTP / ingestion tuning
   ========================================================= */

/**
 * Max posts per page when calling WP REST.
 * 100 is the WP hard limit.
 * Reduce to 50 if a site throws HTTP 500s.
 * Can be overridden in admin settings.
 */
define('UMI_PER_PAGE', (int) get_option('um_per_page', 25));

/**
 * Pages processed per backfill run.
 * Keep small (1–3) to avoid timeouts.
 * Can be overridden in admin settings.
 */
define('UMI_BACKFILL_PAGES_PER_RUN', (int) get_option('um_backfill_pages_per_run', 1));

/**
 * Timeout for remote HTTP calls (seconds).
 * Can be overridden in admin settings.
 */
define('UMI_HTTP_TIMEOUT', (int) get_option('um_http_timeout', 60));

/**
 * TEMPORARY: bypass SSL verification.
 * Set to true once remote certs are fixed.
 */
define('UMI_SSL_VERIFY', false);

/**
 * User-Agent for remote calls (helps some WAFs).
 */
define('UMI_HTTP_USER_AGENT', 'UnitedMediaIngestor/0.9.0 (+WordPress)');

/* =========================================================
   Backfill / automation toggles
   ========================================================= */

/**
 * Enable automatic backfill continuation via cron.
 */
define('UMI_ENABLE_AUTORUN_BACKFILL', true);

/**
 * Enable incremental updates via cron.
 */
define('UMI_ENABLE_INCREMENTAL', true);

/**
 * Backfill processing mode:
 * - 'batch' (default): Fetch multiple articles at once with binary search for corrupt articles
 * - 'single': Fetch one article at a time, retry 3 times, skip on failure (simpler, slower)
 * Can be overridden in admin settings.
 */
define('UMI_BACKFILL_MODE', get_option('um_backfill_mode', 'batch'));

/**
 * Lock TTL (seconds) to prevent overlapping runs.
 */
define('UMI_INGEST_LOCK_TTL', 180);

/* =========================================================
   Storage behavior
   ========================================================= */

/**
 * Whether to ingest excluded categories
 * and mark them as excluded instead of skipping.
 */
define('UMI_INGEST_EXCLUDED', true);

/**
 * Meta key used to flag excluded items.
 */
define('UMI_EXCLUDED_META_KEY', 'um_is_excluded');

/**
 * Meta key storing original source URL.
 */
define('UMI_SOURCE_URL_META_KEY', 'um_source_url');

/**
 * Meta key storing source site id.
 */
define('UMI_SOURCE_SITE_META_KEY', 'um_source_site');

/**
 * Meta key storing remote post id.
 */
define('UMI_REMOTE_ID_META_KEY', 'um_remote_post_id');
