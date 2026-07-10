<?php
/**
 * UMG Photo Contest - School Bulk Registration: Application Endpoints
 *
 * Day-one stopgap for school/bulk registration — see
 * claude-context/current-work/bulk-registration/implementation-checklist.md.
 * Each school-created umg_submission post is a full, independent application,
 * marked with umgpc_school_batch = '1' so it never collides with the
 * single-draft-per-user lookup in draft.php (umgpc_find_draft_id), which is
 * intentionally left untouched by this file.
 *
 * 1. GET    /umg/v1/school/applications                        — list caller's applications
 * 2. POST   /umg/v1/school/applications                         — create a new blank application
 * 3. GET    /umg/v1/school/application/(?P<id>\d+)               — full detail
 * 4. PUT    /umg/v1/school/application/(?P<id>\d+)               — upsert fields
 * 5. DELETE /umg/v1/school/application/(?P<id>\d+)               — delete (not if submitted)
 * 6. POST   /umg/v1/school/application/(?P<id>\d+)/photo         — upload a photo
 * 7. DELETE /umg/v1/school/application/(?P<id>\d+)/photo/(?P<mediaId>\d+) — remove a photo
 * 8. POST   /umg/v1/school/application/(?P<id>\d+)/submit        — finalize
 * 8b. POST  /umg/v1/school/application/(?P<id>\d+)/unsubmit      — revert to draft for edits
 *                                                                   (blocked once paid; guards
 *                                                                   in entry-state.php)
 * 9. POST   /umg/v1/school/application/(?P<id>\d+)/retitle       — recompute wp-admin title
 *                                                                   (bypasses the submitted lock;
 *                                                                   cosmetic only, never touches
 *                                                                   application content)
 * 10. POST  /umg/v1/school/checkout                              — create one Stripe Checkout
 *                                                                   Session covering every
 *                                                                   submitted-unpaid application
 *                                                                   the caller owns
 */

if (!defined('ABSPATH')) exit;

// How long a Stripe Checkout Session stays open before Stripe itself
// expires it (set explicitly on session creation — see
// umgpc_school_create_checkout — rather than trusting Stripe's own
// 24-hour default). 1800s is Stripe's documented minimum for expires_at.
define('UMGPC_SCHOOL_CHECKOUT_SESSION_TTL', 1800);

// Buffer added on top of UMGPC_SCHOOL_CHECKOUT_SESSION_TTL when telling
// Stripe the session's actual expires_at, guarding against Stripe
// validating "at least 30 minutes from now" against its own clock a
// moment after this request is sent. Defined once and reused below (not
// duplicated as a separate literal) so the lock TTL's margin over the
// real Stripe expiry can't silently drift out of sync with this value.
define('UMGPC_SCHOOL_CHECKOUT_EXPIRY_BUFFER', 120);

// How long the "checkout in progress" lock blocks a second Checkout
// Session for the same batch. MUST stay longer than the session's REAL
// expiry (UMGPC_SCHOOL_CHECKOUT_SESSION_TTL + UMGPC_SCHOOL_CHECKOUT_EXPIRY_BUFFER,
// which is what's actually sent to Stripe as expires_at) — the lock's
// whole job is to prevent a second session from being created while an
// earlier one could still be completed, so if the lock ever expired first
// there would be a window where session 1 is still payable but a retry
// could open session 2 anyway. The extra 300s beyond the session's real
// expiry is slack for webhook delivery delay after Stripe expires the
// session, plus the async-payment-method settlement window (e.g. Alipay
// can settle well after the checkout page itself closes — see
// payment.php); confirmed against Stripe's docs that expires_at has no
// documented incompatibility with async/redirect payment methods.
define('UMGPC_SCHOOL_CHECKOUT_LOCK_TTL', UMGPC_SCHOOL_CHECKOUT_SESSION_TTL + UMGPC_SCHOOL_CHECKOUT_EXPIRY_BUFFER + 300);

add_action('rest_api_init', function () {

    // GET /umg/v1/school/applications
    register_rest_route('umg/v1', '/school/applications', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_school_list_applications',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/school/applications
    register_rest_route('umg/v1', '/school/applications', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_school_create_application',
        'permission_callback' => '__return_true',
    ));

    // GET /umg/v1/school/application/{id}
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_school_get_application',
        'permission_callback' => '__return_true',
    ));

    // PUT /umg/v1/school/application/{id}
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'umgpc_school_update_application',
        'permission_callback' => '__return_true',
    ));

    // DELETE /umg/v1/school/application/{id}
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'umgpc_school_delete_application',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/school/application/{id}/photo
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)/photo', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_school_upload_photo',
        'permission_callback' => '__return_true',
    ));

    // DELETE /umg/v1/school/application/{id}/photo/{mediaId}
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)/photo/(?P<mediaId>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'umgpc_school_remove_photo',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/school/application/{id}/submit
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)/submit', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_school_submit_application',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/school/application/{id}/unsubmit
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)/unsubmit', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_school_unsubmit_application',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/school/application/{id}/retitle
    register_rest_route('umg/v1', '/school/application/(?P<id>\d+)/retitle', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_school_retitle_application',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/school/checkout
    register_rest_route('umg/v1', '/school/checkout', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_school_create_checkout',
        'permission_callback' => '__return_true',
    ));
});

