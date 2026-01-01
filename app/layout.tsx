import type { Metadata } from "next";
import Script from "next/script";
import CriticalCSS from "./critical-css";
import BodyAlpine from "./body-alpine";
import Header from "./components/Header";
import StructuredData from "./components/StructuredData";
// Note: All CSS is now inlined server-side via CriticalCSS component
// This prevents FOUC and eliminates render-blocking CSS requests
// globals.css content is inlined in critical-css.tsx

export const metadata: Metadata = {
  metadataBase: new URL('https://paracelsus-recovery.com'),
  title: {
    default: 'Paracelsus Recovery - Luxury Rehab Facilities',
    template: '%s | Paracelsus Recovery'
  },
  description: 'Paracelsus Recovery runs luxury rehab facilities in Switzerland. Pain is universal, but recovery has to be personal.',
  keywords: ['luxury rehab', 'addiction treatment', 'mental health treatment', 'eating disorder recovery', 'Switzerland rehabilitation', 'private rehab clinic'],
  authors: [{ name: 'Paracelsus Recovery' }],
  creator: 'Paracelsus Recovery',
  publisher: 'Paracelsus Recovery',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://paracelsus-recovery.com',
    languages: {
      'en-US': 'https://paracelsus-recovery.com',
      'de': 'https://paracelsus-recovery.com/de/',
      'fr': 'https://paracelsus-recovery.com/fr/',
      'es': 'https://paracelsus-recovery.com/es/',
      'it': 'https://paracelsus-recovery.com/it/',
      'ar': 'https://paracelsus-recovery.com/ar/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://paracelsus-recovery.com',
    siteName: 'Paracelsus Recovery',
    title: 'Paracelsus Recovery - Luxury Rehab Facilities',
    description: 'Paracelsus Recovery runs luxury rehab facilities in Switzerland. Pain is universal, but recovery has to be personal.',
    images: [
      {
        url: '/wp-content/uploads/2025/01/Paracelsus.webp',
        width: 1200,
        height: 630,
        alt: 'Paracelsus Recovery - Luxury Rehabilitation in Switzerland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paracelsus Recovery - Luxury Rehab Facilities',
    description: 'Paracelsus Recovery runs luxury rehab facilities in Switzerland. Pain is universal, but recovery has to be personal.',
    images: ['/wp-content/uploads/2025/01/Paracelsus.webp'],
  },
  verification: {
    google: 'lTAF7rbXgi8VUlXShPqhSGRt0gBSJ27XbEOgGRjQjhs',
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'theme-color': '#ffffff',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-US"
      dir="ltr"
      className="html home wp-singular page-template-default page page-id-62825 wp-theme-pegasus"
    >
      {/* CRITICAL: Render CSS in head to prevent FOUC */}
      <head>
        <CriticalCSS />
        <StructuredData />
      </head>
      <body 
        className="body-main modal-form scrolled" 
        x-data="paracelsusApp"
        suppressHydrationWarning
      >
        <BodyAlpine />
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
        {/* Lazy-load bundles when interactive components are needed */}
        {/* This reduces initial JS download by deferring until sliders/accordions are visible */}
        <Script
          id="lazy-bundle-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                let bundlesLoaded = false;
                
                const loadBundles = () => {
                  if (bundlesLoaded) return;
                  bundlesLoaded = true;
                  
                  // Load Alpine accordion bundle
                  const accordionScript = document.createElement('script');
                  accordionScript.src = '/wp-content/themes/pegasus/dist/alpine-accordion-only.js';
                  accordionScript.type = 'module';
                  document.body.appendChild(accordionScript);
                  
                  // Load main bundle after accordion
                  accordionScript.onload = () => {
                    const mainScript = document.createElement('script');
                    mainScript.src = '/wp-content/themes/pegasus/dist/BU6_YsVJ.js';
                    mainScript.type = 'module';
                    document.body.appendChild(mainScript);
                  };
                };
                
                // Load immediately if user scrolls or interacts
                const events = ['scroll', 'click', 'touchstart', 'mousemove'];
                const loadOnce = () => {
                  loadBundles();
                  events.forEach(e => window.removeEventListener(e, loadOnce));
                };
                events.forEach(e => window.addEventListener(e, loadOnce, { once: true, passive: true }));
                
                // Also load after 3 seconds as fallback (for LCP scoring)
                setTimeout(loadBundles, 3000);
                
                // Or load immediately if page is already scrolled
                if (window.scrollY > 100) loadBundles();
              })();
            `,
          }}
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
              
              // Parallax scroll function - optimized to avoid forced reflows
              window.pegasus.parallaxScroll = (elem, speed = 0.1) => {
                if (!elem) return;
                if (window.innerWidth < 992) return;
                
                let ticking = false;
                let cachedWindowHeight = window.innerHeight;
                
                // Update cached window height on resize
                let resizeTimeout;
                window.addEventListener('resize', () => {
                  clearTimeout(resizeTimeout);
                  resizeTimeout = setTimeout(() => { cachedWindowHeight = window.innerHeight; }, 100);
                }, { passive: true });
                
                window.addEventListener('scroll', () => {
                  // Use requestAnimationFrame to batch DOM reads and avoid forced reflows
                  if (!ticking) {
                    requestAnimationFrame(() => {
                      const rect = elem.getBoundingClientRect();
                      const elementCenter = rect.top + rect.height / 2;
                      const distanceFromCenter = elementCenter - (cachedWindowHeight / 2);
                      const translateY = (distanceFromCenter * speed);
                      
                      if (rect.top < cachedWindowHeight && rect.bottom > 0) {
                        elem.style.transform = \`translateY(\${translateY}px)\`;
                      }
                      ticking = false;
                    });
                    ticking = true;
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
