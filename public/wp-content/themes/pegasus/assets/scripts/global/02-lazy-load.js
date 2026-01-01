class PegasusImmediateLoader {
    constructor() {
        if (window.pegasusLazyLoader) {
            return window.pegasusLazyLoader;
        }

        window.pegasusLazyLoader = this;

        this.init();
    }

    init() {
        // Load all images immediately
        this.loadAllImages();
    }

    loadAllImages() {
        // Load all images with data-src
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));

        // Load all source elements in picture
        const sources = document.querySelectorAll('source[data-srcset]');
        sources.forEach(source => this.loadSource(source));
    }

    loadSource(source) {
        if (source.dataset.srcset) {
            source.srcset = source.dataset.srcset;
            delete source.dataset.srcset;
        }
        if (source.dataset.sizes) {
            source.sizes = source.dataset.sizes;
            delete source.dataset.sizes;
        }
    }

    loadImage(img) {
        const wrapper = img.closest('.pegasus-lazy-wrapper');
        const picture = img.closest('picture');

        try {
            // First load sources in picture if exists
            if (picture) {
                const sources = picture.querySelectorAll('source[data-srcset]');
                sources.forEach(source => this.loadSource(source));
            }

            // Load srcset if exists
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                delete img.dataset.srcset;
            }

            // Load sizes if exists
            if (img.dataset.sizes) {
                img.sizes = img.dataset.sizes;
                delete img.dataset.sizes;
            }

            // Load src
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }

            // Mark wrapper as loaded
            if (wrapper) {
                wrapper.classList.add('is-loaded');
            }

        } catch (error) {
            console.warn('Image loading error:', error);

            // Fallback - load anyway
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
            if (img.dataset.sizes) {
                img.sizes = img.dataset.sizes;
            }
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            if (wrapper) {
                wrapper.classList.add('is-loaded');
            }
        }
    }
}

// Initialize immediately after DOM loads
const initLazyLoader = () => {
    new PegasusImmediateLoader();
    
    // Additional initialization for dynamically added images
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's an image with data-src
                        if (node.matches && node.matches('img[data-src]')) {
                            if (window.pegasusLazyLoader) {
                                window.pegasusLazyLoader.loadImage(node);
                            }
                        }
                        // Check if it contains images with data-src
                        const images = node.querySelectorAll && node.querySelectorAll('img[data-src]');
                        if (images && images.length > 0 && window.pegasusLazyLoader) {
                            images.forEach(img => window.pegasusLazyLoader.loadImage(img));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

// Check if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoader);
} else {
    // DOM is already loaded, initialize immediately
    initLazyLoader();
}

/**
 * Preload images in upcoming sections before user scrolls to them.
 * Uses Intersection Observer with rootMargin to detect when user approaches a section.
 */
class SectionPreloader {
    constructor() {
        this.preloadedSections = new Set();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupObservers());
        } else {
            this.setupObservers();
        }
    }

    setupObservers() {
        // Team Grid images are below the fold - let browser handle lazy loading
        // Do NOT preload them early as it wastes 9MB+ of bandwidth and hurts FCP
        // Native loading="lazy" will load them when user scrolls near (~200px)
        
        const teamGridSection = document.querySelector('.Team__Grid-slider');
        if (teamGridSection) {
            // IMMEDIATELY fix sizes attribute to prevent oversized image downloads
            // This must happen before browser starts loading lazy images
            this.preloadSectionImages(teamGridSection);
            
            // Observe for when section comes into view (500px margin)
            this.observeSection(teamGridSection, '500px');
        }
    }

    observeSection(section, margin = '200px') {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.preloadedSections.has(section)) {
                        this.preloadedSections.add(section);
                        this.preloadSectionImages(section);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: margin, // Trigger before section is visible
                threshold: 0
            }
        );

        observer.observe(section);
    }

    preloadSectionImages(section) {
        // DO NOT change loading="lazy" to "eager" - this forces immediate download
        // Instead, fix the sizes attribute so browser loads correctly sized images
        
        // Team Grid images are displayed at ~468x702 (25vw on desktop, 50vw on tablet)
        // Fix the sizes attribute to prevent loading oversized images
        const correctSizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw';
        
        const images = section.querySelectorAll('img');
        images.forEach(img => {
            // Fix oversized images by setting correct sizes
            if (img.sizes && img.sizes.includes('1536px')) {
                img.sizes = correctSizes;
            }
        });
        
        // Also fix source elements in pictures
        const sources = section.querySelectorAll('source');
        sources.forEach(source => {
            if (source.sizes && source.sizes.includes('1536px')) {
                source.sizes = correctSizes;
            }
        });
    }
}

// Initialize section preloader
new SectionPreloader();