/**
 * Divi shortcode stripping and content processing for WordPress posts.
 * WP content.rendered contains raw Divi builder shortcodes — we strip
 * the wrappers and keep inner HTML (bold, links, spans, etc.).
 */

/**
 * Convert a WordPress thumbnail URL to its full-size version.
 * WP appends "-WxH" before the extension for resized images, e.g.:
 *   photo-150x150.jpg → photo.jpg
 *   photo-1024x768.png → photo.png
 */
export function toFullSizeUrl(url: string): string {
  return url.replace(/-\d+x\d+(\.\w+)$/, "$1");
}

/**
 * Decode HTML entities commonly found in Divi shortcode attributes.
 * WP encodes quotes as &#8221; &#8243; etc. in content.rendered.
 */
function decodeShortcodeEntities(text: string): string {
  return text
    .replace(/&#8221;|&#8243;|&#8220;|&quot;/g, '"')
    .replace(/&#8217;|&#8216;|&#0?39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Strip Divi builder shortcodes from HTML content.
 * - Converts [et_pb_image src="URL" ...] → <img src="URL" />
 * - Strips [et_pb_gallery ...] (images resolved separately via media API)
 * - Strips all [et_pb_*...] opening tags and [/et_pb_*] closing tags
 * - Preserves all inner HTML (<p>, <strong>, <a>, <span>, <em>, etc.)
 * - Cleans up excessive whitespace
 */
export function stripDiviShortcodes(html: string): string {
  let result = html;

  // Decode HTML entities in shortcode attributes so regexes can match
  // Only decode within shortcode brackets, not in body HTML
  result = result.replace(/\[et_pb_[^\]]*\]/g, (match) =>
    decodeShortcodeEntities(match)
  );
  result = result.replace(/\[\/et_pb_[^\]]*\]/g, (match) =>
    decodeShortcodeEntities(match)
  );

  // Convert [et_pb_image src="URL" ...] → <img src="URL" />
  result = result.replace(
    /\[et_pb_image[^\]]*\bsrc="([^"]*)"[^\]]*\]/g,
    '<img src="$1" />'
  );

  // Strip [et_pb_gallery ...] entirely (images resolved via media API)
  result = result.replace(/\[et_pb_gallery[^\]]*\]/g, "");

  // Strip all [et_pb_*...] opening tags (self-closing or not)
  result = result.replace(/\[et_pb_[^\]]*\]/g, "");

  // Strip all [/et_pb_*] closing tags
  result = result.replace(/\[\/et_pb_[^\]]*\]/g, "");

  // Clean up excessive whitespace (multiple newlines → double newline)
  result = result.replace(/\n{3,}/g, "\n\n");

  // Remove leading/trailing whitespace
  result = result.trim();

  return result;
}

/**
 * Strip WordPress block editor image/gallery markup from HTML content.
 * Images are already extracted and displayed via FeaturedMedia gallery,
 * so we remove them from the body to prevent duplication.
 * Handles nested <figure> tags (galleries contain nested image figures).
 */
function stripWpBlockImages(html: string): string {
  let result = html;

  // Remove wp-block-gallery figures (which contain nested wp-block-image figures)
  const galleryPattern =
    /<figure\b[^>]*class="[^"]*wp-block-gallery[^"]*"[^>]*>/;
  let galleryMatch;
  while ((galleryMatch = galleryPattern.exec(result)) !== null) {
    let depth = 1;
    let pos = galleryMatch.index + galleryMatch[0].length;
    while (depth > 0 && pos < result.length) {
      const nextOpen = result.indexOf("<figure", pos);
      const nextClose = result.indexOf("</figure>", pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 7;
      } else {
        depth--;
        pos = nextClose + "</figure>".length;
      }
    }
    result = result.slice(0, galleryMatch.index) + result.slice(pos);
  }

  // Remove standalone wp-block-image figures (not inside a gallery)
  result = result.replace(
    /<figure\b[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>[\s\S]*?<\/figure>/g,
    ""
  );

  return result;
}

/**
 * Extract gallery media IDs from [et_pb_gallery gallery_ids="1,2,3"] shortcodes.
 * Handles HTML-encoded quotes (&#8221; etc.) in WP content.rendered.
 */
export function extractGalleryIds(rawHtml: string): number[] {
  // Decode entities in shortcodes first
  const decoded = rawHtml.replace(/\[et_pb_[^\]]*\]/g, (match) =>
    decodeShortcodeEntities(match)
  );

  const ids: number[] = [];
  const galleryRegex = /\[et_pb_gallery[^\]]*\bgallery_ids="([^"]*)"[^\]]*\]/g;
  let match;
  while ((match = galleryRegex.exec(decoded)) !== null) {
    if (match[1]) {
      const parsed = match[1]
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
      ids.push(...parsed);
    }
  }
  return ids;
}

/**
 * Process raw WordPress content: extract images and strip Divi shortcodes.
 * Returns clean HTML, image URLs from content, and gallery media IDs to resolve.
 */
export function processContent(rawHtml: string): {
  html: string;
  images: string[];
  galleryIds: number[];
} {
  const imageSet = new Set<string>();

  // Decode entities in shortcodes for matching
  const decodedForParsing = rawHtml.replace(/\[et_pb_[^\]]*\]/g, (match) =>
    decodeShortcodeEntities(match)
  );

  // Extract from [et_pb_image src="..."] shortcodes
  const diviImageRegex = /\[et_pb_image[^\]]*\bsrc="([^"]*)"[^\]]*\]/g;
  let match;
  while ((match = diviImageRegex.exec(decodedForParsing)) !== null) {
    if (match[1]) imageSet.add(toFullSizeUrl(match[1]));
  }

  // Extract from <img src="..."> HTML tags
  const imgTagRegex = /<img[^>]*\bsrc="([^"]*)"[^>]*>/g;
  while ((match = imgTagRegex.exec(rawHtml)) !== null) {
    if (match[1]) imageSet.add(toFullSizeUrl(match[1]));
  }

  // Extract gallery IDs for async resolution
  const galleryIds = extractGalleryIds(rawHtml);

  const html = stripWpBlockImages(stripDiviShortcodes(rawHtml));

  return { html, images: Array.from(imageSet), galleryIds };
}

