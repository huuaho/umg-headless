# docs/plugin/umg-newsletter/umg-newsletter.php

**Purpose:** Plugin bootstrap for "UMG Newsletter" — loads config, CORS, and the subscribe endpoint.

## Responsibilities
Entry point of the newsletter plugin (deployed to `wp-content/plugins/umg-newsletter/` on api.unitedmediadc.com). Defines `UMG_NL_PATH` and requires the three include files. No activation hooks, CPTs, or cron — the plugin is a thin Mailchimp proxy.

## Key exports
- `UMG_NL_PATH` (constant) — plugin directory path.

## Dependencies
- Internal: [includes/config.php](includes/config.php.md), [includes/cors.php](includes/cors.php.md), [includes/subscribe.php](includes/subscribe.php.md)
- External: none beyond WordPress core.

## Used by
WordPress core loads it as the plugin main file. The single REST route it provides (`POST /wp-json/umg/v1/subscribe`) is consumed by the shared frontend newsletter form ([packages/ui/NewsletterSignup.tsx](../../packages/ui/NewsletterSignup.tsx.md), rendered by [packages/ui/Footer.tsx](../../packages/ui/Footer.tsx.md)).

## Notes
- Shares the `umg/v1` REST namespace with the photo contest plugin; CORS coordination between the two is handled in [includes/cors.php](includes/cors.php.md).

---
*Documented at commit 1cbdce5.*
