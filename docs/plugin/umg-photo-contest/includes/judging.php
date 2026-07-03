<?php
/**
 * UMG Photo Contest - Judging Endpoints
 *
 * Capability-gated REST surface for the judge/admin dashboard:
 *   GET /umg/v1/admin/submissions        — list submitted entries (blind)
 *   GET /umg/v1/admin/submissions/{id}   — one entry + the caller's own score
 *   PUT /umg/v1/admin/submissions/{id}/score — upsert the caller's score
 *   GET /umg/v1/admin/results            — cross-judge aggregation (admin only)
 *
 * Score model: per-judge post meta `umgpc_score_{judgeId}` holding JSON
 * { judge_id, scores: {criterionKey: int}, total, notes, criteria_version,
 *   status: draft|final, updated_at }.
 * The plugin is criteria-agnostic: the frontend defines criteria (from the
 * competition config) and sends stable slug keys; the plugin validates only
 * shape and score range, so rubric edits never require a plugin change.
 */

if (!defined('ABSPATH')) exit;

const UMGPC_SCORE_MIN = 1;
const UMGPC_SCORE_MAX = 10;

add_action('rest_api_init', function () {

    register_rest_route('umg/v1', '/admin/submissions', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_admin_list_submissions',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('umg/v1', '/admin/submissions/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_admin_get_submission',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('umg/v1', '/admin/submissions/(?P<id>\d+)/score', array(
        'methods'             => 'PUT',
        'callback'            => 'umgpc_admin_save_score',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('umg/v1', '/admin/results', array(
        'methods'             => 'GET',
        'callback'            => 'umgpc_admin_results',
        'permission_callback' => '__return_true',
    ));
});

/* =========================================================
   Internal helpers
   ========================================================= */

/**
 * Load a submission post and verify it is a submitted contest entry.
 * @return WP_Post|WP_Error
 */
function umgpc_get_submitted_entry($post_id) {
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'umg_submission') {
        return new WP_Error('not_found', 'Entry not found.', array('status' => 404));
    }
    if (get_post_meta($post->ID, 'umgpc_status', true) !== 'submitted') {
        return new WP_Error('not_submitted', 'Entry is not submitted.', array('status' => 404));
    }
    return $post;
}

/**
 * Read + decode one judge's score meta for an entry. Null when unscored.
 */
