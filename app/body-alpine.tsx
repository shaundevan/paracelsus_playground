"use client";

import { useEffect } from "react";

/**
 * Client component that adds Alpine.js x-data attribute to body element
 * and ensures pegasus global object is initialized
 */
export default function BodyAlpine() {
  useEffect(() => {
    // Add x-data to body for Alpine.js
    if (document.body && !document.body.getAttribute("x-data")) {
      document.body.setAttribute("x-data", "paracelsusApp");
    }

    // Initialize pegasus global object if it doesn't exist
    if (typeof window !== "undefined") {
      window.pegasus = window.pegasus || {};

      // Parallax scroll function
      if (!window.pegasus.parallaxScroll) {
        window.pegasus.parallaxScroll = (elem: HTMLElement, speed = 0.1) => {
          if (!elem) return;
          if (window.innerWidth < 992) return;

          window.addEventListener(
            "scroll",
            () => {
              const rect = elem.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const elementCenter = rect.top + rect.height / 2;
              const distanceFromCenter = elementCenter - windowHeight / 2;
              const translateY = distanceFromCenter * speed;

              if (rect.top < windowHeight && rect.bottom > 0) {
                elem.style.transform = `translateY(${translateY}px)`;
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
