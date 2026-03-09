"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import type { SectionData, SecondaryArticle } from "@umg/api";
import FeaturedMedia from "./components/FeaturedMedia";
import ArticleLink from "../ArticleLink";
import CategoryLabel from "./CategoryLabel";

// Title font sizes in rem (for LG+ breakpoints): 5xl, 4xl, 3xl, 2xl
const TITLE_SIZES_REM = [3, 2.25, 1.875, 1.5] as const;
const LG_BREAKPOINT = 1024;

function SecondaryArticleCard({ article }: { article: SecondaryArticle }) {
  return (
    <article className="py-3">
      <h3 className="font-semibold text-base leading-tight mb-1">
        <ArticleLink slug={article.slug} url={article.url} className="hover:underline">
          {article.title}
        </ArticleLink>
      </h3>
      <span className="text-sm text-gray-500">{article.time}</span>
    </article>
  );
}

interface SectionType2Props extends SectionData {
  slug: string;
  category: string;
  categoryColor?: string;
  categoryTextColor?: string;
  categoryUnderlineColor?: string;
  categoryIcon?: string;
  titleClassName?: string;
}

export default function SectionType2({
  slug,
  category,
  categoryColor,
  categoryTextColor,
  categoryUnderlineColor,
  categoryIcon,
  titleClassName,
  featured,
  secondary,
}: SectionType2Props) {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleFontSize, setTitleFontSize] = useState<number | null>(null);

  // Find the right title size by iterating until text fits
  const calculateOptimalSize = () => {
    // Only adjust at LG+ where text and image are side-by-side
    if (typeof window === "undefined" || window.innerWidth < LG_BREAKPOINT) {
      setTitleFontSize(null);
      return;
    }

    if (!textRef.current || !imageRef.current || !titleRef.current) return;

    const imageHeight = imageRef.current.offsetHeight;

    // Try each size from largest to smallest until text fits
    for (const size of TITLE_SIZES_REM) {
      titleRef.current.style.fontSize = `${size}rem`;
      const textHeight = textRef.current.offsetHeight;

      if (textHeight <= imageHeight) {
        setTitleFontSize(size);
        return;
      }
    }

    // If none fit, use smallest
    setTitleFontSize(TITLE_SIZES_REM[TITLE_SIZES_REM.length - 1]);
  };

  // Measure and adjust title size after layout
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      calculateOptimalSize();
    });
  });

  useEffect(() => {
    const handleResize = () => {
      // Force recalculation by resetting first, then recalculating
      setTitleFontSize(null);
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        calculateOptimalSize();
      });
    };

    // Observe image size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section id={slug} className="pt-6 pb-6 scroll-mt-24 border-b border-gray-300">
      <CategoryLabel category={category} slug={slug} categoryColor={categoryColor} categoryTextColor={categoryTextColor} categoryUnderlineColor={categoryUnderlineColor} categoryIcon={categoryIcon} />

      {/* Main content wrapper
            SM/MD/LG: stacked (featured, then secondary)
            2XL: 4-col grid (1 text | 2 image | 1 secondary stack)
        */}
      <div className="2xl:grid 2xl:grid-cols-4 2xl:gap-8">
        {/* Featured Article
              SM/MD: stacked (text, then image)
              LG: 1/3 text | 2/3 image side by side
              2XL: contents (text=1col, image=2cols)
          */}
        <article className="mb-6 lg:flex lg:gap-8 2xl:contents">
          {/* Text content */}
          <div ref={textRef} className="lg:w-1/3 2xl:w-auto">
            <h2
              ref={titleRef}
              className={`text-2xl md:text-3xl font-bold leading-tight mb-3 ${titleClassName || ""}`}
              style={titleFontSize ? { fontSize: `${titleFontSize}rem` } : undefined}
            >
              <ArticleLink slug={featured.slug} url={featured.url} className="hover:underline">
                {featured.title}
              </ArticleLink>
            </h2>
            <p className="text-base text-gray-600 mb-2">{featured.snippet}</p>
            <span className="text-sm text-gray-500">{featured.time}</span>
          </div>
          {/* Featured Media (Gallery or Single Image) */}
          <div ref={imageRef} className="mt-4 lg:mt-0 -mx-6 lg:mx-0 lg:w-2/3 2xl:w-auto 2xl:col-span-2 2xl:mt-0">
            <FeaturedMedia images={featured.gallery} alt={featured.title} />
          </div>
        </article>

        {/* Secondary Articles
              SM: 4 rows, all full width
              MD: 2x2 grid
              LG: 4 columns in a row below featured
              2XL: stacked vertically in 1 column
          */}
        <div className="border-t md:border-t-0 border-gray-300 md:grid md:grid-cols-2 lg:grid-cols-4 2xl:block 2xl:border-t-0">
          {secondary[0] && (
          <div className="border-b md:border-b lg:border-b-0 border-gray-300 md:pr-4 lg:pr-4 2xl:pr-0 2xl:border-b">
            <SecondaryArticleCard article={secondary[0]} />
          </div>
          )}
          {secondary[1] && (
          <div className="border-b md:border-b lg:border-b-0 border-gray-300 md:pl-4 lg:pl-4 lg:pr-4 2xl:pl-0 2xl:pr-0 2xl:border-b">
            <SecondaryArticleCard article={secondary[1]} />
          </div>
          )}
          {secondary[2] && (
          <div className="border-b md:border-b-0 lg:border-b-0 border-gray-300 md:pr-4 lg:pl-4 lg:pr-4 2xl:pl-0 2xl:pr-0 2xl:border-b">
            <SecondaryArticleCard article={secondary[2]} />
          </div>
          )}
          {secondary[3] && (
          <div className="md:pl-4 lg:pl-4 2xl:pl-0">
            <SecondaryArticleCard article={secondary[3]} />
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
