import type { Metadata } from "next";
import Script from "next/script";
import HeadLinks from "./head-links";
import InlineStylesServer from "./inline-styles-server";
import BodyAlpine from "./body-alpine";
import "./globals.css";
import "../styles/wp/block-library.css";
import "../styles/wp/theme-base.css";
// Note: CSS files are loaded via <link> tags in HeadLinks component
// Using original WordPress paths to preserve relative url() resolution:
// - /wp-includes/css/dist/block-library/style.min.css
// - /wp-content/themes/pegasus/dist/assets/styles/DwoS2IZP.css
// This ensures fonts/images referenced with url(../fonts/...) resolve correctly

export const metadata: Metadata = {
  title: "Paracelsus Recovery",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-US"
      dir="ltr"
      className="html home wp-singular page-template-default page page-id-62825 wp-theme-pegasus"
    >
      <body className="body-main modal-form scrolled" x-data="paracelsusApp">
        {/* Step 1: Initialize pegasus global object FIRST */}
        <Script
          id="pegasus-global-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize pegasus global object
              window.pegasus = window.pegasus || {};
              
              // Parallax scroll function
              window.pegasus.parallaxScroll = (elem, speed = 0.1) => {
                if (!elem) return;
                if (window.innerWidth < 992) return;
                
                window.addEventListener('scroll', () => {
                  const rect = elem.getBoundingClientRect();
                  const windowHeight = window.innerHeight;
                  const elementCenter = rect.top + rect.height / 2;
                  const distanceFromCenter = elementCenter - (windowHeight / 2);
                  const translateY = (distanceFromCenter * speed);
                  
                  if (rect.top < windowHeight && rect.bottom > 0) {
                    elem.style.transform = \`translateY(\${translateY}px)\`;
                  }
                }, { passive: true });
              };
            `,
          }}
        />
        {/* Step 2: Load Alpine.js core - must load before plugins and components */}
        <Script
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        {/* Step 3: Load Alpine.js plugins */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        {/* Step 4: Install plugins IMMEDIATELY after they load */}
        <Script
          id="alpine-plugins-install"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Install Alpine.js plugins synchronously
              // This runs immediately after the plugin scripts load
              (function installPlugins() {
                // Wait for Alpine and plugins to be available
                const checkAndInstall = () => {
                  if (typeof Alpine !== 'undefined' && Alpine.plugin) {
                    // CDN versions expose plugins as window.AlpineIntersect and window.AlpineCollapse
                    if (typeof window.AlpineIntersect !== 'undefined') {
                      Alpine.plugin(window.AlpineIntersect);
                    }
                    if (typeof window.AlpineCollapse !== 'undefined') {
                      Alpine.plugin(window.AlpineCollapse);
                    }
                    return true;
                  }
                  return false;
                };
                
                // Try immediately
                if (!checkAndInstall()) {
                  // If not ready, wait a tick and try again
                  setTimeout(() => {
                    if (!checkAndInstall()) {
                      // Fallback: wait for alpine:init
                      document.addEventListener('alpine:init', checkAndInstall, { once: true });
                    }
                  }, 0);
                }
              })();
            `,
          }}
        />
        {/* Step 5: Load component definitions SYNCHRONOUSLY */}
        {/* This must load after Alpine and plugins are installed */}
        {/* Using beforeInteractive ensures it's injected into <head> and loads before page is interactive */}
        <Script
          src="/wp-content/themes/pegasus/dist/CGBqs_Rr.js"
          strategy="beforeInteractive"
        />
        <BodyAlpine />
        <InlineStylesServer />
        <HeadLinks />
        {children}
        <Script
          src="/wp-content/themes/pegasus/assets/scripts/global/02-lazy-load.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
