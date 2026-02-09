/**
 * Divi shortcode stripping and content processing for WordPress posts.
 * WP content.rendered contains raw Divi builder shortcodes — we strip
 * the wrappers and keep inner HTML (bold, links, spans, etc.).
 */

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
    if (match[1]) imageSet.add(match[1]);
  }

  // Extract from <img src="..."> HTML tags
  const imgTagRegex = /<img[^>]*\bsrc="([^"]*)"[^>]*>/g;
  while ((match = imgTagRegex.exec(rawHtml)) !== null) {
    if (match[1]) imageSet.add(match[1]);
  }

  // Extract gallery IDs for async resolution
  const galleryIds = extractGalleryIds(rawHtml);

  const html = stripDiviShortcodes(rawHtml);

  return { html, images: Array.from(imageSet), galleryIds };
}
