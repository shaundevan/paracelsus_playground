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
        this.slides = this.sliderContainer.querySelectorAll(".slide");
        this.screenWidth = window.innerWidth; // Changed from outerWidth

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
                    this.slider.selectedElement.click();
                },
            },
        };

        (window.outerWidth > 768) ? this.options.draggable = false : this.options.draggable = true;
        this.slider = new Flickity(this.sliderContainer, this.options);


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
