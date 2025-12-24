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
      <body className="body-main at-top modal-form" x-data="paracelsusApp">
        <BodyAlpine />
        <InlineStylesServer />
        <HeadLinks />
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"
          strategy="beforeInteractive"
        />
        <Script
          id="pegasus-components"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Load the compiled JS file that contains all component definitions
              // This must load before Alpine starts processing the DOM
              (function() {
                const script = document.createElement('script');
                script.src = '/wp-content/themes/pegasus/dist/CGBqs_Rr.js';
                script.async = false;
                script.defer = false;
                // Override Alpine.start() to prevent double initialization
                const originalStart = window.Alpine?.start;
                script.onload = function() {
                  // The compiled file will register components and start Alpine
                  // But we need to ensure it doesn't conflict with our setup
                  if (window.Alpine && typeof window.Alpine.start === 'function') {
                    // Only start if not already started
                    if (!document.body.hasAttribute('x-data')) {
                      window.Alpine.start();
                    }
                  }
                };
                document.head.appendChild(script);
              })();
            `,
          }}
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
              
              // Install Alpine.js plugins
              const installPlugins = () => {
                if (typeof Alpine === 'undefined' || !Alpine.plugin) return;
                
                // CDN versions expose plugins as window.AlpineIntersect and window.AlpineCollapse
                if (typeof window.AlpineIntersect !== 'undefined') {
                  Alpine.plugin(window.AlpineIntersect);
                }
                if (typeof window.AlpineCollapse !== 'undefined') {
                  Alpine.plugin(window.AlpineCollapse);
                }
              };
              
              // Register components immediately if Alpine is already loaded, otherwise wait for alpine:init
              const registerComponents = () => {
                // Install plugins first
                installPlugins();
                
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
                    
                    let lastScrollTime = Date.now();
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
              
              // Register components immediately if Alpine is available, otherwise wait for alpine:init
              if (typeof Alpine !== 'undefined' && Alpine.data) {
                registerComponents();
              } else {
                document.addEventListener('alpine:init', registerComponents);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
