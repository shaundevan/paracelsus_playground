import Flickity from "flickity";
import pegasus from "../../assets/scripts/global/01-pegasus";

export default class ImageChangeTextSlider {
    image = "";

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
     * @var {int}
     */
    screenWidth = 0;

    /**
     * @var {object}
     *  
     */
    options = {};

    constructor(image) {
        this.image = image;
    }

    init() {        
        this.initSlider();
    }

    initSlider() {
        this.sliderContainer = this.$root.querySelector(".ImageChangeTextSlider__slider");
        if (!this.sliderContainer) return;
        
        // Check if Flickity is already initialized
        const existingFlickity = this.sliderContainer._flickity || this.sliderContainer.flickity;
        if (existingFlickity) {
            // Already initialized, just resize
            existingFlickity.resize();
            return;
        }
        
        this.slides = this.sliderContainer.querySelectorAll(".slide");
        if (!this.slides || this.slides.length === 0) return;
        
        this.screenWidth = window.innerWidth; // Changed from outerWidth

        // Temporarily reset slide positioning so Flickity can measure them
        // Only reset if slides are already absolutely positioned
        this.slides.forEach(slide => {
            if (slide && slide.style) {
                const currentPosition = window.getComputedStyle(slide).position;
                // Only reset if already absolutely positioned
                if (currentPosition === 'absolute') {
                    slide.style.position = 'relative';
                    slide.style.left = 'auto';
                    slide.style.transform = 'none';
                    slide.style.width = 'auto';
                }
            }
        });

        this.options = {
            cellAlign: "left",
            contain: true,
            wrapAround: false,
            prevNextButtons: false,
            pageDots: false,
            draggable: true,
            percentPosition: false,
            freeScroll: false,
            resize: false,
            on: {
                change: (i) => {
                    if (this.slider && this.slider.selectedElement) {
                        this.slider.selectedElement.click();
                    }
                },
            },
        };

        (window.outerWidth > 768) ? this.options.draggable = false : this.options.draggable = true;
        
        // Use global Flickity (exposed from main.js)
        // This ensures we use the same Flickity instance that's available globally
        if (typeof window.Flickity === 'undefined') {
            console.error('Flickity is not available globally. Make sure it is exposed in main.js');
            return;
        }
        
        // Initialize Flickity - it will now measure and position slides correctly
        this.slider = new window.Flickity(this.sliderContainer, this.options);
        
        // Flickity will handle positioning, so we don't need to restore original styles


        this.slider.on('ready', () => this.slider.resize());

        let resizeTimeout;
        pegasus.onResizeFinished(() => {
            // Clear any existing timeout
            clearTimeout(resizeTimeout);
            
            // Set a new timeout
            resizeTimeout = setTimeout(() => {
                let newWidth = window.innerWidth; // Changed from outerWidth
                // Only resize if the width actually changed
                if (Math.abs(newWidth - this.screenWidth) > 10) { // Added threshold
                    if(this.slider) {
                        this.slider.destroy();
                    }
                    (window.outerWidth > 768) ? this.options.draggable = false : this.options.draggable = true;
                    this.screenWidth = newWidth;
                    this.slider = new Flickity(this.sliderContainer, this.options);
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
}

document.addEventListener("alpine:init", () => {
    Alpine.data(
        "imageChangeTextSlider",
        (image) => new ImageChangeTextSlider(image)
    );
});
