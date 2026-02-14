"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import type { SectionData, SecondaryArticle } from "@umg/api";
import FeaturedMedia from "./components/FeaturedMedia";
import ArticleLink from "../ArticleLink";
import CategoryLabel from "./CategoryLabel";

// Title font sizes in rem (for 2XL breakpoint): 5xl, 4xl, 3xl, 2xl
const TITLE_SIZES_REM = [3, 2.25, 1.875, 1.5] as const;
const XXL_BREAKPOINT = 1536;

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

interface SectionType1Props extends SectionData {
  slug: string;
  category: string;
  categoryColor?: string;
  categoryIcon?: string;
}

export default function SectionType1({
  slug,
  category,
  categoryColor,
  categoryIcon,
  featured,
  secondary,
}: SectionType1Props) {
  const textRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleFontSize, setTitleFontSize] = useState<number | null>(null);

  // Find the right title size by iterating until text fits (only at 2XL)
  const calculateOptimalSize = () => {
    // Only adjust at 2XL where text and gallery are side-by-side
    if (typeof window === "undefined" || window.innerWidth < XXL_BREAKPOINT) {
      setTitleFontSize(null);
      return;
    }

    if (!textRef.current || !galleryRef.current || !titleRef.current) return;

    const galleryHeight = galleryRef.current.offsetHeight;

    // Try each size from largest to smallest until text fits
    for (const size of TITLE_SIZES_REM) {
      titleRef.current.style.fontSize = `${size}rem`;
      const textHeight = textRef.current.offsetHeight;

      if (textHeight <= galleryHeight) {
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
      requestAnimationFrame(() => {
        calculateOptimalSize();
      });
    };

    // Observe gallery size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (galleryRef.current) {
      resizeObserver.observe(galleryRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section id={slug} className="pt-6 pb-6 scroll-mt-24 border-b border-gray-300">
      <CategoryLabel category={category} categoryColor={categoryColor} categoryIcon={categoryIcon} />

      {/* Main content wrapper
          SM/MD: stacked vertically
          LG: 2/3 featured | 1/3 secondary side by side
          2XL: stacked (featured with gallery side-by-side, then secondary in 4 cols)
      */}
      <div className="lg:flex lg:gap-8 2xl:block">
        {/* Featured Article Column */}
        <div className="lg:w-2/3 2xl:w-full">
          {/* Featured Article
              SM/MD/LG: title, snippet, time stacked, then gallery below
              2XL: 1/3 text | 2/3 gallery side by side
          */}
          <article className="mb-6 lg:mb-0 2xl:mb-6 2xl:flex 2xl:gap-8">
            {/* Text content */}
            <div ref={textRef} className="2xl:w-1/3">
              <h2
                ref={titleRef}
                className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3"
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
            <div ref={galleryRef} className="mt-4 2xl:mt-0 -mx-6 lg:mx-0 2xl:w-2/3">
              <FeaturedMedia images={featured.gallery} alt={featured.title} />
            </div>
          </article>
        </div>

        {/* Secondary Articles Column
            SM: 3 rows (1, 1, 2 columns)
            MD: 2x2 grid
            LG: 1/3 width, stacked vertically
            2XL: 4 equal columns below featured
        */}
        <div className="lg:w-1/3 2xl:w-full">
          <div className="border-t md:border-t-0 lg:border-t-0 border-gray-300 grid grid-cols-2 lg:grid-cols-1 2xl:grid-cols-4">
            {secondary[0] && (
            <div className="col-span-2 md:col-span-1 lg:col-span-1 2xl:col-span-1 border-b lg:border-b 2xl:border-b-0 border-gray-300 md:pr-4 lg:pr-0 2xl:pr-4">
              <SecondaryArticleCard article={secondary[0]} />
            </div>
            )}
            {secondary[1] && (
            <div className="col-span-2 md:col-span-1 lg:col-span-1 2xl:col-span-1 border-b lg:border-b 2xl:border-b-0 border-gray-300 md:pl-4 lg:pl-0 2xl:pl-4 2xl:pr-4">
              <SecondaryArticleCard article={secondary[1]} />
            </div>
            )}
            {secondary[2] && (
            <div className="col-span-1 lg:col-span-1 2xl:col-span-1 pr-2 md:pr-4 lg:pr-0 2xl:pr-4 2xl:pl-4 lg:border-b 2xl:border-b-0 border-gray-300">
              <SecondaryArticleCard article={secondary[2]} />
            </div>
            )}
            {secondary[3] && (
            <div className="col-span-1 lg:col-span-1 2xl:col-span-1 pl-2 md:pl-4 lg:pl-0 2xl:pl-4">
              <SecondaryArticleCard article={secondary[3]} />
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
