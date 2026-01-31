"use client";

import Image from "next/image";
import { useState } from "react";
import type { SectionType1Data, SecondaryArticle } from "@/lib/dummyData";

function Gallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      {/* Image */}
      <div className="relative aspect-3/2 w-full">
        <Image
          src={images[currentIndex]}
          alt="Gallery image"
          fill
          className="object-cover"
        />
      </div>
      {/* Bottom bar: pagination left, arrows right */}
      <div className="flex items-center justify-between py-2 px-4 lg:px-0">
        {/* Pagination tracker */}
        <span className="text-sm text-gray-500">
          [{currentIndex + 1}/{images.length}]
        </span>
        {/* Navigation arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            className="p-1 text-gray-600 hover:text-black transition-colors"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="p-1 text-gray-600 hover:text-black transition-colors"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SecondaryArticleCard({ article }: { article: SecondaryArticle }) {
  return (
    <article className="py-3">
      <h3 className="font-semibold text-base leading-tight mb-1">
        {article.title}
      </h3>
      <span className="text-sm text-gray-500">{article.time}</span>
    </article>
  );
}

interface SectionType1Props extends SectionType1Data {
  slug: string;
}

export default function SectionType1({
  slug,
  category,
  featured,
  secondary,
}: SectionType1Props) {
  return (
    <section id={slug} className="py-6 scroll-mt-24">
      {/* Category Label */}
      <div className="mb-4">
        <a
          href="#"
          className="text-sm font-bold text-black hover:text-gray-700"
        >
          {category} &gt;
        </a>
      </div>

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
            <div className="2xl:w-1/3">
              <h2 className="text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold leading-tight mb-3">
                {featured.title}
              </h2>
              <p className="text-base text-gray-600 mb-2">{featured.snippet}</p>
              <span className="text-sm text-gray-500">{featured.time}</span>
            </div>
            {/* Gallery */}
            <div className="mt-4 2xl:mt-0 -mx-4 lg:mx-0 2xl:w-2/3">
              <Gallery images={featured.gallery} />
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
          <div className="border-t md:border-t-0 lg:border-t-0 2xl:border-t-0 border-b lg:border-b-0 2xl:border-b border-gray-200 grid grid-cols-2 lg:grid-cols-1 2xl:grid-cols-4">
            {/* Article 1 */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1 2xl:col-span-1 border-b lg:border-b 2xl:border-b-0 border-gray-200 md:pr-4 lg:pr-0 2xl:pr-4">
              <SecondaryArticleCard article={secondary[0]} />
            </div>
            {/* Article 2 */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1 2xl:col-span-1 border-b lg:border-b 2xl:border-b-0 border-gray-200 md:pl-4 lg:pl-0 2xl:pl-4 2xl:pr-4">
              <SecondaryArticleCard article={secondary[1]} />
            </div>
            {/* Article 3 */}
            <div className="col-span-1 lg:col-span-1 2xl:col-span-1 pr-2 md:pr-4 lg:pr-0 2xl:pr-4 2xl:pl-4 lg:border-b 2xl:border-b-0 border-gray-200">
              <SecondaryArticleCard article={secondary[2]} />
            </div>
            {/* Article 4 */}
            <div className="col-span-1 lg:col-span-1 2xl:col-span-1 pl-2 md:pl-4 lg:pl-0 2xl:pl-4">
              <SecondaryArticleCard article={secondary[3]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