/* =========================================================
   Helpers
   ========================================================= */

/**
 * Find all school-batch application post IDs owned by a user, oldest first.
 *
 * @param int          $user_id     WordPress user ID
 * @param string|array $post_status Defaults to 'publish' (the only status
 *                                  this plugin's own code ever creates a
 *                                  school post with). Pass an explicit
 *                                  array — e.g. array('publish', 'trash')
 *                                  — to also see posts moved to Trash via
 *                                  wp-admin; WordPress's 'any' status
 *                                  silently excludes 'trash' and
 *                                  'auto-draft', so it is NOT a safe way
 *                                  to mean "every status."
 * @return int[] Post IDs
 */
function umgpc_school_find_applications($user_id, $post_status = 'publish') {
    $q = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => $post_status,
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'orderby'        => 'date',
        'order'          => 'ASC',
        'meta_query'     => array(
            'relation' => 'AND',
            array(
                'key'   => 'umgpc_user_id',
                'value' => (string) $user_id,
            ),
            array(
                'key'   => 'umgpc_school_batch',
                'value' => '1',
            ),
        ),
        'no_found_rows' => true,
    ));

    return $q->posts;
}

/**
 * Run $callback only while holding a short-lived MySQL named lock.
 *
 * WordPress meta has no atomic read-modify-write primitive — a plain
 * get_*_meta() followed by update_*_meta() is a check-then-set race under
 * concurrent requests. GET_LOCK/RELEASE_LOCK gives a real mutex without
 * adding an external dependency. The lock is held only for the duration of
 * $callback, never across a slow external call (Stripe, etc.) — callers
 * must do slow work outside this wrapper.
 *
 * Fails CLOSED: if the lock can't be acquired within $timeout seconds,
 * $callback never runs and a WP_Error is returned instead — silently
 * falling back to running the critical section unprotected would defeat
 * the entire point of taking the lock.
 *
 * Calls to this function DO nest safely (umgpc_school_compute_title's
 * per-post lock wraps a call to umgpc_school_next_seq, which takes its own
 * separate per-account lock) — MySQL >= 5.7.5 and MariaDB >= 10.0 support
 * holding multiple distinct named locks per session simultaneously, which
 * is also WordPress core's own stated minimum DB requirement, so any host
 * capable of running WordPress at all supports this. Pre-5.7.5 MySQL only
 * allowed one named lock per session (acquiring a second silently released
 * the first), which would reopen the exact races these locks exist to
 * close — not a concern on any currently-supported WordPress host.
 *
 * @param string   $name     Unique lock name (caller scopes it, e.g. per-user).
 * @param int      $timeout  Seconds to wait for the lock.
 * @param callable $callback Runs only while the lock is held; no arguments.
 * @return mixed|WP_Error Callback's return value, or WP_Error('lock_busy', ...).
 */
function umgpc_school_with_named_lock($name, $timeout, $callback) {
    global $wpdb;

    $acquired = (string) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, %d)', $name, $timeout)) === '1';
    if (!$acquired) {
        return new WP_Error(
            'lock_busy',
            'Another request for this account is already in progress. Please try again in a moment.',
            array('status' => 429)
        );
    }

    try {
        return $callback();
    } finally {
        $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $name));
    }
}

