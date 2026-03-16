<?php
/**
 * UMG Photo Contest - Draft Endpoints
 *
 * 1. GET    /umg/v1/draft                — load draft or submitted entry
 * 2. PUT    /umg/v1/draft                — save/update draft text fields (upsert)
 * 3. POST   /umg/v1/draft/photo          — upload a photo to draft
 * 4. DELETE /umg/v1/draft/photo/(?P<id>\d+) — remove photo from draft
 * 5. POST   /umg/v1/draft/student-proof  — upload student proof document
 * 6. DELETE /umg/v1/draft/student-proof  — remove student proof document
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    // GET /umg/v1/draft
    register_rest_route('umg/v1', '/draft', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_get_draft',
        'permission_callback' => '__return_true',
    ));

    // PUT /umg/v1/draft
    register_rest_route('umg/v1', '/draft', array(
        'methods'             => 'PUT',
        'callback'            => 'umgpc_save_draft',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/draft/photo
    register_rest_route('umg/v1', '/draft/photo', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_upload_photo',
        'permission_callback' => '__return_true',
    ));

    // DELETE /umg/v1/draft/photo/(?P<id>\d+)
    register_rest_route('umg/v1', '/draft/photo/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'umgpc_remove_photo',
        'permission_callback' => '__return_true',
    ));

    // POST /umg/v1/draft/student-proof
    register_rest_route('umg/v1', '/draft/student-proof', array(
        'methods'             => 'POST',
        'callback'            => 'umgpc_upload_student_proof',
        'permission_callback' => '__return_true',
    ));

    // DELETE /umg/v1/draft/student-proof
    register_rest_route('umg/v1', '/draft/student-proof', array(
        'methods'             => 'DELETE',
        'callback'            => 'umgpc_remove_student_proof',
        'permission_callback' => '__return_true',
    ));
});

/* =========================================================
   Helpers
   ========================================================= */

/**
 * Find the umg_submission CPT post for a user.
 *
 * @param int $user_id WordPress user ID
 * @return int Post ID or 0 if not found
 */
function umgpc_find_draft_id($user_id) {
    $q = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'meta_query'     => array(
            array(
                'key'   => 'umgpc_user_id',
                'value' => (string) $user_id,
            ),
        ),
        'no_found_rows' => true,
    ));

    return !empty($q->posts[0]) ? (int) $q->posts[0] : 0;
}

/**
 * Create a new draft post for a user.
 *
 * @param int $user_id WordPress user ID
 * @return int|WP_Error Post ID on success
 */
function umgpc_create_draft($user_id) {
    $user = get_user_by('id', $user_id);
    $post_id = wp_insert_post(array(
        'post_type'   => 'umg_submission',
        'post_status' => 'publish',
        'post_title'  => 'Submission - ' . ($user ? $user->user_email : $user_id),
    ), true);

    if (is_wp_error($post_id)) {
        return $post_id;
    }

    update_post_meta($post_id, 'umgpc_user_id', (string) $user_id);
    update_post_meta($post_id, 'umgpc_status', 'draft');

    return (int) $post_id;
}

/**
 * Build the photos array from post meta.
 *
 * @param int $post_id Draft post ID
 * @return array Array of photo objects matching DraftPhoto shape
 */
function umgpc_build_photos_array($post_id) {
    $photos = array();

    for ($i = 1; $i <= 3; $i++) {
        $media_id = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
        if (!$media_id) continue;

        $url = wp_get_attachment_url($media_id);
        if (!$url) continue;

        $photos[] = array(
            'media_id'    => $media_id,
            'url'         => $url,
            'title'       => get_post_meta($post_id, "umgpc_photo_{$i}_title", true) ?: '',
            'description' => get_post_meta($post_id, "umgpc_photo_{$i}_description", true) ?: '',
        );
    }

    return $photos;
}

/**
 * Build the student proof object from post meta.
 *
 * @param int $post_id Draft post ID
 * @return array|null Student proof object or null if not uploaded
 */
function umgpc_build_student_proof($post_id) {
    $media_id = (int) get_post_meta($post_id, 'umgpc_student_proof_id', true);
    if (!$media_id) return null;

    $url = wp_get_attachment_url($media_id);
    if (!$url) return null;

    $filepath = get_attached_file($media_id);
    $filename = $filepath ? basename($filepath) : 'document';

    return array(
        'media_id' => $media_id,
        'url'      => $url,
        'filename' => $filename,
    );
}

/* =========================================================
   Endpoint Callbacks
   ========================================================= */

/**
 * GET /umg/v1/draft
 *
 * Load draft or submitted entry for the authenticated user.
 * Returns 404 if no draft exists.
 */
