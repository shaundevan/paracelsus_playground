import Flickity from "flickity";

// Use window.pegasus instead of import to avoid Vite tree-shaking issues
const pegasus = window.pegasus;

class QuoteSlider
{
    /**
     * @var {boolean}
     */
    autoplay = false;

    /**
     * @var {boolean}
     */
    infinite = false;

    /**
     * @var {array}
     */
    slides = null;

    /**
     * @var {HTMLElement}
     */
    slider = null;

    /**
     * @var {HTMLElement}
     */
    sliderContainer = null;

    /**
     * @var {number}
     */
    screenWidth = 0;


    inView = false;

    constructor(autoplay, infinite) {
        this.autoplay = autoplay || false;
        this.infinite = infinite || false;
    };

    /**
     * init
     *
     * @return void
     */
    init() {
        this.initSlider();
        this.updateProgressBar();
    }

    initSlider() {
        this.sliderContainer = this.$refs.slider;
        if (!this.sliderContainer) return;
        
        // Check if Flickity is already initialized to prevent double-init
        const existingFlickity = Flickity.data(this.sliderContainer);
        if (existingFlickity) {
            this.slider = existingFlickity;
            return; // Already initialized, skip
        }
        
        // Also check for pre-existing Flickity HTML markup (from cloned HTML)
        // and clean it up before re-initializing
        if (this.sliderContainer.classList.contains('flickity-enabled')) {
            // Remove Flickity classes and reset structure
            this.sliderContainer.classList.remove('flickity-enabled', 'is-draggable');
            const viewport = this.sliderContainer.querySelector('.flickity-viewport');
            const flickitySlider = this.sliderContainer.querySelector('.flickity-slider');
            if (viewport && flickitySlider) {
                // Move slides back to container and remove Flickity wrappers
                const slides = flickitySlider.querySelectorAll('.slide');
                slides.forEach(slide => {
                    slide.style.position = '';
                    slide.style.left = '';
                    slide.style.transform = '';
                    this.sliderContainer.appendChild(slide);
                });
                viewport.remove();
            }
        }
        
        this.slides = this.sliderContainer.querySelectorAll(".slide");
        this.screenWidth = window.innerWidth; // Changed from outerWidth

        let options = {
            cellAlign: "left",
            contain: true,
            wrapAround: this.infinite,
            prevNextButtons: false,
            pageDots: false,
            draggable: true,
            resize: false
        };

        if (this.autoplay && this.autoplay > 0) {
            options.autoPlay = this.autoplay * 1000;
        }
        this.slider = new Flickity(this.sliderContainer, options);
        
        // Set --slide-width CSS variable for proper slide sizing (2 visible slides)
        const slideWidth = 50; // 50% for 2 visible slides
        this.slides.forEach(slide => {
            slide.style.setProperty('--slide-width', `${slideWidth}%`);
        });

        this.slider.on("scroll", (e) => {
            this.updateProgressBar();
        });

        this.slider.on('ready', () => this.slider.resize());
        
        // Fix for layout issues on initial load - resize after fonts/images load
        if (document.readyState === 'complete') {
            this.slider.resize();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.slider.resize(), 100);
            }, { once: true });
        }

        let resizeTimeout;
        pegasus.onResizeFinished(() => {
            // Clear any existing timeout
            clearTimeout(resizeTimeout);
            
            // Set a new timeout
            resizeTimeout = setTimeout(() => {
                let newWidth = window.innerWidth; // Changed from outerWidth
                // Only resize if the width actually changed
                if (Math.abs(newWidth - this.screenWidth) > 10) { // Added threshold
                    this.screenWidth = newWidth;
                    this.slider.resize();
                }
            }, 150); // Added debounce delay
        });

        // Improve touch handling for iOS
        if ((/iPad|iPhone|iPod/.test(navigator.platform) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))) {
            this.sliderContainer.style.touchAction = 'pan-y pinch-zoom';
            document.body.style.overscrollBehaviorX = 'none';
        }

    }

    /**
     * updateProgressBar
     *
     * @return void
     */
    updateProgressBar() {
        const progressBar = this.$refs.progressBar;
        if (!progressBar) return;

        const progress = ((this.slider.selectedIndex + 1) / this.slider.slides.length) * 100;

        progressBar.style.width = progress + "%";
    };

    nextSlide() {
        this.slider.next();
    }

    previousSlide() {
        this.slider.previous();
    }
}

// Register component - use window.Alpine to ensure we use the global instance
const registerQuoteSlider = () => {
    if (window.Alpine) {
        window.Alpine.data("quoteSlider", (autoplay, infinite) => new QuoteSlider(autoplay, infinite));
    }
};

// Try immediate registration, also listen for alpine:init
registerQuoteSlider();
document.addEventListener("alpine:init", registerQuoteSlider);

// Named export for Vite inclusion
export { QuoteSlider };