/**
 * Claim a per-account application sequence number, atomically — used both
 * for a brand-new application and for backfilling a legacy one that
 * predates umgpc_school_seq. Runs inside umgpc_school_with_named_lock()
 * (see that function for why a plain get_user_meta()-then-update_user_meta()
 * isn't safe under concurrent requests).
 *
 * On an account's first-ever call, initializes the per-account counter by
 * scanning EVERY one of the account's umg_submission posts — any post
 * status, not just 'publish' — for the highest umgpc_school_seq already
 * assigned, so the first number this function ever claims can never
 * collide with one already in use (e.g. by a legacy record numbered
 * before this counter existed).
 *
 * Deliberately does NOT try to guarantee perfectly chronological numbering
 * across a mix of legacy applications (numbered lazily, whenever their
 * name/backfill happens to run) and brand-new ones (numbered eagerly at
 * creation) — numbers are handed out in whatever order this function is
 * actually called, not sorted by post date. An earlier version tried to
 * batch-backfill every un-numbered sibling at once specifically to force
 * chronological order, and introduced four distinct bugs doing it (see
 * this file's docs, "Round 5" — a counter that could still collide, a
 * backfill that numbered from the wrong base, un-numberable non-'publish'
 * posts, and a race that could make a fully-titled sibling look
 * un-retitleable). umgpc_school_seq is a purely cosmetic wp-admin label —
 * it is never used for payment matching or any other load-bearing logic
 * (that's always the real WP post ID) — so the properties that actually
 * matter are UNIQUENESS (no two applications ever show the same number)
 * and ATOMICITY (no race under concurrent requests), both of which this
 * simpler version guarantees. A legacy application backfilled well after a
 * newer one was already created may end up with a higher number than that
 * newer one — a cosmetic imperfection, not a correctness bug, and one that
 * stops recurring once every legacy application has been backfilled once.
 *
 * @param int $user_id
 * @return int|WP_Error The sequence number claimed, or WP_Error('lock_busy', ...)
 *                       if the account is under contention right now — callers
 *                       MUST check is_wp_error() and must NOT proceed as if a
 *                       number was claimed.
 */
function umgpc_school_next_seq($user_id) {
    return umgpc_school_with_named_lock('umgpc_school_seq_' . $user_id, 2, function () use ($user_id) {
        $next = (int) get_user_meta($user_id, 'umgpc_school_next_seq', true);

        if ($next < 1) {
            $next = 1;
            // Every registered post status, not a hardcoded subset — this
            // plugin's own code only ever creates school posts as
            // 'publish', but umg_submission has show_ui: true, so a
            // wp-admin action (Quick Edit, Trash, etc.) can move one to
            // 'trash', 'draft', 'pending', or anything else WordPress
            // registers. get_post_stati() covers all of them, so this
            // scan can't miss an already-assigned umgpc_school_seq no
            // matter what status a post ends up in. Reuses
            // umgpc_school_find_applications() rather than a second
            // hand-written query, so this scan can't silently drift out
            // of sync with what "this account's applications" means.
            $siblings = umgpc_school_find_applications($user_id, array_keys(get_post_stati()));
            foreach ($siblings as $sibling_id) {
                $existing_seq = (int) get_post_meta($sibling_id, 'umgpc_school_seq', true);
                if ($existing_seq >= $next) {
                    $next = $existing_seq + 1;
                }
            }
        }

        update_user_meta($user_id, 'umgpc_school_next_seq', (string) ($next + 1));
        return $next;
    });
}

/**
 * Resolve a school application post id owned by the given user.
 *
 * Returns 404 (never 403) whether the post is missing, not a school
 * application, or owned by someone else, so ownership never leaks via
 * response status.
 *
 * @param mixed $post_id_raw
 * @param int   $user_id
 * @return int|WP_Error
 */
function umgpc_school_get_owned_application($post_id_raw, $user_id) {
    $post_id = (int) $post_id_raw;
    if (!$post_id || get_post_type($post_id) !== 'umg_submission') {
        return new WP_Error('not_found', 'Application not found.', array('status' => 404));
    }

    $owner = get_post_meta($post_id, 'umgpc_user_id', true);
    $is_school_batch = get_post_meta($post_id, 'umgpc_school_batch', true);

    if ((string) $owner !== (string) $user_id || $is_school_batch !== '1') {
        return new WP_Error('not_found', 'Application not found.', array('status' => 404));
    }

    return $post_id;
}

/**
 * Build a summary array for the applications list endpoint.
 *
 * @param int $post_id
 * @return array
 */
function umgpc_school_build_summary($post_id) {
    return array(
        'id'             => $post_id,
        'division'       => get_post_meta($post_id, 'umgpc_division', true) ?: '',
        'first_name'     => get_post_meta($post_id, 'umgpc_first_name', true) ?: '',
        'last_name'      => get_post_meta($post_id, 'umgpc_last_name', true) ?: '',
        'status'         => get_post_meta($post_id, 'umgpc_status', true) ?: 'draft',
        'payment_status' => get_post_meta($post_id, 'umgpc_payment_status', true) ?: 'unpaid',
    );
}

/* =========================================================
   Endpoint Callbacks
   ========================================================= */

/**
 * GET /umg/v1/school/applications
 *
 * List summaries of every application owned by the authenticated user.
 */
function umgpc_school_list_applications(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_ids = umgpc_school_find_applications($user_id);
    $applications = array_map('umgpc_school_build_summary', $post_ids);

    return rest_ensure_response(array('applications' => $applications));
}

/**
 * POST /umg/v1/school/applications
 *
 * Create a new blank application owned by the caller.
 */