function umgpc_get_judge_score($post_id, $judge_id) {
    $raw = get_post_meta($post_id, 'umgpc_score_' . (int) $judge_id, true);
    if (!$raw) return null;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

/**
 * All judges' decoded scores for an entry, keyed by judge id.
 */
function umgpc_get_all_scores($post_id) {
    $all_meta = get_post_meta($post_id);
    $scores = array();
    foreach ($all_meta as $key => $values) {
        if (strpos($key, 'umgpc_score_') !== 0) continue;
        $judge_id = (int) substr($key, strlen('umgpc_score_'));
        if (!$judge_id) continue;
        $decoded = json_decode($values[0], true);
        if (is_array($decoded)) {
            $scores[$judge_id] = $decoded;
        }
    }
    return $scores;
}

/**
 * Photo array for judge views (url + title/description, no uploader info).
 */
function umgpc_judging_photos($post_id, $size = 'large') {
    $photos = array();
    for ($i = 1; $i <= 3; $i++) {
        $media_id = (int) get_post_meta($post_id, "umgpc_photo_{$i}_id", true);
        if (!$media_id) continue;
        $url = wp_get_attachment_image_url($media_id, $size) ?: wp_get_attachment_url($media_id);
        if (!$url) continue;
        $photos[] = array(
            'url'         => $url,
            'title'       => get_post_meta($post_id, "umgpc_photo_{$i}_title", true) ?: '',
            'description' => get_post_meta($post_id, "umgpc_photo_{$i}_description", true) ?: '',
        );
    }
    return $photos;
}

/**
 * Identified fields, included only for admins or when blind judging is off.
 */
function umgpc_entry_identity($post_id) {
    return array(
        'first_name' => get_post_meta($post_id, 'umgpc_first_name', true) ?: '',
        'last_name'  => get_post_meta($post_id, 'umgpc_last_name', true) ?: '',
        'school'     => get_post_meta($post_id, 'umgpc_school', true) ?: '',
        'grade'      => get_post_meta($post_id, 'umgpc_grade', true) ?: '',
    );
}

/* =========================================================
   GET /umg/v1/admin/submissions
   ========================================================= */

function umgpc_admin_list_submissions(WP_REST_Request $request) {
    $user_id = umgpc_require_cap($request, 'umgpc_judge_submissions');
    if (is_wp_error($user_id)) return $user_id;

    $division = sanitize_text_field($request->get_param('division') ?: '');
    $page     = max(1, (int) ($request->get_param('page') ?: 1));
    $per_page = min(100, max(1, (int) ($request->get_param('per_page') ?: 50)));

    $meta_query = array(
        array('key' => 'umgpc_status', 'value' => 'submitted'),
    );
    if ($division !== '') {
        $meta_query[] = array('key' => 'umgpc_division', 'value' => $division);
    }

    $query = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => 'any',
        'posts_per_page' => $per_page,
        'paged'          => $page,
        'meta_query'     => $meta_query,
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'no_found_rows'  => false,
    ));

    $include_identity = !umgpc_is_blind_judging() || user_can($user_id, 'umgpc_admin_results');

    $entries = array();
    foreach ($query->posts as $post) {
        $my_score = umgpc_get_judge_score($post->ID, $user_id);

        $entry = array(
            'id'              => $post->ID,
            'division'        => get_post_meta($post->ID, 'umgpc_division', true) ?: '',
            'submitted_at'    => get_post_meta($post->ID, 'umgpc_submitted_at', true) ?: null,
            'photos'          => umgpc_judging_photos($post->ID, 'medium'),
            'my_score_status' => $my_score ? ($my_score['status'] === 'final' ? 'final' : 'draft') : 'unscored',
            'my_total'        => $my_score ? (int) $my_score['total'] : null,
        );
        if ($include_identity) {
            $entry['identity'] = umgpc_entry_identity($post->ID);
        }
        $entries[] = $entry;
    }

    return rest_ensure_response(array(
        'entries'  => $entries,
        'total'    => (int) $query->found_posts,
        'page'     => $page,
        'per_page' => $per_page,
        'blind'    => !$include_identity,
    ));
}

/* =========================================================
   GET /umg/v1/admin/submissions/{id}
   ========================================================= */

function umgpc_admin_get_submission(WP_REST_Request $request) {
    $user_id = umgpc_require_cap($request, 'umgpc_judge_submissions');
    if (is_wp_error($user_id)) return $user_id;

    $post = umgpc_get_submitted_entry((int) $request['id']);
    if (is_wp_error($post)) return $post;

    $include_identity = !umgpc_is_blind_judging() || user_can($user_id, 'umgpc_admin_results');

    $response = array(
        'id'           => $post->ID,
        'division'     => get_post_meta($post->ID, 'umgpc_division', true) ?: '',
        'submitted_at' => get_post_meta($post->ID, 'umgpc_submitted_at', true) ?: null,
        'photos'       => umgpc_judging_photos($post->ID, 'large'),
        'biography'    => get_post_meta($post->ID, 'umgpc_biography', true) ?: '',
        // Only ever the caller's own score — never other judges' (that lives
        // solely behind the admin-only /admin/results aggregation).
        'my_score'     => umgpc_get_judge_score($post->ID, $user_id),
        'blind'        => !$include_identity,
    );
    if ($include_identity) {
        $response['identity'] = umgpc_entry_identity($post->ID);
    }

    return rest_ensure_response($response);
}

/* =========================================================
   PUT /umg/v1/admin/submissions/{id}/score
   ========================================================= */

