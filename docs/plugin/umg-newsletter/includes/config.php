<?php
/**
 * UMG Newsletter - Configuration
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Mailchimp Configuration
   ========================================================= */

/**
 * Mailchimp API key.
 * Define MAILCHIMP_API_KEY in wp-config.php.
 */
if (!defined('MAILCHIMP_API_KEY')) {
    define('MAILCHIMP_API_KEY', '');
}

/**
 * Mailchimp audience (list) ID.
 * Define MAILCHIMP_LIST_ID in wp-config.php.
 */
if (!defined('MAILCHIMP_LIST_ID')) {
    define('MAILCHIMP_LIST_ID', '');
}

/**
 * Mailchimp data center prefix (e.g. us21).
 * Define MAILCHIMP_SERVER_PREFIX in wp-config.php.
 */
if (!defined('MAILCHIMP_SERVER_PREFIX')) {
    define('MAILCHIMP_SERVER_PREFIX', '');
}

/* =========================================================
   Rate Limiting
   ========================================================= */

/** Max subscribe requests per IP per hour */
define('UMG_NL_RATE_LIMIT', 5);

/* =========================================================
   CORS Configuration
   ========================================================= */

/**
 * Allowed CORS origins for the newsletter endpoint.
 * Reuses the same origins as the photo contest plugin.
 */
function umg_nl_allowed_origins() {
    return array(
        'http://localhost:3000',
        'https://www.unitedmediadc.com',
        'https://unitedmediadc.com',
    );
}