function umgpc_school_create_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $user = get_user_by('id', $user_id);
    $email = $user ? $user->user_email : $user_id;
    // Numbered per-account so multiple applications are distinguishable in
    // wp-admin; umgpc_school_update_application appends the student's name
    // once known, reusing this same number (stored in umgpc_school_seq)
    // rather than recomputing it, so the number stays stable across edits.
    $seq = umgpc_school_next_seq($user_id);
    if (is_wp_error($seq)) return $seq;
    $title = "School Application #{$seq} - {$email}";

    $post_id = wp_insert_post(array(
        'post_type'   => 'umg_submission',
        'post_status' => 'publish',
        'post_title'  => $title,
    ), true);

    if (is_wp_error($post_id)) {
        return new WP_Error('create_failed', 'Could not create application.', array('status' => 500));
    }

    update_post_meta($post_id, 'umgpc_user_id', (string) $user_id);
    update_post_meta($post_id, 'umgpc_status', 'draft');
    update_post_meta($post_id, 'umgpc_school_batch', '1');
    update_post_meta($post_id, 'umgpc_school_seq', (string) $seq);
    update_post_meta($post_id, 'umgpc_payment_status', 'unpaid');

    return rest_ensure_response(array('id' => (int) $post_id));
}

/**
 * GET /umg/v1/school/application/{id}
 *
 * Full detail for a single application owned by the caller.
 */
function umgpc_school_get_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    return rest_ensure_response(array(
        'id'                   => $post_id,
        'status'               => get_post_meta($post_id, 'umgpc_status', true) ?: 'draft',
        'division'             => get_post_meta($post_id, 'umgpc_division', true) ?: '',
        'first_name'           => get_post_meta($post_id, 'umgpc_first_name', true) ?: '',
        'last_name'            => get_post_meta($post_id, 'umgpc_last_name', true) ?: '',
        'dob'                  => get_post_meta($post_id, 'umgpc_dob', true) ?: '',
        'address'              => get_post_meta($post_id, 'umgpc_address', true) ?: '',
        'school'               => get_post_meta($post_id, 'umgpc_school', true) ?: '',
        'grade'                => get_post_meta($post_id, 'umgpc_grade', true) ?: '',
        'job'                  => get_post_meta($post_id, 'umgpc_job', true) ?: '',
        'biography'            => get_post_meta($post_id, 'umgpc_biography', true) ?: '',
        'photos'               => umgpc_build_photos_array($post_id),
        'consent_originality'  => (bool) get_post_meta($post_id, 'umgpc_consent_originality', true),
        'consent_subjects'     => (bool) get_post_meta($post_id, 'umgpc_consent_subjects', true),
        'consent_rights'       => (bool) get_post_meta($post_id, 'umgpc_consent_rights', true),
        'consent_rules'        => (bool) get_post_meta($post_id, 'umgpc_consent_rules', true),
        'consent_social_media' => (bool) get_post_meta($post_id, 'umgpc_consent_social_media', true),
        'social_links'         => get_post_meta($post_id, 'umgpc_social_links', true) ?: '',
        'submitted_at'         => get_post_meta($post_id, 'umgpc_submitted_at', true) ?: null,
        'payment_status'       => get_post_meta($post_id, 'umgpc_payment_status', true) ?: 'unpaid',
        'payment_date'         => get_post_meta($post_id, 'umgpc_payment_date', true) ?: null,
    ));
}

/**
 * PUT /umg/v1/school/application/{id}
 *
 * Upsert text/boolean fields. Mirrors umgpc_save_draft's field list
 * (draft.php) minus student-proof, which is intentionally not collected
 * for school applications.
 */
