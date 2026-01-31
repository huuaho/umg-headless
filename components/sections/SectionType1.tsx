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

export default function SectionType1({
  category,
  featured,
  secondary,
}: SectionType1Data) {
  return (
    <section className="py-6">
      {/* Category Label */}
      <div className="mb-4">
        <a
          href="#"
          className="text-sm font-bold text-black hover:text-gray-700"
        >
          {category} &gt;
        </a>
      </div>

      {/* Featured Article */}
      <article className="mb-6">
        <h2 className="text-2xl font-bold leading-tight mb-3">
          {featured.title}
        </h2>
        <p className="text-base text-gray-600 mb-2">{featured.snippet}</p>
        <span className="text-sm text-gray-500">{featured.time}</span>
        <div className="mt-4 -mx-4 lg:mx-0">
          <Gallery images={featured.gallery} />
        </div>
      </article>

      {/* Secondary Articles
          SM: 3 rows (1, 1, 2 columns) - horizontal borders, top/bottom border
          MD: 2x2 grid - no top border, no vertical borders, horizontal border between rows + bottom border
      */}
      <div className="border-t md:border-t-0 border-b border-gray-200 grid grid-cols-2">
        {/* Article 1 */}
        <div className="col-span-2 md:col-span-1 border-b border-gray-200 md:pr-4">
          <SecondaryArticleCard article={secondary[0]} />
        </div>
        {/* Article 2 */}
        <div className="col-span-2 md:col-span-1 border-b border-gray-200 md:pl-4">
          <SecondaryArticleCard article={secondary[1]} />
        </div>
        {/* Article 3 */}
        <div className="col-span-1 pr-2 md:pr-4">
          <SecondaryArticleCard article={secondary[2]} />
        </div>
        {/* Article 4 */}
        <div className="col-span-1 pl-2 md:pl-4">
          <SecondaryArticleCard article={secondary[3]} />
        </div>
      </div>
    </section>
  );
}