/* =========================================================
   Ordered content blocks (inline images + end gallery)
   ========================================================= */

/**
 * A single piece of an article body, in the order the author wrote it.
 * - "html"    → prose chunk, rendered via dangerouslySetInnerHTML
 * - "image"   → a standalone figure (Gutenberg wp-block-image)
 * - "gallery" → a group rendered as a carousel. Divi galleries arrive with
 *               `ids` only; wp-client resolves them to `images` via the media API.
 */
export type ContentBlock =
  | { type: "html"; html: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "gallery"; images: string[]; ids?: number[] };

/** Marker found in the raw HTML, with its offsets preserved. */
interface Marker {
  start: number;
  end: number;
  kind: "wp-gallery" | "wp-image" | "divi-gallery";
}

/**
 * Find the offset just past the </figure> that closes the <figure> opened at
 * `openEnd`. Galleries nest image figures, so we depth-count rather than
 * stopping at the first close tag.
 */
function findFigureEnd(html: string, openEnd: number): number {
  const tag = /<figure\b|<\/figure>/g;
  tag.lastIndex = openEnd;
  let depth = 1;
  let match;
  while (depth > 0 && (match = tag.exec(html)) !== null) {
    depth += match[0] === "</figure>" ? -1 : 1;
  }
  return depth === 0 ? tag.lastIndex : html.length;
}

/**
 * Locate every image marker in the raw HTML, sorted by position.
 * Markers nested inside an earlier marker (image figures inside a gallery)
 * are skipped so each image is claimed exactly once.
 */
function findMarkers(rawHtml: string): Marker[] {
  const markers: Marker[] = [];

  const figureRegex =
    /<figure\b[^>]*class="[^"]*(wp-block-gallery|wp-block-image)[^"]*"[^>]*>/g;
  let match;
  let claimedUntil = 0;
  while ((match = figureRegex.exec(rawHtml)) !== null) {
    if (match.index < claimedUntil) continue; // nested inside a gallery
    const end = findFigureEnd(rawHtml, match.index + match[0].length);
    markers.push({
      start: match.index,
      end,
      kind: match[1] === "wp-block-gallery" ? "wp-gallery" : "wp-image",
    });
    claimedUntil = end;
  }

  // Divi galleries. Matching against the raw string keeps offsets valid —
  // the encoded quotes (&#8221; etc.) contain no "]", so the bracket match holds.
  const diviRegex = /\[et_pb_gallery[^\]]*\](?:\s*\[\/et_pb_gallery\])?/g;
  while ((match = diviRegex.exec(rawHtml)) !== null) {
    markers.push({
      start: match.index,
      end: match.index + match[0].length,
      kind: "divi-gallery",
    });
  }

  return markers.sort((a, b) => a.start - b.start);
}

/** Pull image URLs (full-size) out of a figure segment, in document order. */
function segmentImageUrls(segment: string): string[] {
  const urls: string[] = [];
  const imgRegex = /<img[^>]*\bsrc="([^"]*)"[^>]*>/g;
  let match;
  while ((match = imgRegex.exec(segment)) !== null) {
    if (match[1]) urls.push(toFullSizeUrl(match[1]));
  }
  return urls;
}

/** First non-empty <figcaption> text in a segment, tags stripped. */
function segmentCaption(segment: string): string | undefined {
  const match = segment.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/);
  if (!match) return undefined;
  const text = match[1].replace(/<[^>]+>/g, "").trim();
  return text || undefined;
}

/** True when a chunk has no renderable content once tags/shortcodes are gone. */
function isBlankHtml(html: string): boolean {
  return (
    html
      .replace(/\[\/?et_pb_[^\]]*\]/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim() === ""
  );
}

/**
 * Split raw WordPress content into ordered blocks, preserving the position of
 * every image the author placed. This is the inverse of stripWpBlockImages():
 * instead of deleting figures and hoisting their URLs, we keep them in sequence.
 *
 * Divi gallery blocks come back with `ids` and an empty `images` array — the
 * caller resolves them through the WP media API.
 */
export function parseContentBlocks(rawHtml: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const pushHtml = (chunk: string) => {
    if (isBlankHtml(chunk)) return;
    const html = stripDiviShortcodes(chunk);
    if (html) blocks.push({ type: "html", html });
  };

  let cursor = 0;
  for (const marker of findMarkers(rawHtml)) {
    pushHtml(rawHtml.slice(cursor, marker.start));

    const segment = rawHtml.slice(marker.start, marker.end);

    if (marker.kind === "divi-gallery") {
      const ids = extractGalleryIds(segment);
      if (ids.length > 0) blocks.push({ type: "gallery", images: [], ids });
    } else {
      const urls = segmentImageUrls(segment);
      if (marker.kind === "wp-image" && urls.length === 1) {
        blocks.push({
          type: "image",
          src: urls[0],
          caption: segmentCaption(segment),
        });
      } else if (urls.length > 0) {
        blocks.push({ type: "gallery", images: urls });
      }
    }

    cursor = marker.end;
  }
  pushHtml(rawHtml.slice(cursor));

  return blocks;
}
