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
      <body 
        className="body-main modal-form scrolled" 
        x-data="paracelsusApp"
        suppressHydrationWarning
      >
        <BodyAlpine />
        <InlineStylesServer />
        <HeadLinks />
        {children}
        {/* CRITICAL: Intercept Alpine.start() BEFORE bundle loads */}
        {/* This ensures components register before Alpine evaluates x-data expressions */}
        <Script
          id="alpine-interceptor"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__pegasusComponentsReady=false;window.__alpineStartQueue=[];Object.defineProperty(window,'Alpine',{get:function(){return window.__alpineInstance;},set:function(value){window.__alpineInstance=value;if(value&&typeof value.start==='function'&&!value.__startIntercepted){var originalStart=value.start.bind(value);value.__startIntercepted=true;value.start=function(){window.__alpineStartQueue.push(originalStart);var tryStart=function(){if(window.__pegasusComponentsReady&&window.__alpineStartQueue.length>0){var startFn=window.__alpineStartQueue.shift();startFn();if(document.body){document.body.setAttribute('data-alpine-started','true');}}else if(!window.__pegasusComponentsReady){setTimeout(tryStart,50);}};tryStart();};}},configurable:true});})();`,
          }}
        />
        {/* Load component bundle - includes Alpine, plugins, and all components */}
        <Script
          id="pegasus-components"
          strategy="beforeInteractive"
          src="/wp-content/themes/pegasus/dist/C-nlNhNL.js"
        />
        {/* Handle bundle load completion */}
        <Script
          id="pegasus-components-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for bundle to load and mark components as ready
              (function() {
                const checkBundleLoaded = () => {
                  // Check if Alpine is available (means bundle loaded)
                  if (window.Alpine && typeof window.Alpine.data === 'function') {
                    // Mark components as ready after bundle loads
                    // The bundle's eager imports should have registered all components
                    // Give a small delay to ensure all alpine:init listeners fired
                    setTimeout(() => {
                      window.__pegasusComponentsReady = true;
                      
                      // Execute any queued Alpine.start() calls
                      const queue = window.__alpineStartQueue;
                      if (queue && queue.length > 0) {
                        queue.forEach((startFn) => {
                          try {
                            startFn();
                          } catch (e) {
                            console.error('Error starting Alpine:', e);
                          }
                        });
                        window.__alpineStartQueue = [];
                        if (document.body) {
                          document.body.setAttribute('data-alpine-started', 'true');
                        }
                      }
                      
                      // Ensure custom components are registered
                      if (typeof window.__startAlpine === 'function') {
                        window.__startAlpine();
                      }
                    }, 100);
                  } else {
                    // Bundle not loaded yet, check again
                    setTimeout(checkBundleLoaded, 50);
                  }
                };
                
                // Start checking once DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', checkBundleLoaded);
                } else {
                  checkBundleLoaded();
                }
              })();
            `,
          }}
        />
        <Script
          src="/wp-content/themes/pegasus/assets/scripts/global/02-lazy-load.js"
          strategy="afterInteractive"
        />
        <Script
          id="alpine-init"
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
              
              // Register Alpine components
              const registerComponents = () => {
                if (typeof Alpine === 'undefined' || !Alpine.data) {
                  console.warn('Alpine.js not available for component registration');
                  return;
                }
                
                // ParacelsusApp - manages global app state (atTop, goingUp, etc.)
                Alpine.data('paracelsusApp', () => ({
                  atTop: true,
                  nearTop: true,
                  goingUp: false,
                  activeMenuItem: false,
                  langSwitcherOpen: false,
                  stationaryTimeout: null,
                  pageSwitcherName: false,
                  pageSwitcherLabel: false,
                  init() {
                    let prevScrollTop = 0;
                    let scrollFrame;
                    const scrollThrottleDelay = 100;
                    let lastScrollTime = Date.now();
                    
                    const handleScroll = () => {
                      if (scrollFrame) {
                        cancelAnimationFrame(scrollFrame);
                      }
                      
                      scrollFrame = requestAnimationFrame(() => {
                        const now = Date.now();
                        if (now - lastScrollTime < scrollThrottleDelay) return;
                        lastScrollTime = now;
                        
                        const scrollTop = Math.max(0, window.pageYOffset || document.documentElement.scrollTop);
                        const threshold = 20;
                        
                        if (Math.abs(scrollTop - prevScrollTop) > threshold) {
                          this.goingUp = scrollTop < prevScrollTop;
                          prevScrollTop = scrollTop;
                        }
                      });
                    };
                    
                    window.addEventListener('scroll', handleScroll, { passive: true });
                  }
                }));
                
                Alpine.data('navigation', () => ({
                  activeMenuItem: false,
                  open: false,
                  openSearchForm: false,
                  activeSubMenuItem: false,
                  navigationIn: true,
                  atTop: true,
                  nearTop: true,
                  goingUp: false,
                  languagePromptOpen: false,
                  lastScrollY: 0,
                  init() {
                    this.lastScrollY = window.scrollY;
                    window.addEventListener('scroll', () => {
                      const currentScrollY = window.scrollY;
                      this.goingUp = currentScrollY < this.lastScrollY;
                      this.lastScrollY = currentScrollY;
                    });
                  }
                }));
                
                Alpine.data('videoBanner', () => ({
                  init() {
                    // Ensure video autoplays with muted attribute
                    this.$nextTick(() => {
                      const videoContainer = this.$refs.videoContainer;
                      if (videoContainer) {
                        const video = videoContainer.querySelector('video');
                        if (video) {
                          // Ensure video is muted for autoplay
                          video.muted = true;
                          // Try to play the video
                          video.play().catch(err => {
                            console.warn('Video autoplay failed:', err);
                          });
                        }
                      }
                    });
                  }
                }));
              };
              
              // Define the Alpine start function that will be called after bundle is ready
              window.__startAlpine = function() {
                // Register custom components (paracelsusApp, navigation, videoBanner)
                registerComponents();
                
                // Add :class binding to body for dynamic class management
                // Delay until after React hydration to avoid hydration mismatch warnings
                const addBodyClassBinding = () => {
                  if (document.body) {
                    document.body.setAttribute(':class', "(atTop ? 'at-top' : 'scrolled') + (activeMenuItem ? ' overflow-hidden' : '')");
                  }
                };
                
                // Wait for React to finish hydrating before adding :class attribute
                // Use requestIdleCallback if available, otherwise setTimeout
                if (typeof requestIdleCallback !== 'undefined') {
                  requestIdleCallback(addBodyClassBinding, { timeout: 1000 });
                } else {
                  setTimeout(addBodyClassBinding, 100);
                }
                
                // Start Alpine if it hasn't started yet
                // Note: The bundle may have already started Alpine, so check first
                if (window.Alpine && typeof window.Alpine.start === 'function') {
                  // Check if Alpine has already started
                  if (!document.body.hasAttribute('data-alpine-started')) {
                    window.Alpine.start();
                    document.body.setAttribute('data-alpine-started', 'true');
                  }
                }
              };
              
              // Listen for alpine:init to register our custom components
              document.addEventListener('alpine:init', () => {
                registerComponents();
              }, { once: true });
            `,
          }}
        />
      </body>
    </html>
  );
}
