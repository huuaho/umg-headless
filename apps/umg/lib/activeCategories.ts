import { fetchArticles } from "@umg/api";
import { categories, type Category } from "./categories";

/**
 * The nav categories that currently hold at least one article, resolved once at
 * build time (UMG is a static export, so this runs during `next build`).
 *
 * Needed since Diplomatic Watch was dropped as a source (2026-10-01): it was
 * 92.4% of the corpus and left World News & Politics, Economy & Business,
 * Diplomacy and Wellbeing/Environment/Technology with no articles at all, so
 * the header and footer were linking to four dead ends.
 *
 * Fail-safe: any error — or a result claiming *every* category is empty —
 * returns the full list. A transient API failure at build time must not
 * silently ship a site with no navigation. The cost of being wrong that way is
 * a nav link to an empty category page, which is what we had before.
 *
 * Note this is a point-in-time snapshot: a category that gains its first
 * article only reappears in the nav on the next build. The ingestor's cron
 * ingests continuously, so a rebuild is what republishes the nav.
 */
export async function getActiveCategories(): Promise<Category[]> {
  try {
    const populated = await Promise.all(
      categories.map(async (category) => {
        const { total } = await fetchArticles({
          category: category.slug,
          perPage: 1,
        });
        return total > 0;
      })
    );

    const active = categories.filter((_, i) => populated[i]);
    return active.length > 0 ? active : categories;
  } catch {
    return categories;
  }
}
