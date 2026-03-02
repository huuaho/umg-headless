<?php
/**
 * UMG Photo Contest - Configuration
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   JWT Configuration
   ========================================================= */

/**
 * JWT signing secret.
 * Define UMGPC_JWT_SECRET in wp-config.php for production.
 * Falls back to WordPress AUTH_KEY.
 */
if (!defined('UMGPC_JWT_SECRET')) {
    define('UMGPC_JWT_SECRET', AUTH_KEY);
}

/** JWT token lifetime: 7 days */
define('UMGPC_JWT_EXPIRY', 604800);

/** Auth code lifetime: 15 minutes */
define('UMGPC_CODE_EXPIRY', 900);

/* =========================================================
   Stripe Configuration
   ========================================================= */

/**
 * Stripe webhook signing secret.
 * Define UMGPC_STRIPE_WEBHOOK_SECRET in wp-config.php.
 */
if (!defined('UMGPC_STRIPE_WEBHOOK_SECRET')) {
    define('UMGPC_STRIPE_WEBHOOK_SECRET', '');
}

/* =========================================================
   CORS Configuration
   ========================================================= */

/**
 * Allowed CORS origins for the REST API.
 */
function umgpc_allowed_origins() {
    return array(
        'http://localhost:3000',
        'https://www.unitedmediadc.com',
        'https://unitedmediadc.com',
    );
}
