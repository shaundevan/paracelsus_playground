"use client";

import { useEffect } from "react";

/**
 * HeadLinks component loads CSS files using <link> tags.
 * Uses original WordPress directory structure to preserve relative url() paths.
 * 
 * Files are in their original locations:
 * - /wp-includes/css/dist/block-library/style.min.css
 * - /wp-content/themes/pegasus/dist/assets/styles/DwoS2IZP.css
 * - /wp-content/siteground-optimizer-assets/siteground-optimizer-combined-css-c91c1f475ab21e8486c7ae5c09e7b9.css
 * 
 * This preserves relative paths like url(../fonts/...) and url(../images/...)
 * that reference sibling directories in the WordPress structure.
 */
export default function HeadLinks() {
  useEffect(() => {
    // CSS files using original WordPress paths - preserves relative url() resolution
    const cssFiles = [
      "/wp-includes/css/dist/block-library/style.min.css",
      "/wp-content/themes/pegasus/dist/assets/styles/DwoS2IZP.css",
      "/wp-content/siteground-optimizer-assets/siteground-optimizer-combined-css-c91c1f475ab21e8486c7ae5c09e7b9.css",
    ];

    const links: HTMLLinkElement[] = [];

    cssFiles.forEach((href) => {
      // Check if link already exists
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        return; // Already loaded
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      // Cleanup on unmount
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  return null;
}
