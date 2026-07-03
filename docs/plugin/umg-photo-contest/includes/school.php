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
 * 1. GET    /umg/v1/school/applications           — list caller's applications
 * 2. POST   /umg/v1/school/applications            — create a new blank application
 * 3. GET    /umg/v1/school/application/(?P<id>\d+)  — full detail
 * 4. PUT    /umg/v1/school/application/(?P<id>\d+)  — upsert fields
 * 5. DELETE /umg/v1/school/application/(?P<id>\d+)  — delete (not if submitted)
 */

if (!defined('ABSPATH')) exit;

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
});

/* =========================================================
   Helpers
   ========================================================= */

/**
 * Find all school-batch application post IDs owned by a user, oldest first.
 *
 * @param int $user_id WordPress user ID
 * @return int[] Post IDs
 */
function umgpc_school_find_applications($user_id) {
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
        ),
        'no_found_rows' => true,
    ));

    return $q->posts;
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
    $post_id = wp_insert_post(array(
        'post_type'   => 'umg_submission',
        'post_status' => 'publish',
        'post_title'  => 'School Application - ' . ($user ? $user->user_email : $user_id),
    ), true);

    if (is_wp_error($post_id)) {
        return new WP_Error('create_failed', 'Could not create application.', array('status' => 500));
    }

    update_post_meta($post_id, 'umgpc_user_id', (string) $user_id);
    update_post_meta($post_id, 'umgpc_status', 'draft');
    update_post_meta($post_id, 'umgpc_school_batch', '1');
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

    // Touch post_modified for orphan cleanup tracking (matches draft.php).
    wp_update_post(array('ID' => $post_id));

    return rest_ensure_response(array('success' => true));
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

    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Application has already been submitted.', array('status' => 400));
    }

    update_post_meta($post_id, 'umgpc_status', 'submitted');
    update_post_meta($post_id, 'umgpc_submitted_at', current_time('mysql'));

    return rest_ensure_response(array('success' => true));
}