function umgpc_school_update_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted application.', array('status' => 400));
    }

    $body = $request->get_json_params();

    $text_fields = array(
        'division'     => 'umgpc_division',
        'first_name'   => 'umgpc_first_name',
        'last_name'    => 'umgpc_last_name',
        'dob'          => 'umgpc_dob',
        'address'      => 'umgpc_address',
        'school'       => 'umgpc_school',
        'grade'        => 'umgpc_grade',
        'job'          => 'umgpc_job',
        'biography'    => 'umgpc_biography',
        'social_links' => 'umgpc_social_links',
    );

    foreach ($text_fields as $param => $meta_key) {
        if (isset($body[$param])) {
            update_post_meta($post_id, $meta_key, sanitize_text_field($body[$param]));
        }
    }

    $bool_fields = array(
        'consent_originality'  => 'umgpc_consent_originality',
        'consent_subjects'     => 'umgpc_consent_subjects',
        'consent_rights'       => 'umgpc_consent_rights',
        'consent_rules'        => 'umgpc_consent_rules',
        'consent_social_media' => 'umgpc_consent_social_media',
    );

    foreach ($bool_fields as $param => $meta_key) {
        if (isset($body[$param])) {
            update_post_meta($post_id, $meta_key, $body[$param] ? '1' : '0');
        }
    }

    // Save photo metadata (title + description only; files come via the
    // photo-upload endpoint added in a later commit).
    if (isset($body['photos']) && is_array($body['photos'])) {
        foreach ($body['photos'] as $photo) {
            $media_id = isset($photo['media_id']) ? (int) $photo['media_id'] : 0;
            if (!$media_id) continue;

            for ($i = 1; $i <= 3; $i++) {
                $slot_id = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
                if ($slot_id === $media_id) {
                    if (isset($photo['title'])) {
                        update_post_meta($post_id, "umgpc_photo_{$i}_title", sanitize_text_field($photo['title']));
                    }
                    if (isset($photo['description'])) {
                        update_post_meta($post_id, "umgpc_photo_{$i}_description", sanitize_textarea_field($photo['description']));
                    }
                    break;
                }
            }
        }
    }

    // Retitle to "School Application #N {Name} - {email}" once a name is
    // known; also touches post_modified for orphan cleanup tracking
    // (matches draft.php).
    $title = umgpc_school_compute_title($post_id, $user_id);
    if (is_string($title)) {
        wp_update_post(array('ID' => $post_id, 'post_title' => $title));
    } else {
        // No name yet, or a WP_Error('lock_busy', ...) from rare contention
        // claiming/backfilling a sequence number — either way, just skip
        // the retitle this save; a later save (autosave is on a timer) or
        // the retitle endpoint will retry it. Not worth failing the whole
        // save over a cosmetic title update.
        wp_update_post(array('ID' => $post_id));
    }

    return rest_ensure_response(array('success' => true));
}

/**
 * Compute the "School Application #N {Name} - {email}" title for a post
 * from its currently-stored name meta, backfilling umgpc_school_seq via
 * umgpc_school_next_seq() if it predates that field. Deliberately does NOT
 * compute its own number (e.g. from sibling position) — umgpc_school_seq
 * must have exactly one assigning authority (the atomic counter) or two
 * legacy posts backfilled independently by each mechanism could end up
 * with the same number.
 *
 * @param int $post_id
 * @param int $user_id
 * @return string|null|WP_Error The title, null if no name is stored yet
 *                       (nothing to retitle to — permanent, not worth
 *                       retrying), or WP_Error('lock_busy', ...) if a
 *                       sequence number couldn't be claimed right now due
 *                       to contention (transient — distinct from null
 *                       specifically so umgpc_school_retitle_application
 *                       can tell a real "try again" apart from "nothing to
 *                       do here").
 */
function umgpc_school_compute_title($post_id, $user_id) {
    $full_name = trim(
        get_post_meta($post_id, 'umgpc_first_name', true) . ' '
        . get_post_meta($post_id, 'umgpc_last_name', true)
    );
    if ($full_name === '') return null;

    $seq = get_post_meta($post_id, 'umgpc_school_seq', true);
    if ($seq === '') {
        // The claim itself (umgpc_school_next_seq) is atomic per-account,
        // but checking-then-writing THIS post's own umgpc_school_seq is
        // not — two concurrent calls for the SAME post (e.g. two
        // near-simultaneous autosaves) could both see it empty and both
        // claim a distinct number, one silently orphaned when the other's
        // write lands last. Wrapped in its own per-post named lock, with a
        // re-check inside it (another request may have already assigned
        // this post a number while this one waited for the lock).
        $result = umgpc_school_with_named_lock('umgpc_school_seq_post_' . $post_id, 2, function () use ($post_id, $user_id) {
            $existing = get_post_meta($post_id, 'umgpc_school_seq', true);
            if ($existing !== '') {
                return (int) $existing;
            }
            $claimed = umgpc_school_next_seq($user_id);
            if (is_wp_error($claimed)) {
                return $claimed;
            }
            update_post_meta($post_id, 'umgpc_school_seq', (string) $claimed);
            return $claimed;
        });
        if (is_wp_error($result)) {
            return $result;
        }
        $seq = $result;
    }

    $user = get_user_by('id', $user_id);
    $email = $user ? $user->user_email : $user_id;

    return "School Application #{$seq} {$full_name} - {$email}";
}

/**
 * POST /umg/v1/school/application/{id}/retitle
 *
 * Recompute the wp-admin display title from currently-stored fields.
 * Deliberately bypasses the "already_submitted" edit lock — this only
 * touches cosmetic post_title metadata, never application content, so it's
 * safe to run on submitted applications (e.g. to retroactively fix titles
 * created before this endpoint existed).
 */
function umgpc_school_retitle_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $title = umgpc_school_compute_title($post_id, $user_id);
    if (is_wp_error($title)) {
        // Real lock contention, distinct from "nothing to retitle" —
        // surface it so the caller knows to retry, rather than silently
        // reporting retitled:false as if there were no name to work with.
        return $title;
    }
    if ($title === null) {
        return rest_ensure_response(array('success' => true, 'retitled' => false));
    }

    wp_update_post(array('ID' => $post_id, 'post_title' => $title));

    return rest_ensure_response(array('success' => true, 'retitled' => true, 'title' => $title));
}

