"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface FeaturedMediaProps {
  images: string | string[];
  alt: string;
}

/**
 * FeaturedMedia - Displays either a single image or a gallery carousel
 * - If `images` is a string or array with 1 item → renders single image
 * - If `images` is an array with 2+ items → renders gallery with navigation
 * - Clicking any image opens a fullscreen lightbox with dark overlay
 */
export default function FeaturedMedia({ images, alt }: FeaturedMediaProps) {
  // Normalize to array
  const imageArray = Array.isArray(images) ? images : [images];
  const isGallery = imageArray.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxLoading, setLightboxLoading] = useState(true);
  const [inlineLoading, setInlineLoading] = useState(false);

  const goToPrevious = useCallback(() => {
    setLightboxLoading(true);
    setInlineLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  }, [imageArray.length]);

  const goToNext = useCallback(() => {
    setLightboxLoading(true);
    setInlineLoading(true);
    setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  }, [imageArray.length]);

  // Keyboard navigation + close on Escape
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (isGallery && e.key === "ArrowLeft") goToPrevious();
      if (isGallery && e.key === "ArrowRight") goToNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, isGallery, goToPrevious, goToNext]);

  const openLightbox = () => {
    setLightboxLoading(true);
    setLightboxOpen(true);
  };

  // Lightbox overlay
  const lightbox = lightboxOpen && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={() => setLightboxOpen(false)}
    >
      {/* Close button */}
      <button
        onClick={() => setLightboxOpen(false)}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close lightbox"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous arrow (gallery only) */}
      {isGallery && (
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          className="absolute left-4 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[85vh] w-full h-full pointer-events-none">

        {lightboxLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={imageArray[currentIndex]}
          alt={alt}
          fill
          className={`object-contain transition-opacity duration-300 ${lightboxLoading ? "opacity-0" : "opacity-100"}`}
          sizes="90vw"
          onLoad={() => setLightboxLoading(false)}
        />
      </div>

      {/* Next arrow (gallery only) */}
      {isGallery && (
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-4 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Pagination (gallery only) */}
      {isGallery && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
          [{currentIndex + 1}/{imageArray.length}]
        </span>
      )}
    </div>
  );

  // Single image
  if (!isGallery) {
    return (
      <>
        <div className="relative aspect-3/2 w-full cursor-zoom-in" onClick={openLightbox}>
          <Image
            src={imageArray[0]}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
        {lightbox}
      </>
    );
  }

  // Gallery with navigation
  return (
    <>
      <div>
        {/* Image */}
        <div className="relative aspect-3/2 w-full cursor-zoom-in" onClick={openLightbox}>
          {inlineLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={imageArray[currentIndex]}
            alt={alt}
            fill
            className={`object-cover transition-opacity duration-300 ${inlineLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setInlineLoading(false)}
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
      {lightbox}
    </>
  );
}
