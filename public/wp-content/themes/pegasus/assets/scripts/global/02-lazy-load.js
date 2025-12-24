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