/**
 * DELETE /umg/v1/school/application/{id}
 *
 * Hard-delete an application (and any attached media) if not submitted.
 */
function umgpc_school_delete_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot delete a submitted application.', array('status' => 400));
    }

    // Delete attached photos from the Media Library before the post itself.
    for ($i = 1; $i <= 3; $i++) {
        $media_id = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
        if ($media_id) {
            wp_delete_attachment($media_id, true);
        }
    }

    wp_delete_post($post_id, true);

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/school/application/{id}/photo
 *
 * Upload a photo to a specific application. Validation mirrors
 * umgpc_upload_photo in draft.php (JPEG only, 20MB max, 3-photo slots).
 * Unlike draft.php this never creates an application — it must already
 * exist (via POST /school/applications).
 */
function umgpc_school_upload_photo(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted application.', array('status' => 400));
    }

    $files = $request->get_file_params();
    if (empty($files['photo'])) {
        return new WP_Error('no_file', 'No photo file provided.', array('status' => 400));
    }

    $file = $files['photo'];

    $allowed_types = array('image/jpeg', 'image/jpg');
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo === false) {
        return new WP_Error('mime_check_failed', 'Could not verify file type. Please try again.', array('status' => 500));
    }
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed_types)) {
        return new WP_Error('invalid_type', 'Only JPEG images are accepted.', array('status' => 400));
    }

    if ($file['size'] > 20 * 1024 * 1024) {
        return new WP_Error('file_too_large', 'File size must not exceed 20MB.', array('status' => 400));
    }

    $slot = 0;
    for ($i = 1; $i <= 3; $i++) {
        $existing = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
        if (!$existing) {
            $slot = $i;
            break;
        }
    }

    if ($slot === 0) {
        return new WP_Error('max_photos', 'Maximum of 3 photos allowed.', array('status' => 400));
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $upload = wp_handle_upload($file, array('test_form' => false));

    if (isset($upload['error'])) {
        return new WP_Error('upload_failed', $upload['error'], array('status' => 500));
    }

    $attachment = array(
        'post_mime_type' => $upload['type'],
        'post_title'     => sanitize_file_name(pathinfo($upload['file'], PATHINFO_FILENAME)),
        'post_content'   => '',
        'post_status'    => 'inherit',
    );

    $media_id = wp_insert_attachment($attachment, $upload['file'], $post_id);

    if (is_wp_error($media_id)) {
        return new WP_Error('attachment_failed', 'Could not create attachment.', array('status' => 500));
    }

    $metadata = wp_generate_attachment_metadata($media_id, $upload['file']);
    wp_update_attachment_metadata($media_id, $metadata);

    update_post_meta($post_id, "umgpc_photo_{$slot}_id", (string) $media_id);
    update_post_meta($post_id, "umgpc_photo_{$slot}_title", '');
    update_post_meta($post_id, "umgpc_photo_{$slot}_description", '');

    return rest_ensure_response(array(
        'id'  => $media_id,
        'url' => wp_get_attachment_url($media_id),
    ));
}

/**
 * DELETE /umg/v1/school/application/{id}/photo/{mediaId}
 *
 * Remove a photo from a specific application and delete it from the
 * Media Library.
 */
function umgpc_school_remove_photo(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted application.', array('status' => 400));
    }

    $media_id = (int) $request->get_param('mediaId');
    if (!$media_id) {
        return new WP_Error('invalid_id', 'Invalid photo ID.', array('status' => 400));
    }

    $found = false;
    for ($i = 1; $i <= 3; $i++) {
        $slot_id = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
        if ($slot_id === $media_id) {
            delete_post_meta($post_id, "umgpc_photo_{$i}_id");
            delete_post_meta($post_id, "umgpc_photo_{$i}_title");
            delete_post_meta($post_id, "umgpc_photo_{$i}_description");
            $found = true;
            break;
        }
    }

    if (!$found) {
        return new WP_Error('photo_not_found', 'Photo not found in this application.', array('status' => 404));
    }

    wp_delete_attachment($media_id, true);

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/school/application/{id}/submit
 *
 * Finalize a single application. Mirrors umgpc_submit_entry in
 * submission.php: no field validation server-side (matches existing
 * behavior), just a status flip + timestamp, scoped by ownership.
 */
function umgpc_school_submit_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $result = umgpc_entry_submit($post_id);
    if (is_wp_error($result)) return $result;

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/school/application/{id}/unsubmit
 *
 * Revert a submitted application to draft so the school can edit it before
 * paying. Guards (not-paid, must-be-submitted) live in entry-state.php.
 * Note: an application inside a checkout session that settles after the
 * revert still gets credited by the webhook — resubmitting reconciles it.
 */
