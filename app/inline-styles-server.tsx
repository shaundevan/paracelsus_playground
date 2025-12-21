"use client";

import { useEffect } from "react";

/**
 * Client component that fetches and injects inline CSS blocks from WordPress.
 * Fetches CSS from API route that extracts them from homepage.outer.html
 * 
 * IMPORTANT: Fonts must be injected BEFORE the page renders to avoid FOUT (Flash of Unstyled Text).
 * This component runs immediately on mount to inject styles as early as possible.
 */
export default function InlineStylesServer() {
  useEffect(() => {
    // Inject styles immediately - don't wait for React hydration
    const injectStyles = () => {
      fetch("/api/inline-css")
        .then((res) => res.json())
        .then((data) => {
        const styles = [
          {
            id: "wp-fonts-local",
            className: "wp-fonts-local",
            content: data.fontStyles,
          },
          { id: "global-styles-inline-css", content: data.globalStyles },
          {
            id: "block-style-variation-styles-inline-css",
            content: data.blockStyleVariations,
          },
          {
            id: "core-block-supports-inline-css",
            content: data.coreBlockSupports,
          },
          // WordPress block inline styles
          { id: "wp-img-auto-sizes-contain-inline-css", content: data.wpImgAutoSizes },
          { id: "wp-block-button-inline-css", content: data.wpBlockButton },
          { id: "wp-block-heading-inline-css", content: data.wpBlockHeading },
          { id: "wp-block-buttons-inline-css", content: data.wpBlockButtons },
          { id: "wp-block-columns-inline-css", content: data.wpBlockColumns },
          { id: "wp-block-group-inline-css", content: data.wpBlockGroup },
          { id: "wp-block-paragraph-inline-css", content: data.wpBlockParagraph },
          { id: "wp-block-spacer-inline-css", content: data.wpBlockSpacer },
        ];

          styles.forEach(({ id, content, className }) => {
            if (!content) return;

            // Check if style already exists
            const existing = document.getElementById(id);
            if (existing) {
              return; // Already loaded
            }

            const style = document.createElement("style");
            style.id = id;
            if (className) {
              style.className = className;
            }
            style.textContent = content;
            // Insert at the beginning of head to ensure fonts load early
            const head = document.head || document.getElementsByTagName("head")[0];
            head.insertBefore(style, head.firstChild);
          });

          // Force font reload by triggering a repaint
          // This helps ensure fonts are applied even if they were cached
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
              // Fonts are loaded, trigger a repaint
              document.body.style.display = "none";
              // Force reflow
              void document.body.offsetHeight;
              document.body.style.display = "";
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load inline styles:", err);
        });
    };

    // Run immediately
    injectStyles();
  }, []);

  return null;
}
