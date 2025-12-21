import Flickity from "flickity";
import pegasus from "../../assets/scripts/global/01-pegasus";

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

        this.slider.on("scroll", (e) => {
            this.updateProgressBar();
        });

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

document.addEventListener("alpine:init", () => {
    Alpine.data("quoteSlider", (autoplay, infinite) => new QuoteSlider(autoplay, infinite));
});