function umgpc_admin_save_score(WP_REST_Request $request) {
    $user_id = umgpc_require_cap($request, 'umgpc_judge_submissions');
    if (is_wp_error($user_id)) return $user_id;

    $post = umgpc_get_submitted_entry((int) $request['id']);
    if (is_wp_error($post)) return $post;

    $body = $request->get_json_params();
    if (!is_array($body)) {
        return new WP_Error('invalid_body', 'Request body must be JSON.', array('status' => 400));
    }

    // A judge's final score is locked; admins may override (e.g. to unlock).
    $existing = umgpc_get_judge_score($post->ID, $user_id);
    if ($existing && ($existing['status'] ?? '') === 'final' && !user_can($user_id, 'umgpc_admin_results')) {
        return new WP_Error('score_final', 'Your score for this entry has been finalized and can no longer be edited.', array('status' => 409));
    }

    // Validate scores: non-empty map of slug-key => int within range.
    $raw_scores = isset($body['scores']) && is_array($body['scores']) ? $body['scores'] : array();
    if (empty($raw_scores)) {
        return new WP_Error('invalid_scores', 'At least one criterion score is required.', array('status' => 422));
    }

    $scores = array();
    $total  = 0;
    foreach ($raw_scores as $key => $value) {
        $key = sanitize_title($key);
        if ($key === '' || !is_numeric($value)) {
            return new WP_Error('invalid_scores', 'Scores must map criterion keys to numbers.', array('status' => 422));
        }
        $value = (int) $value;
        if ($value < UMGPC_SCORE_MIN || $value > UMGPC_SCORE_MAX) {
            return new WP_Error(
                'score_out_of_range',
                sprintf('Each score must be an integer between %d and %d.', UMGPC_SCORE_MIN, UMGPC_SCORE_MAX),
                array('status' => 422)
            );
        }
        $scores[$key] = $value;
        $total += $value;
    }

    $status = ($body['status'] ?? 'draft') === 'final' ? 'final' : 'draft';

    $score = array(
        'judge_id'         => (int) $user_id,
        'scores'           => $scores,
        'total'            => $total,
        'notes'            => sanitize_textarea_field($body['notes'] ?? ''),
        'criteria_version' => sanitize_text_field($body['criteria_version'] ?? ''),
        'status'           => $status,
        'updated_at'       => current_time('mysql'),
    );

    update_post_meta($post->ID, 'umgpc_score_' . (int) $user_id, wp_json_encode($score));

    return rest_ensure_response($score);
}

/* =========================================================
   GET /umg/v1/admin/results  (admin only)
   ========================================================= */

function umgpc_admin_results(WP_REST_Request $request) {
    $user_id = umgpc_require_cap($request, 'umgpc_admin_results');
    if (is_wp_error($user_id)) return $user_id;

    $query = new WP_Query(array(
        'post_type'      => 'umg_submission',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'meta_query'     => array(
            array('key' => 'umgpc_status', 'value' => 'submitted'),
        ),
        'orderby'        => 'ID',
        'order'          => 'ASC',
    ));

    $rows = array();
    foreach ($query->posts as $post) {
        $scores = umgpc_get_all_scores($post->ID);

        $judge_count    = count($scores);
        $final_count    = 0;
        $total_sum      = 0;
        $criterion_sums = array();

        foreach ($scores as $score) {
            if (($score['status'] ?? '') === 'final') $final_count++;
            $total_sum += (int) ($score['total'] ?? 0);
            foreach (($score['scores'] ?? array()) as $key => $value) {
                if (!isset($criterion_sums[$key])) $criterion_sums[$key] = 0;
                $criterion_sums[$key] += (int) $value;
            }
        }

        $criterion_averages = array();
        foreach ($criterion_sums as $key => $sum) {
            $criterion_averages[$key] = $judge_count ? round($sum / $judge_count, 2) : null;
        }

        $rows[] = array(
            'id'                 => $post->ID,
            'division'           => get_post_meta($post->ID, 'umgpc_division', true) ?: '',
            'identity'           => umgpc_entry_identity($post->ID),
            'submitted_at'       => get_post_meta($post->ID, 'umgpc_submitted_at', true) ?: null,
            'judge_count'        => $judge_count,
            'final_count'        => $final_count,
            'average_total'      => $judge_count ? round($total_sum / $judge_count, 2) : null,
            'criterion_averages' => $criterion_averages,
        );
    }

    // Rank within each division by average total (unscored entries last).
    usort($rows, function ($a, $b) {
        if ($a['division'] !== $b['division']) {
            return strcmp($a['division'], $b['division']);
        }
        return ($b['average_total'] ?? -1) <=> ($a['average_total'] ?? -1);
    });
    $rank = 0;
    $current_division = null;
    foreach ($rows as &$row) {
        if ($row['division'] !== $current_division) {
            $current_division = $row['division'];
            $rank = 0;
        }
        $row['rank'] = $row['average_total'] !== null ? ++$rank : null;
    }
    unset($row);

    return rest_ensure_response(array('results' => $rows));
}