function umgpc_school_unsubmit_application(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_school_get_owned_application($request->get_param('id'), $user_id);
    if (is_wp_error($post_id)) return $post_id;

    $result = umgpc_entry_unsubmit($post_id);
    if (is_wp_error($result)) return $result;

    return rest_ensure_response(array('success' => true));
}

/**
 * Find all school-batch application post IDs owned by a user that are
 * submitted and not yet paid — the set a Checkout Session should cover.
 *
 * @param int $user_id
 * @return int[] Post IDs
 */
function umgpc_school_find_unpaid_submitted_applications($user_id) {
    $q = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'orderby'        => 'date',
        'order'          => 'ASC',
        'meta_query'     => array(
            'relation' => 'AND',
            array(
                'key'   => 'umgpc_user_id',
                'value' => (string) $user_id,
            ),
            array(
                'key'   => 'umgpc_school_batch',
                'value' => '1',
            ),
            array(
                'key'   => 'umgpc_status',
                'value' => 'submitted',
            ),
            array(
                'key'     => 'umgpc_payment_status',
                'value'   => 'paid',
                'compare' => '!=',
            ),
        ),
        'no_found_rows' => true,
    ));

    return $q->posts;
}

/**
 * POST /umg/v1/school/checkout
 *
 * Create ONE Stripe Checkout Session covering every submitted-but-unpaid
 * application the caller owns. The quantity is computed here, server-side,
 * from the caller's own data — never trusted from the client — so Stripe's
 * own price x quantity total is guaranteed correct with no reconciliation
 * risk. The batch's application IDs are embedded in the session's own
 * metadata so the webhook (payment.php) can credit all of them from one
 * settlement event. Uses UMGPC_STRIPE_SECRET_KEY (restricted, Checkout
 * Sessions: write only) — distinct from UMGPC_STRIPE_WEBHOOK_SECRET, which
 * only verifies inbound events and can't make outbound calls.
 */
