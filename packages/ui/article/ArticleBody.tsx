"use client";

import Image from "next/image";
import type { ContentBlock } from "@umg/api";
import FeaturedMedia from "../sections/components/FeaturedMedia";

interface ArticleBodyProps {
  blocks: ContentBlock[];
  /** Article title — used as alt text fallback (WP posts carry no alt text). */
  title: string;
  /** When true, the first block is rendered edge-to-edge as the article hero. */
  leadBlockIsHero: boolean;
}

const PROSE_CLASSES =
  "prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-img:rounded-lg";

/**
 * Renders an article body from ordered blocks, keeping every image where the
 * author placed it in WordPress. Galleries render as carousels in place —
 * editors already put them at the end of the post, so that is where they land.
 *
 * The lead block gets the full-bleed hero treatment; later images sit inside
 * the article column at their natural aspect ratio (cropping an inline
 * editorial photo to 3:2 loses the point of placing it there).
 */
export default function ArticleBody({
  blocks,
  title,
  leadBlockIsHero,
}: ArticleBodyProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const isHero = leadBlockIsHero && index === 0;

        if (block.type === "html") {
          return (
            <div
              key={index}
              className={`${PROSE_CLASSES} mb-8`}
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          );
        }

        if (block.type === "gallery") {
          return (
            <div
              key={index}
              className={isHero ? "mb-8 -mx-6 md:mx-0" : "my-10 -mx-6 md:mx-0"}
            >
              <FeaturedMedia
                images={block.images.length > 1 ? block.images : block.images[0]}
                alt={title}
              />
            </div>
          );
        }

        if (isHero) {
          return (
            <div key={index} className="mb-8 -mx-6 md:mx-0">
              <FeaturedMedia images={block.src} alt={title} />
            </div>
          );
        }

        return (
          <figure key={index} className="my-10">
            <Image
              src={block.src}
              alt={block.caption || title}
              width={1600}
              height={1067}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 896px) 100vw, 896px"
            />
            {block.caption && (
              <figcaption className="mt-2 text-sm text-gray-500">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </>
  );
}
