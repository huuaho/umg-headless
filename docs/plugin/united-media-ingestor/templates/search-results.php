<?php
/**
 * Search Results Template for United Media Ingestor
 *
 * Displays only ingested articles (um_article CPT) in search results
 */

if (!defined('ABSPATH')) exit;

// Clean up ET Builder/Divi search parameters by redirecting to clean URL
if (isset($_GET['et_pb_searchform_submit']) || isset($_GET['et_pb_include_posts']) || isset($_GET['et_pb_include_pages'])) {
    $clean_url_args = array('s' => get_search_query());
    if (get_query_var('paged')) {
        $clean_url_args['paged'] = get_query_var('paged');
    }
    $clean_url = add_query_arg($clean_url_args, home_url('/'));
    wp_redirect($clean_url);
    exit;
}

// Get search query
$search_query = get_search_query();

// Get all search results (no pagination)
$search_results = um_get_search_results($search_query, 1, -1);

get_header();
?>

<div id="um-search-results-page" class="um-search-container">
    <div class="um-search-header">
        <h1 class="um-search-title">
            Search results for "<?php echo esc_html($search_query); ?>"
        </h1>

        <form role="search" method="get" class="um-search-form" action="<?php echo esc_url(home_url('/')); ?>">
            <input
                type="search"
                name="s"
                class="um-search-input"
                value="<?php echo esc_attr($search_query); ?>"
                placeholder="Search articles..."
            />
            <button type="submit" class="um-search-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </form>
    </div>

    <div class="um-search-results-list">
        <?php if ($search_results->have_posts()): ?>
            <?php while ($search_results->have_posts()): $search_results->the_post(); ?>
                <?php
                $article_data = um_get_search_result_data($search_results->post);
                ?>
                <article class="um-search-result-item">
                    <a href="<?php echo esc_url($article_data['url']); ?>" class="um-result-link" target="_blank" rel="noopener noreferrer">
                        <?php if ($article_data['thumbnail']): ?>
                            <div class="um-result-thumbnail">
                                <img
                                    src="<?php echo esc_url($article_data['thumbnail']); ?>"
                                    alt="<?php echo esc_attr($article_data['title']); ?>"
                                    loading="lazy"
                                />
                            </div>
                        <?php else: ?>
                            <div class="um-result-thumbnail um-result-thumbnail-placeholder">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="40" height="40" fill="#E5E7EB"/>
                                    <path d="M16 14l8 6-8 6V14z" fill="#9CA3AF"/>
                                </svg>
                            </div>
                        <?php endif; ?>

                        <div class="um-result-content">
                            <h2 class="um-result-title">
                                <?php echo esc_html($article_data['title']); ?>
                            </h2>

                            <div class="um-result-meta">
                                <?php if ($article_data['author']): ?>
                                    <span class="um-result-source">
                                        BY <?php echo esc_html(strtoupper($article_data['author'])); ?>
                                    </span>
                                <?php endif; ?>

                                <?php if ($article_data['date']): ?>
                                    <span class="um-result-date">
                                        <?php echo esc_html($article_data['date']); ?>
                                    </span>
                                <?php endif; ?>
                            </div>

                            <?php if ($article_data['excerpt']): ?>
                                <div class="um-result-excerpt">
                                    <?php echo esc_html(wp_trim_words($article_data['excerpt'], 30, '...')); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </a>
                </article>
            <?php endwhile; ?>

        <?php else: ?>
            <div class="um-no-results">
                <p>No articles found matching your search.</p>
                <p>Try using different keywords or check your spelling.</p>
            </div>
        <?php endif; ?>

        <?php wp_reset_postdata(); ?>
    </div>
</div>

<?php
get_footer();
