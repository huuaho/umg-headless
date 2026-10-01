<?php
/**
 * United Media Ingestor – Category Mapping & Exclusions
 *
 * Responsibilities:
 * - Define normalized UM category parents/children
 * - Map source category names to UM child slugs
 * - Identify excluded categories (ingest but mark excluded)
 */

if (!defined('ABSPATH')) exit;

/* =========================================================
   Normalization helpers
   ========================================================= */

/**
 * Normalize category names for reliable comparisons.
 */
function um_normalize_name($s) {
    $s = wp_strip_all_tags((string)$s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

/* =========================================================
   UM Category Model (Parents + Children)
   ========================================================= */

/**
 * Top-level UM category parents.
 * Slugs are canonical and stable.
 */
function um_category_parents() {
    return array(
        'world-news-politics' => 'World News & Politics',
        'profiles-opinions'   => 'Profiles & Opinions',
        'economy-business'    => 'Economy & Business',
        'diplomacy'           => 'Diplomacy',
        'art-culture'         => 'Art & Culture',
        'education-youth'     => 'Education & Youth',
        'local-community'     => 'Local Community',
        'wellbeing-env-tech'  => 'Wellbeing, Environment, Technology',
        'video-interviews'    => 'Video Interviews',
    );
}

/**
 * Child categories under each parent.
 * Keys are UM child slugs; values define parent + display name.
 */
function um_category_children_spec() {
    return array(
        // World News & Politics, Economy & Business and Diplomacy have no
        // children since Diplomatic Watch was dropped as a source
        // (2026-10-01). Kept as parents so the buckets can be refilled.

        // Profiles & Opinions
        'is-history-legacy'      => array('parent'=>'profiles-opinions', 'name'=>'International Spectrum: Diplomatic and Historic Events'),

        // Art & Culture
        'em-art-culture'         => array('parent'=>'art-culture', 'name'=>'Echo Media: Art & Culture'),
        'is-arts'                => array('parent'=>'art-culture', 'name'=>'International Spectrum: Arts, Science and Technology'),
        'is-civic-cultural'      => array('parent'=>'art-culture', 'name'=>'International Spectrum: Cultural and International Affairs'),

        // Education & Youth
        'em-education'           => array('parent'=>'education-youth', 'name'=>'Echo Media: Education'),

        // Local Community
        'is-social-impact'       => array('parent'=>'local-community', 'name'=>'International Spectrum: Social Impact Events'),
        'is-community-programs'  => array('parent'=>'local-community', 'name'=>'International Spectrum: Community Events'),

        // Wellbeing, Environment, Technology
        'em-nature'              => array('parent'=>'wellbeing-env-tech', 'name'=>'Echo Media: Nature'),

        // Video Interviews (own bucket so the UMG homepage can show a dedicated section)
        'is-video-interviews'    => array('parent'=>'video-interviews', 'name'=>'International Spectrum: Video Interviews'),
    );
}

/* =========================================================
   Source → UM child mapping
   ========================================================= */

/**
 * Map source category display names to UM child slugs.
 * Keys must match REST category "name" (after normalization).
 */
function um_source_category_map() {
    return array(
        'echo-media' => array(
            'Art & Culture' => 'em-art-culture',
            'Education'     => 'em-education',
            'Nature'        => 'em-nature',
        ),
        'internationalspectrum' => array(
            'Diplomatic and Historic Events'     => 'is-history-legacy',
            'Arts, Science and Technology'       => 'is-arts',
            'Cultural and International Affairs' => 'is-civic-cultural',
            'Social Impact Events'               => 'is-social-impact',
            'Community Events'                   => 'is-community-programs',
            'Video Interviews'                   => 'is-video-interviews',
        ),
    );
}

/* =========================================================
   Exclusions (ingest but mark excluded)
   ========================================================= */

/**
 * Excluded source categories by site.
 * These are ingested but flagged with um_is_excluded = 1.
 */
function um_excluded_source_categories() {
    return array(
        'echo-media' => array(
            'Media Network',
        ),
        'internationalspectrum' => array(
            'Uncategorized',
        ),
    );
}

/**
 * Determine exclusion and mapping for a set of source category names.
 *
 * @return array {
 *   is_excluded: bool,
 *   excluded_reason: string,
 *   mapped_slugs: string[],   // UM child slugs to assign
 *   unmapped: string[]        // source names with no mapping
 * }
 */
function um_resolve_categories($site_id, $source_category_names) {
    $site_id = sanitize_key($site_id);

    $norm_names = array();
    foreach ((array)$source_category_names as $n) {
        $norm = um_normalize_name($n);
        if ($norm !== '') $norm_names[] = $norm;
    }
    $norm_names = array_values(array_unique($norm_names));

    $excluded = um_excluded_source_categories();
    $map      = um_source_category_map();

    $is_excluded = false;
    $reason = '';
    if (isset($excluded[$site_id])) {
        foreach ($norm_names as $n) {
            foreach ($excluded[$site_id] as $ex) {
                if ($n === um_normalize_name($ex)) {
                    $is_excluded = true;
                    $reason = 'Excluded by category: ' . $n;
                    break 2;
                }
            }
        }
    }

    $mapped = array();
    $unmapped = array();

    if (isset($map[$site_id])) {
        foreach ($norm_names as $n) {
            if (isset($map[$site_id][$n])) {
                $mapped[] = $map[$site_id][$n];
            } else {
                $unmapped[] = $n;
            }
        }
    } else {
        $unmapped = $norm_names;
    }

    return array(
        'is_excluded'     => $is_excluded,
        'excluded_reason'=> $reason,
        'mapped_slugs'    => array_values(array_unique($mapped)),
        'unmapped'        => array_values(array_unique($unmapped)),
    );
}
