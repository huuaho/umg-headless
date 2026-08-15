# docs/plugin/umg-photo-contest/includes/roles.php

**Purpose:** Registers the "Contest Judge" WordPress role and the two custom capabilities that gate the judging REST endpoints, plus the shared "Bearer JWT **and** capability" guard and the blind-judging switch.

## Responsibilities
Introduces the plugin's first authorization tier above "any applicant." Every account this plugin creates via `POST /auth/request-code` is a plain `subscriber` (see [auth.php](auth.php.md)), so authenticated never meant authorized — until judging, no endpoint needed more than "the caller owns this post." This file defines who may read other people's entries: a `umgpc_judge` role carrying `umgpc_judge_submissions`, and administrators, who additionally get `umgpc_admin_results` for cross-judge aggregation. Judges are provisioned by hand in wp-admin (Users → assign role "Contest Judge" to an account whose email will be used to log in through the normal email-code flow); no REST endpoint grants or revokes the role.

## Key exports
- `umgpc_register_roles()` — hooked to `init` (runs on every request, idempotently, not just on activation, so redeploying plugin files to a live install takes effect without a deactivate/reactivate cycle). Creates the `umgpc_judge` role ("Contest Judge") with `read` + `umgpc_judge_submissions` if it doesn't already exist, and adds `umgpc_judge_submissions` + `umgpc_admin_results` to the `administrator` role if missing.
- `umgpc_require_cap(WP_REST_Request $request, string $cap) -> int|WP_Error` — validates the bearer token via `umgpc_get_user_from_request()` ([jwt.php](jwt.php.md); 401 on missing/invalid/expired), then `user_can($user_id, $cap)` (403 `forbidden` otherwise). Returns the user id. This is the guard at the top of every route in [judging.php](judging.php.md).
- `umgpc_is_blind_judging() -> bool` — reads WP option `umgpc_blind_judging` (default `'1'` = ON). When on, judge-facing responses omit entrant identity (name, school, grade, recommender); admins always see identity. Stored as an option so it can be flipped without a deploy (`wp option update umgpc_blind_judging 0`, or via a DB edit — there is no settings UI).

## Dependencies
- Internal: [jwt.php](jwt.php.md) (`umgpc_get_user_from_request`).
- External: WordPress roles/capabilities API (`add_role`, `get_role`, `WP_Role::add_cap`, `user_can`), options API.

## Used by
- [judging.php](judging.php.md) — `umgpc_require_cap()` on all four routes, `umgpc_is_blind_judging()` for identity gating.
- [auth.php](auth.php.md) — `POST /auth/verify-code` and `GET /me` expose `is_judge` / `is_admin` booleans computed from these two capabilities, which the frontend's [AdminGuard.tsx](../../../apps/umg/app/admin/AdminGuard.tsx.md) uses to gate the `/admin` route client-side.

## Notes
- Capabilities are added to the *role* objects, which WordPress persists in the `wp_user_roles` option — so the `add_cap` calls only write on first run and are cheap no-ops afterwards (`has_cap` checks first).
- The role is never removed on deactivation (no `remove_role`); harmless, but a fresh install elsewhere would carry it in the DB after any run.
- Blind judging defaults ON because entries contain minors' PII; the `recommender` field is identity-gated too (a named recommender could bias scoring).
- Loaded after jwt.php and before auth.php in the bootstrap order (see [../umg-photo-contest.php](../umg-photo-contest.php.md)) since both auth.php and judging.php depend on it.

---
*Documented at commit bde729d.*