function umgpc_get_draft(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);
    if (!$post_id) {
        return new WP_Error('no_draft', 'No draft found.', array('status' => 404));
    }

    $status = get_post_meta($post_id, 'umgpc_status', true) ?: 'draft';

    return rest_ensure_response(array(
        'status'              => $status,
        'division'            => get_post_meta($post_id, 'umgpc_division', true) ?: '',
        'first_name'          => get_post_meta($post_id, 'umgpc_first_name', true) ?: '',
        'last_name'           => get_post_meta($post_id, 'umgpc_last_name', true) ?: '',
        'dob'                 => get_post_meta($post_id, 'umgpc_dob', true) ?: '',
        'address'             => get_post_meta($post_id, 'umgpc_address', true) ?: '',
        'school'              => get_post_meta($post_id, 'umgpc_school', true) ?: '',
        'grade'               => get_post_meta($post_id, 'umgpc_grade', true) ?: '',
        'job'                 => get_post_meta($post_id, 'umgpc_job', true) ?: '',
        'biography'           => get_post_meta($post_id, 'umgpc_biography', true) ?: '',
        'photos'              => umgpc_build_photos_array($post_id),
        'student_proof'       => umgpc_build_student_proof($post_id),
        'consent_originality' => (bool) get_post_meta($post_id, 'umgpc_consent_originality', true),
        'consent_subjects'    => (bool) get_post_meta($post_id, 'umgpc_consent_subjects', true),
        'consent_rights'      => (bool) get_post_meta($post_id, 'umgpc_consent_rights', true),
        'consent_rules'       => (bool) get_post_meta($post_id, 'umgpc_consent_rules', true),
        'submitted_at'        => get_post_meta($post_id, 'umgpc_submitted_at', true) ?: null,
    ));
}

/**
 * PUT /umg/v1/draft
 *
 * Upsert draft text fields. Creates draft if none exists.
 */
function umgpc_save_draft(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);

    if (!$post_id) {
        $post_id = umgpc_create_draft($user_id);
        if (is_wp_error($post_id)) {
            return new WP_Error('draft_create_failed', 'Could not create draft.', array('status' => 500));
        }
    }

    // Check if already submitted
    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted entry.', array('status' => 400));
    }

    $body = $request->get_json_params();

    // Save text fields
    $text_fields = array(
        'division'    => 'umgpc_division',
        'first_name'  => 'umgpc_first_name',
        'last_name'   => 'umgpc_last_name',
        'dob'         => 'umgpc_dob',
        'address'     => 'umgpc_address',
        'school'       => 'umgpc_school',
        'grade'        => 'umgpc_grade',
        'job'         => 'umgpc_job',
        'biography'   => 'umgpc_biography',
    );

    foreach ($text_fields as $param => $meta_key) {
        if (isset($body[$param])) {
            update_post_meta($post_id, $meta_key, sanitize_text_field($body[$param]));
        }
    }

    // Save boolean fields
    $bool_fields = array(
        'consent_originality' => 'umgpc_consent_originality',
        'consent_subjects'    => 'umgpc_consent_subjects',
        'consent_rights'      => 'umgpc_consent_rights',
        'consent_rules'       => 'umgpc_consent_rules',
    );

    foreach ($bool_fields as $param => $meta_key) {
        if (isset($body[$param])) {
            update_post_meta($post_id, $meta_key, $body[$param] ? '1' : '0');
        }
    }

    // Save photo metadata (title + description only, not the files)
    if (isset($body['photos']) && is_array($body['photos'])) {
        foreach ($body['photos'] as $photo) {
            $media_id = isset($photo['media_id']) ? (int) $photo['media_id'] : 0;
            if (!$media_id) continue;

            // Find which slot this photo is in
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

    // Touch post_modified for orphan cleanup tracking
    wp_update_post(array('ID' => $post_id));

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/draft/photo
 *
 * Upload a photo to the user's draft. Creates draft if needed.
 * Accepts FormData with 'photo' field.
 */
function umgpc_upload_photo(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);

    if (!$post_id) {
        $post_id = umgpc_create_draft($user_id);
        if (is_wp_error($post_id)) {
            return new WP_Error('draft_create_failed', 'Could not create draft.', array('status' => 500));
        }
    }

    // Check if already submitted
    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted entry.', array('status' => 400));
    }

    // Check for uploaded file
    $files = $request->get_file_params();
    if (empty($files['photo'])) {
        return new WP_Error('no_file', 'No photo file provided.', array('status' => 400));
    }

    $file = $files['photo'];

    // Validate file type (JPEG only)
    $allowed_types = array('image/jpeg', 'image/jpg');
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed_types)) {
        return new WP_Error('invalid_type', 'Only JPEG images are accepted.', array('status' => 400));
    }

    // Validate file size (max 20MB)
    if ($file['size'] > 20 * 1024 * 1024) {
        return new WP_Error('file_too_large', 'File size must not exceed 20MB.', array('status' => 400));
    }

    // Find next available photo slot
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

    // Upload to Media Library
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $upload = wp_handle_upload($file, array('test_form' => false));

    if (isset($upload['error'])) {
        return new WP_Error('upload_failed', $upload['error'], array('status' => 500));
    }

    // Create attachment
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

    // Generate attachment metadata (thumbnails etc.)
    $metadata = wp_generate_attachment_metadata($media_id, $upload['file']);
    wp_update_attachment_metadata($media_id, $metadata);

    // Store in the photo slot
    update_post_meta($post_id, "umgpc_photo_{$slot}_id", (string) $media_id);
    update_post_meta($post_id, "umgpc_photo_{$slot}_title", '');
    update_post_meta($post_id, "umgpc_photo_{$slot}_description", '');

    return rest_ensure_response(array(
        'id'  => $media_id,
        'url' => wp_get_attachment_url($media_id),
    ));
}

