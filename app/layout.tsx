import type { Metadata } from "next";
import Script from "next/script";
import HeadLinks from "./head-links";
import InlineStylesServer from "./inline-styles-server";
import BodyAlpine from "./body-alpine";
import Header from "./components/Header";
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
        <Header />
        {children}
        {/* CRITICAL: Intercept Alpine.start() BEFORE bundle loads */}
        {/* This ensures components register before Alpine evaluates x-data expressions */}
        <Script
          id="alpine-interceptor"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__pegasusComponentsReady=false;window.__alpineStartQueue=[];window.__alpineHasStarted=false;Object.defineProperty(window,'Alpine',{get:function(){return window.__alpineInstance;},set:function(value){window.__alpineInstance=value;if(value&&typeof value.start==='function'&&!value.__startIntercepted){var originalStart=value.start.bind(value);value.__startIntercepted=true;value.start=function(){if(window.__alpineHasStarted){console.warn('[Alpine] Prevented duplicate Alpine.start() call');return;}window.__alpineStartQueue.push(originalStart);var tryStart=function(){if(window.__pegasusComponentsReady&&window.__alpineStartQueue.length>0&&!window.__alpineHasStarted){var startFn=window.__alpineStartQueue.shift();window.__alpineHasStarted=true;startFn();if(document.body){document.body.setAttribute('data-alpine-started','true');}}else if(!window.__pegasusComponentsReady&&!window.__alpineHasStarted){setTimeout(tryStart,50);}};tryStart();};}},configurable:true});})();`,
          }}
        />
        {/* Load NEW minimal bundle - Alpine + Accordion + Slider Components */}
        {/* This replaces DqtS7NQX.js to fix accordion without breaking Flickity sliders */}
        {/* Includes Flickity and slider components in the bundle */}
        <Script
          id="pegasus-components"
          strategy="afterInteractive"
          src="/wp-content/themes/pegasus/dist/alpine-accordion-only.js"
          type="module"
        />
        {/* Main bundle with all Alpine components (IconCarousel, imageChangeTextSlider, etc.) */}
        <Script
          id="pegasus-main-bundle"
          strategy="afterInteractive"
          src="/wp-content/themes/pegasus/dist/BU6_YsVJ.js"
          type="module"
        />
        {/* Handle bundle load completion */}
        <Script
          id="pegasus-components-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for bundle to load and verify components are ready
              (function() {
                const MAX_WAIT_TIME = 5000; // Maximum 5 seconds wait (ES modules can take longer)
                const CHECK_INTERVAL = 50; // Check every 50ms
                let startTime = Date.now();
                let bundleReadyReceived = false;
                
                // Listen for custom event from bundle
                window.addEventListener('pegasus:bundle-ready', function() {
                  bundleReadyReceived = true;
                  // Immediately proceed when event received
                  proceedWithAlpine();
                });
                
                const verifyComponentsReady = () => {
                  // Check if bundle components have loaded (signaled by main.js)
                  // Also check for Alpine and Flickity availability
                  return (window.__bundleComponentsLoaded || bundleReadyReceived) && 
                         window.Alpine && 
                         typeof window.Flickity === 'function';
                };
                
                const proceedWithAlpine = () => {
                  if (window.__pegasusComponentsReady) return; // Already processed
                  if (!verifyComponentsReady()) return; // Not ready yet
                  
                  window.__pegasusComponentsReady = true;
                  
                  // Execute any queued Alpine.start() calls
                  const queue = window.__alpineStartQueue;
                  if (queue && queue.length > 0 && !window.__alpineHasStarted) {
                    const startFn = queue.shift();
                    try {
                      window.__alpineHasStarted = true;
                      startFn();
                    } catch (e) {
                      console.error('Error starting Alpine:', e);
                    }
                    if (document.body) {
                      document.body.setAttribute('data-alpine-started', 'true');
                    }
                  }
                  
                  // Also try the registered start function
                  if (typeof window.__startAlpine === 'function') {
                    window.__startAlpine();
                  }
                };
                
                const checkBundleLoaded = () => {
                  const elapsed = Date.now() - startTime;
                  
                  // Try to proceed with Alpine
                  if (verifyComponentsReady()) {
                    proceedWithAlpine();
                  } else if (elapsed < MAX_WAIT_TIME) {
                    // Not ready yet, keep polling
                    setTimeout(checkBundleLoaded, CHECK_INTERVAL);
                  } else {
                    // Timeout reached - force proceed anyway
                    console.warn('[Timing] Bundle timeout reached, forcing Alpine start');
                    window.__pegasusComponentsReady = true;
                    
                    // Execute queued Alpine.start()
                    const queue = window.__alpineStartQueue;
                    if (queue && queue.length > 0 && !window.__alpineHasStarted) {
                      const startFn = queue.shift();
                      try {
                        window.__alpineHasStarted = true;
                        startFn();
                      } catch (e) {
                        console.error('Error starting Alpine:', e);
                      }
                      if (document.body) {
                        document.body.setAttribute('data-alpine-started', 'true');
                      }
                    }
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
              
              // Register Alpine components (only fallbacks - bundle handles primary registration)
              // Note: paracelsusApp and navigation are registered by bundle via alpine:init
              // We only register fallbacks here if bundle registration fails
              const registerComponents = () => {
                if (typeof Alpine === 'undefined' || !Alpine.data) {
                  console.warn('Alpine.js not available for component registration');
                  return;
                }
                
                // FALLBACK: Only register if bundle didn't register it
                // ParacelsusApp - bundle registers this, but we check as fallback
                if (typeof Alpine.data('paracelsusApp') !== 'function') {
                  console.warn('[Fallback] Registering paracelsusApp - bundle registration may have failed');
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
                }
                
                // FALLBACK: Only register if bundle didn't register it
                // Navigation - bundle registers this, but we check as fallback
                if (typeof Alpine.data('navigation') !== 'function') {
                  console.warn('[Fallback] Registering navigation - bundle registration may have failed');
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
                }
                
                // CRITICAL FIX: Register accordionPanel as fallback
                // The bundle should register this, but timing issues may prevent it
                if (typeof Alpine.data('accordionPanel') !== 'function') {
                  console.warn('[Fallback] Registering accordionPanel - bundle registration may have failed');
                  Alpine.data('accordionPanel', () => ({
                    panelOpen: false
                  }));
                }
                
                // VideoBanner - register if not in bundle
                if (typeof Alpine.data('videoBanner') !== 'function') {
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
                }
              };
              
              // Define the Alpine start function that will be called after bundle is ready
              window.__startAlpine = function() {
                // Register fallback components (only if bundle didn't register them)
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
                  // Check if Alpine has already started using global flag
                  if (!window.__alpineHasStarted && !document.body.hasAttribute('data-alpine-started')) {
                    window.Alpine.start();
                    // Flag is set by the interceptor, but set it here too as a safeguard
                    window.__alpineHasStarted = true;
                    document.body.setAttribute('data-alpine-started', 'true');
                  }
                }
              };
              
              // CRITICAL: Attach alpine:init listener EARLY (before bundle loads)
              // This ensures we catch the alpine:init event when Alpine.start() is called
              // The bundle's components also use alpine:init, so we need to be ready
              document.addEventListener('alpine:init', () => {
                // Register fallback components when alpine:init fires
                // This ensures components are registered even if bundle timing is off
                registerComponents();
              }, { once: true });
              
              // Also register components immediately if Alpine is already available
              // This handles cases where Alpine loads before this script runs
              if (typeof window.Alpine !== 'undefined' && typeof window.Alpine.data === 'function') {
                registerComponents();
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
