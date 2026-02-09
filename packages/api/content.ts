/**
 * Divi shortcode stripping and content processing for WordPress posts.
 * WP content.rendered contains raw Divi builder shortcodes — we strip
 * the wrappers and keep inner HTML (bold, links, spans, etc.).
 */

/**
 * Strip Divi builder shortcodes from HTML content.
 * - Converts [et_pb_image src="URL" ...] → <img src="URL" />
 * - Strips [et_pb_gallery ...] (needs media API to resolve IDs — skip for now)
 * - Strips all [et_pb_*...] opening tags and [/et_pb_*] closing tags
 * - Preserves all inner HTML (<p>, <strong>, <a>, <span>, <em>, etc.)
 * - Cleans up excessive whitespace
 */
export function stripDiviShortcodes(html: string): string {
  let result = html;

  // Convert [et_pb_image src="URL" ...] → <img src="URL" />
  result = result.replace(
    /\[et_pb_image[^\]]*\bsrc="([^"]*)"[^\]]*\]/g,
    '<img src="$1" />'
  );

  // Strip [et_pb_gallery ...] entirely (would need media API to resolve IDs)
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
 * Process raw WordPress content: extract images and strip Divi shortcodes.
 * Returns clean HTML and a list of image URLs found in shortcodes.
 */
export function processContent(rawHtml: string): {
  html: string;
  images: string[];
} {
  // Extract image URLs from [et_pb_image src="..."] before stripping
  const images: string[] = [];
  const imageRegex = /\[et_pb_image[^\]]*\bsrc="([^"]*)"[^\]]*\]/g;
  let match;
  while ((match = imageRegex.exec(rawHtml)) !== null) {
    if (match[1]) {
      images.push(match[1]);
    }
  }

  const html = stripDiviShortcodes(rawHtml);

  return { html, images };
}