/**
 * DELETE /umg/v1/draft/photo/{id}
 *
 * Remove a photo from the user's draft and delete from Media Library.
 */
function umgpc_remove_photo(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $media_id = (int) $request->get_param('id');
    if (!$media_id) {
        return new WP_Error('invalid_id', 'Invalid photo ID.', array('status' => 400));
    }

    $post_id = umgpc_find_draft_id($user_id);
    if (!$post_id) {
        return new WP_Error('no_draft', 'No draft found.', array('status' => 404));
    }

    // Check if already submitted
    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted entry.', array('status' => 400));
    }

    // Find and clear the photo slot
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
        return new WP_Error('photo_not_found', 'Photo not found in your draft.', array('status' => 404));
    }

    // Delete from Media Library
    wp_delete_attachment($media_id, true);

    return rest_ensure_response(array('success' => true));
}

/**
 * POST /umg/v1/draft/student-proof
 *
 * Upload a student proof document (transcript or student ID).
 * Accepts FormData with 'student_proof' field.
 * Only one proof is allowed; uploading again replaces the existing one.
 */
function umgpc_upload_student_proof(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);

    if (!$post_id) {
        $post_id = umgpc_create_draft($user_id);
        if (is_wp_error($post_id)) {
            return new WP_Error('draft_create_failed', 'Could not create draft.', array('status' => 500));
        }
    }

    // Check if already submitted
    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted entry.', array('status' => 400));
    }

    // Check for uploaded file
    $files = $request->get_file_params();
    if (empty($files['student_proof'])) {
        return new WP_Error('no_file', 'No student proof file provided.', array('status' => 400));
    }

    $file = $files['student_proof'];

    // Validate file type (JPEG, PNG, or PDF)
    $allowed_types = array('image/jpeg', 'image/jpg', 'image/png', 'application/pdf');
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed_types)) {
        return new WP_Error('invalid_type', 'Only JPEG, PNG, or PDF files are accepted.', array('status' => 400));
    }

    // Validate file size (max 10MB)
    if ($file['size'] > 10 * 1024 * 1024) {
        return new WP_Error('file_too_large', 'File size must not exceed 10MB.', array('status' => 400));
    }

    // If a proof already exists, delete the old one first
    $existing_id = (int) get_post_meta($post_id, 'umgpc_student_proof_id', true);
    if ($existing_id) {
        wp_delete_attachment($existing_id, true);
        delete_post_meta($post_id, 'umgpc_student_proof_id');
    }

    // Upload to Media Library
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $upload = wp_handle_upload($file, array('test_form' => false));

    if (isset($upload['error'])) {
        return new WP_Error('upload_failed', $upload['error'], array('status' => 500));
    }

    // Create attachment
    $original_filename = sanitize_file_name($file['name']);
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

    // Generate attachment metadata (thumbnails for images, PDF preview if available)
    $metadata = wp_generate_attachment_metadata($media_id, $upload['file']);
    wp_update_attachment_metadata($media_id, $metadata);

    // Store in post meta
    update_post_meta($post_id, 'umgpc_student_proof_id', (string) $media_id);

    return rest_ensure_response(array(
        'id'       => $media_id,
        'url'      => wp_get_attachment_url($media_id),
        'filename' => $original_filename,
    ));
}

/**
 * DELETE /umg/v1/draft/student-proof
 *
 * Remove the student proof document from the user's draft.
 */
function umgpc_remove_student_proof(WP_REST_Request $request) {
    $user_id = umgpc_get_user_from_request($request);
    if (is_wp_error($user_id)) return $user_id;

    $post_id = umgpc_find_draft_id($user_id);
    if (!$post_id) {
        return new WP_Error('no_draft', 'No draft found.', array('status' => 404));
    }

    // Check if already submitted
    $current_status = get_post_meta($post_id, 'umgpc_status', true);
    if ($current_status === 'submitted') {
        return new WP_Error('already_submitted', 'Cannot modify a submitted entry.', array('status' => 400));
    }

    $media_id = (int) get_post_meta($post_id, 'umgpc_student_proof_id', true);
    if (!$media_id) {
        return new WP_Error('no_proof', 'No student proof found in your draft.', array('status' => 404));
    }

    // Delete from Media Library
    wp_delete_attachment($media_id, true);
    delete_post_meta($post_id, 'umgpc_student_proof_id');

    return rest_ensure_response(array('success' => true));
}
