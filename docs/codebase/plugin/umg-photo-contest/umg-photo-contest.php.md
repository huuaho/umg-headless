# docs/plugin/umg-photo-contest/umg-photo-contest.php

**Purpose:** Plugin bootstrap for "UMG Photo Contest" — loads all includes and wires activation/deactivation hooks.

## Responsibilities
Entry point of the photo competition plugin (deployed to `wp-content/plugins/umg-photo-contest/` on api.unitedmediadc.com). Defines `UMGPC_PATH`, requires every file in `includes/` in dependency order (config → cors → post-types → entry-state → jwt → roles → auth → payment → draft → submission → judging → school → admin-tools → cleanup — fourteen files), and registers activation/deactivation handlers. `entry-state.php` is loaded early because submission/school/cleanup all call its helpers; `roles.php` sits between jwt and auth because auth.php reports the judge/admin capabilities it defines and judging.php's guard wraps jwt.php's.

## Key exports
- `UMGPC_PATH` (constant) — plugin directory path.
- `register_activation_hook` closure — calls `umgpc_register_post_types()` + `flush_rewrite_rules()`, and schedules the weekly `umgpc_cleanup_orphaned_drafts` cron event if not already scheduled.
- `register_deactivation_hook` closure — clears the `umgpc_cleanup_orphaned_drafts` cron and flushes rewrite rules.

## Dependencies
- Internal: [includes/config.php](includes/config.php.md), [includes/cors.php](includes/cors.php.md), [includes/post-types.php](includes/post-types.php.md), [includes/entry-state.php](includes/entry-state.php.md), [includes/jwt.php](includes/jwt.php.md), [includes/roles.php](includes/roles.php.md), [includes/auth.php](includes/auth.php.md), [includes/payment.php](includes/payment.php.md), [includes/draft.php](includes/draft.php.md), [includes/submission.php](includes/submission.php.md), [includes/judging.php](includes/judging.php.md), [includes/school.php](includes/school.php.md), [includes/admin-tools.php](includes/admin-tools.php.md), [includes/cleanup.php](includes/cleanup.php.md)
- External: WordPress plugin API (`register_activation_hook`, `wp_schedule_event`, `flush_rewrite_rules`).

## Used by
WordPress core loads this file as the plugin main file. All `/wp-json/umg/v1/*` photo-contest routes registered by the includes are consumed by the UMG frontend: [apps/umg/lib/auth/api.ts](../../apps/umg/lib/auth/api.ts.md) (individual flow), [apps/umg/lib/school/api.ts](../../apps/umg/lib/school/api.ts.md) (school flow), and `apps/umg/lib/judging/api.ts` (judge panel; not yet mirrored in docs).

## Notes
- Cron schedule `weekly` is assumed to exist (WP ships it since 5.4).
- Version 1.0.0; no settings UI — all configuration via constants in `wp-config.php` (see [includes/config.php](includes/config.php.md)), plus one runtime WP option `umgpc_blind_judging` (see [includes/roles.php](includes/roles.php.md)).
- Activation only handles the CPT flush and cron; the judge role/capabilities are registered idempotently on every `init` by roles.php, so a file-only redeploy picks them up without reactivation.

---
*Documented at commit bde729d.*
