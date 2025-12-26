// Minimal Alpine bundle - Accordion + Essential Components + Slider Components
// This bundle replaces main.js to fix accordion without breaking Flickity sliders
// Includes Flickity and slider components to ensure they work correctly

import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';
import collapse from '@alpinejs/collapse';
import Flickity from 'flickity';
import { pegasus } from './global/01-pegasus.js';
// Import slider scripts - they will also register themselves, but we'll register them manually too
// to ensure they're available even if their listeners fire late
import '@PegasusTheme/blocks/TeamMemberSlider/script';
import '@PegasusTheme/blocks/QuoteSlider/script';
// Import Media component for TeamGridSlider
import Media from '@PegasusTheme/blocks/Media/script';

// Accordion Panel Component
class BaseAccordionPanel {
    panelOpen = false;
}

// Register Alpine plugins BEFORE components
Alpine.plugin(intersect);
Alpine.plugin(collapse);

// Register components via alpine:init (standard Alpine pattern)
document.addEventListener('alpine:init', () => {
    // Accordion Panel
    Alpine.data('accordionPanel', () => new BaseAccordionPanel());
    
    // ParacelsusApp (for body x-data)
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
    
    // Navigation
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
            this.$watch('activeMenuItem', () => this.activeSubMenuItem = false);
            this.lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                this.goingUp = currentScrollY < this.lastScrollY;
                this.lastScrollY = currentScrollY;
            });
            setTimeout(() => {
                this.navigationIn = true;
            }, 150);
        }
    }));
    
    // VideoBanner
    Alpine.data('videoBanner', () => ({
        init() {
            this.$nextTick(() => {
                const videoContainer = this.$refs.videoContainer;
                if (videoContainer) {
                    const video = videoContainer.querySelector('video');
                    if (video) {
                        video.muted = true;
                        video.play().catch(err => {
                            console.warn('Video autoplay failed:', err);
                        });
                    }
                }
            });
        }
    }));
    
    // Note: teamGridSlider and quoteSlider should be registered by their script imports
    // The scripts use their own alpine:init listeners which should fire when Alpine starts
});

// Expose Flickity globally for slider components
// This ensures Flickity is available when slider scripts initialize
window.Flickity = Flickity;

// Expose pegasus globally (already set by pegasus.js, but ensure it's available)
window.pegasus = pegasus;

// Expose Alpine globally
window.Alpine = Alpine;

// Ensure slider script imports have executed and attached their listeners
// before starting Alpine. Static imports should have completed by now.
// The slider scripts' alpine:init listeners will fire when Alpine.start() is called.

// Start Alpine (but allow interception by layout.tsx)
// The interceptor will handle the actual start timing
if (typeof window.__alpineStartIntercepted === 'undefined') {
    // Give a tiny delay to ensure all module imports have completed
    // and their alpine:init listeners are attached
    Promise.resolve().then(() => {
        Alpine.start();
    });
}

