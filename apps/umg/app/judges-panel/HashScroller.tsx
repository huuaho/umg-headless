"use client";

import { useEffect } from "react";

export function HashScroller() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Wait for DOM to be fully rendered after hydration
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
