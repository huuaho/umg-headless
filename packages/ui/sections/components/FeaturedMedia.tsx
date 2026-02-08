"use client";

import Image from "next/image";
import { useState } from "react";

interface FeaturedMediaProps {
  images: string | string[];
  alt: string;
}

/**
 * FeaturedMedia - Displays either a single image or a gallery carousel
 * - If `images` is a string or array with 1 item → renders single image
 * - If `images` is an array with 2+ items → renders gallery with navigation
 */
export default function FeaturedMedia({ images, alt }: FeaturedMediaProps) {
  // Normalize to array
  const imageArray = Array.isArray(images) ? images : [images];
  const isGallery = imageArray.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  };

  // Single image
  if (!isGallery) {
    return (
      <div className="relative aspect-3/2 w-full">
        <Image
          src={imageArray[0]}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Gallery with navigation
  return (
    <div>
      {/* Image */}
      <div className="relative aspect-3/2 w-full">
        <Image
          src={imageArray[currentIndex]}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      {/* Bottom bar: pagination left, arrows right */}
      <div className="flex items-center justify-between py-2 px-6 lg:px-0">
        {/* Pagination tracker */}
        <span className="text-sm text-gray-500">
          [{currentIndex + 1}/{imageArray.length}]
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
