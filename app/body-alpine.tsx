"use client";

import { useEffect } from "react";

/**
 * Client component that adds Alpine.js x-data attribute to body element
 * and ensures pegasus global object is initialized
 */
export default function BodyAlpine() {
  useEffect(() => {
    // Add x-data to body for Alpine.js (if not already set)
    if (document.body && !document.body.getAttribute("x-data")) {
      document.body.setAttribute("x-data", "paracelsusApp");
    }

    // Initialize pegasus global object if it doesn't exist
    if (typeof window !== "undefined") {
      if (!window.pegasus) {
        window.pegasus = {};
      }

      // Parallax scroll function - optimized to avoid forced reflows
      if (!window.pegasus.parallaxScroll) {
        window.pegasus.parallaxScroll = (elem: HTMLElement, speed = 0.1) => {
          if (!elem) return;
          if (window.innerWidth < 992) return;

          let ticking = false;
          let cachedWindowHeight = window.innerHeight;

          // Update cached window height on resize (debounced)
          let resizeTimeout: ReturnType<typeof setTimeout>;
          window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              cachedWindowHeight = window.innerHeight;
            }, 100);
          }, { passive: true });

          window.addEventListener(
            "scroll",
            () => {
              // Use requestAnimationFrame to batch DOM reads and avoid forced reflows
              if (!ticking) {
                requestAnimationFrame(() => {
                  const rect = elem.getBoundingClientRect();
                  const elementCenter = rect.top + rect.height / 2;
                  const distanceFromCenter = elementCenter - cachedWindowHeight / 2;
                  const translateY = distanceFromCenter * speed;

                  if (rect.top < cachedWindowHeight && rect.bottom > 0) {
                    elem.style.transform = `translateY(${translateY}px)`;
                  }
                  ticking = false;
                });
                ticking = true;
              }
            },
            { passive: true }
          );
        };
      }
    }
  }, []);

  return null;
}
