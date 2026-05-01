<?php
/**
 * Plugin Name: UMG Newsletter
 * Description: Custom Mailchimp newsletter signup endpoint for the UMG website.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

define('UMG_NL_PATH', plugin_dir_path(__FILE__));

require_once UMG_NL_PATH . 'includes/config.php';
require_once UMG_NL_PATH . 'includes/cors.php';
require_once UMG_NL_PATH . 'includes/subscribe.php';
