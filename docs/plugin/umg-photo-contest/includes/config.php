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

/**
 * Stripe API secret key, used only to create school-batch Checkout
 * Sessions (POST /umg/v1/school/checkout in school.php). Restricted key,
 * Checkout Sessions: write only — see
 * claude-context/current-work/bulk-registration/stripe-secret-key-setup.md.
 * Distinct from UMGPC_STRIPE_WEBHOOK_SECRET above, which only verifies
 * inbound webhooks and can't make outbound API calls.
 * Define UMGPC_STRIPE_SECRET_KEY in wp-config.php.
 */
if (!defined('UMGPC_STRIPE_SECRET_KEY')) {
    define('UMGPC_STRIPE_SECRET_KEY', '');
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