function umgpc_school_create_checkout(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    if (!UMGPC_STRIPE_SECRET_KEY) {
        return new WP_Error('stripe_not_configured', 'Payment is not configured.', array('status' => 500));
    }

    $post_ids = umgpc_school_find_unpaid_submitted_applications($user_id);
    if (empty($post_ids)) {
        return new WP_Error('nothing_to_pay', 'No submitted, unpaid applications found.', array('status' => 400));
    }

    // Guard against creating a second Checkout Session for the same batch
    // (e.g. the caller hits back or opens a second tab before the webhook
    // has marked anything paid) — without this, both sessions could be
    // completed and the school would be charged twice with no
    // reconciliation. The check-then-set runs inside
    // umgpc_school_with_named_lock() (see that function) so it's a real
    // atomic check-and-set, not a get_user_meta()-then-update_user_meta()
    // race; released immediately below on a failed Stripe call, and by the
    // webhook once the batch is paid (or once UMGPC_SCHOOL_CHECKOUT_LOCK_TTL
    // elapses if the checkout is abandoned — chosen to always outlast the
    // Stripe session's own expiry, see that constant's definition).
    $lock_result = umgpc_school_with_named_lock('umgpc_school_checkout_' . $user_id, 2, function () use ($user_id) {
        $lock_at = (int) get_user_meta($user_id, 'umgpc_school_checkout_lock_at', true);
        if ($lock_at && (time() - $lock_at) < UMGPC_SCHOOL_CHECKOUT_LOCK_TTL) {
            return false; // already locked
        }
        update_user_meta($user_id, 'umgpc_school_checkout_lock_at', (string) time());
        delete_user_meta($user_id, 'umgpc_school_checkout_lock_session');
        return true; // lock claimed
    });

    if (is_wp_error($lock_result)) {
        return $lock_result;
    }
    if ($lock_result === false) {
        return new WP_Error(
            'checkout_in_progress',
            'A checkout for this batch is already in progress. Please finish or wait a moment before trying again.',
            array('status' => 429)
        );
    }

    $quantity = count($post_ids);
    $application_ids = implode(',', $post_ids);

    // Only redirect back to a known-good origin; never trust an arbitrary
    // client-supplied Origin header for the Stripe redirect target.
    $origin = $request->get_header('origin');
    $allowed_origins = umgpc_allowed_origins();
    $base_url = in_array($origin, $allowed_origins, true) ? $origin : 'https://www.unitedmediadc.com';

    // Product name/description/image and the billing-address/phone/tax
    // settings below are matched to the existing individual entry-fee
    // Payment Link (read directly from Stripe, 2026-07-03) so the two
    // checkout experiences look and behave consistently. automatic_tax in
    // particular is a functional match, not just cosmetic — the individual
    // link already calculates tax on every entry fee, so the school batch
    // checkout does too, for consistency.
    // Booleans below are the literal strings 'true'/'false', not PHP
    // booleans: wp_remote_post()'s array body gets serialized via
    // http_build_query(), which turns PHP true into "1" — Stripe's form
    // parser rejects "1" as an invalid boolean and wants the literal word.
    // Explicit expiry (rather than trusting Stripe's 24h default) so the
    // checkout lock above (UMGPC_SCHOOL_CHECKOUT_LOCK_TTL) is guaranteed to
    // outlast the session itself. Uses the SAME buffer constant the lock
    // TTL's own margin is computed from, so the two can't silently drift
    // out of sync with each other.
    $body = array(
        'mode'                       => 'payment',
        'expires_at'                 => time() + UMGPC_SCHOOL_CHECKOUT_SESSION_TTL + UMGPC_SCHOOL_CHECKOUT_EXPIRY_BUFFER,
        'billing_address_collection' => 'required',
        'phone_number_collection'    => array(
            'enabled' => 'true',
        ),
        'automatic_tax'              => array(
            'enabled' => 'true',
        ),
        'line_items'                 => array(
            array(
                'price_data' => array(
                    'currency'     => 'usd',
                    'unit_amount'  => 5000,
                    'product_data' => array(
                        'name'        => 'My Hometown, My Lens: International Youth Photography Competition',
                        'description' => sprintf(
                            'School batch entry fee — %d student%s at $50 each. Participants may submit up to three photographs per entry. Submissions are non-refundable unless an event outlined in the Competition Rules, Terms, and Conditions occurs. Winners will be announced and notified in October 2026.',
                            $quantity,
                            $quantity === 1 ? '' : 's'
                        ),
                        'images'      => array(
                            'https://files.stripe.com/links/MDB8YWNjdF8xVDJkbklQVVRpRk1sR2VofGZsX3Rlc3Rfa1h0aG9GMmxGZkFsendlcmtpcG5wcTgx005AqrrS03',
                        ),
                    ),
                ),
                'quantity' => $quantity,
            ),
        ),
        'metadata'                   => array(
            'purpose'          => 'school_bulk_entry',
            'application_ids'  => $application_ids,
        ),
        'success_url'                => $base_url . '/school-registration/?checkout=success',
        'cancel_url'                 => $base_url . '/school-registration/?checkout=cancelled',
    );

    $response = wp_remote_post('https://api.stripe.com/v1/checkout/sessions', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . UMGPC_STRIPE_SECRET_KEY,
            'Content-Type'  => 'application/x-www-form-urlencoded',
        ),
        'body'    => $body,
        'timeout' => 15,
    ));

    if (is_wp_error($response)) {
        error_log('[umgpc school checkout] Stripe request failed: ' . $response->get_error_message());
        // Release the lock — a failed attempt shouldn't block a legitimate retry.
        delete_user_meta($user_id, 'umgpc_school_checkout_lock_at');
        delete_user_meta($user_id, 'umgpc_school_checkout_lock_session');
        return new WP_Error('stripe_request_failed', 'Could not reach Stripe. Please try again.', array('status' => 502));
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $raw_body = wp_remote_retrieve_body($response);
    $data = json_decode($raw_body, true);

    if ($status_code >= 300 || empty($data['url'])) {
        // If $data is empty/null, this wasn't valid Stripe JSON at all —
        // e.g. an HTML page from a host-level firewall/proxy rather than a
        // real Stripe response. Surface the raw body in that case so it's
        // not hidden behind a generic "Unknown Stripe error".
        $error_message = isset($data['error']['message'])
            ? $data['error']['message']
            : ('Non-JSON or empty response: ' . substr($raw_body, 0, 300));
        error_log(sprintf(
            '[umgpc school checkout] Stripe API error (status %d): %s',
            $status_code,
            $error_message
        ));
        // Release the lock — a failed attempt shouldn't block a legitimate retry.
        delete_user_meta($user_id, 'umgpc_school_checkout_lock_at');
        delete_user_meta($user_id, 'umgpc_school_checkout_lock_session');
        return new WP_Error('stripe_error', 'Could not create checkout session.', array('status' => 502));
    }

    // Stamp which session this lock belongs to, so payment.php only
    // releases it for a webhook event matching *this* checkout — a
    // redelivered/retried Stripe webhook for an already-settled batch must
    // never clear the lock for a different, still-in-flight checkout.
    update_user_meta($user_id, 'umgpc_school_checkout_lock_session', sanitize_text_field($data['id'] ?? ''));

    return rest_ensure_response(array(
        'url'             => $data['url'],
        'application_ids' => $post_ids,
        'quantity'        => $quantity,
        'total'           => $quantity * 50,
    ));
}
