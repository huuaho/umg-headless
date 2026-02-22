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
    );
}

/**
 * Child categories under each parent.
 * Keys are UM child slugs; values define parent + display name.
 */
function um_category_children_spec() {
    return array(
        // World News & Politics
        'dw-africa'              => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Africa'),
        'dw-americas'            => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Americas'),
        'dw-asia'                => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Asia'),
        'dw-europe'              => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Europe'),
        'dw-know-your-president' => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Know your President'),
        'dw-middle-east'         => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Middle East'),
        'dw-news-update'         => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: News Update'),
        'dw-oceania'             => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Oceania'),
        'dw-politics-policy'     => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Politics & Policy'),
        'dw-regions'             => array('parent'=>'world-news-politics', 'name'=>'Diplomatic Watch: Regions'),

        // Profiles & Opinions
        'dw-editorial'           => array('parent'=>'profiles-opinions', 'name'=>'Diplomatic Watch: Editorial'),
        'dw-interview'           => array('parent'=>'profiles-opinions', 'name'=>'Diplomatic Watch: Interview'),
        'dw-opinion'             => array('parent'=>'profiles-opinions', 'name'=>'Diplomatic Watch: Opinion'),
        'is-history-legacy'      => array('parent'=>'profiles-opinions', 'name'=>'International Spectrum: History & Legacy'),

        // Economy & Business
        'dw-economy'             => array('parent'=>'economy-business', 'name'=>'Diplomatic Watch: Economy'),
        'dw-business-investment' => array('parent'=>'economy-business', 'name'=>'Diplomatic Watch: Business & Investment'),

        // Diplomacy
        'dw-diplomacy'           => array('parent'=>'diplomacy', 'name'=>'Diplomatic Watch: Diplomacy'),
        'dw-appointments'        => array('parent'=>'diplomacy', 'name'=>'Diplomatic Watch: Appointments'),

        // Art & Culture
        'dw-cultural-connections'=> array('parent'=>'art-culture', 'name'=>'Diplomatic Watch: Cultural Connections'),
        'dw-culture-tourism'     => array('parent'=>'art-culture', 'name'=>'Diplomatic Watch: Culture & Tourism'),
        'dw-fashion-lifestyle'   => array('parent'=>'art-culture', 'name'=>'Diplomatic Watch: Fashion & Lifestyle'),
        'dw-sports'              => array('parent'=>'art-culture', 'name'=>'Diplomatic Watch: Sports'),
        'em-art-culture'         => array('parent'=>'art-culture', 'name'=>'Echo Media: Art & Culture'),
        'is-arts'                => array('parent'=>'art-culture', 'name'=>'International Spectrum: Arts'),
        'is-civic-cultural'      => array('parent'=>'art-culture', 'name'=>'International Spectrum: Civic & Cultural Affairs'),

        // Education & Youth
        'em-education'           => array('parent'=>'education-youth', 'name'=>'Echo Media: Education'),
        'is-leadership-youth'    => array('parent'=>'education-youth', 'name'=>'International Spectrum: Leadership & Youth Engagement'),

        // Local Community
        'dw-events'              => array('parent'=>'local-community', 'name'=>'Diplomatic Watch: Events'),
        'is-social-impact'       => array('parent'=>'local-community', 'name'=>'International Spectrum: Social Impact & Justice'),
        'is-community-programs'  => array('parent'=>'local-community', 'name'=>'International Spectrum: Community & Public Programs'),

        // Wellbeing, Environment, Technology
        'dw-technology'          => array('parent'=>'wellbeing-env-tech', 'name'=>'Diplomatic Watch: Technology'),
        'em-nature'              => array('parent'=>'wellbeing-env-tech', 'name'=>'Echo Media: Nature'),
        'dw-health'              => array('parent'=>'wellbeing-env-tech', 'name'=>'Diplomatic Watch: Health'),
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
        'diplomaticwatch' => array(
            'Africa'                => 'dw-africa',
            'Americas'              => 'dw-americas',
            'Asia'                  => 'dw-asia',
            'Europe'                => 'dw-europe',
            'Know Your President'   => 'dw-know-your-president',
            'Middle East'           => 'dw-middle-east',
            'News Update'           => 'dw-news-update',
            'Oceania'               => 'dw-oceania',
            'Politics & Policy'     => 'dw-politics-policy',
            'Regions'               => 'dw-regions',

            'Editorial'             => 'dw-editorial',
            'Interview'             => 'dw-interview',
            'Opinion'               => 'dw-opinion',

            'Economy'               => 'dw-economy',
            'Business & Investment' => 'dw-business-investment',

            'Diplomacy'             => 'dw-diplomacy',
            'Appointments'          => 'dw-appointments',

            'Cultural Connections'  => 'dw-cultural-connections',
            'Culture & Tourism'     => 'dw-culture-tourism',
            'Fashion & Lifestyle'   => 'dw-fashion-lifestyle',
            'Sports'                => 'dw-sports',

            'Events'                => 'dw-events',

            'Technology'            => 'dw-technology',
            'Health'                => 'dw-health',
        ),
        'echo-media' => array(
            'Art & Culture' => 'em-art-culture',
            'Education'     => 'em-education',
            'Nature'        => 'em-nature',
        ),
        'internationalspectrum' => array(
            'History & Legacy'              => 'is-history-legacy',
            'Arts'                          => 'is-arts',
            'Civic & Cultural Affairs'      => 'is-civic-cultural',
            'Leadership & Youth Engagement' => 'is-leadership-youth',
            'Social Impact & Justice'       => 'is-social-impact',
            'Community & Public Programs'   => 'is-community-programs',
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
        'diplomaticwatch' => array(
            'Photo Gallery',
            'Look Your Best With Jane Pennewell',
        ),
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
