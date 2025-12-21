import BaseCarousel from "@PegasusCore/pegasus-one-carousel/src/script";

class Carousel extends BaseCarousel {
    /**
     * @var {Boolean}
     */
    smoothAutoplay = false;

    /**
     * @var {Boolean}
     */
    isPaused = false;

    /**
     * @var {string}
     */
    direction = "right";

    /**
     * constructor
     * @var {Boolean}
     * @var {Number}
     * @var {Boolean}
     * @var {String}
     */
    constructor(
        fade,
        overflow,
        autoplay,
        infinite,
        align = "left",
        slidesInView = 1,
        preview = false,
        smoothAutoplay = false,
        direction = "right"
    ) {
        super();
        this.fade = fade;
        this.overflow = overflow;
        this.autoplay = parseInt(autoplay * 1000);
        this.infinite = infinite;
        this.align = align;
        this.slidesInView = Math.ceil(slidesInView);
        this.preview = preview;
        this.smoothAutoplay = smoothAutoplay;
        this.direction = direction;
    }

    init() {
        super.init();

        console.log('smooth', this.smoothAutoplay);

        if (this.smoothAutoplay && !this.preview) {
            this.initSmoothAutoplay();
            this.carousel.removeEventListener("mousedown", this.onDragStart);
            this.carousel.removeEventListener("touchstart", this.onDragStart);
        }
    }

    initSmoothAutoplay() {
        const tickerSpeed = this.direction === "right" ? 0.5 : -0.5;

        this.carousel.classList.add("dragging");

        const update = () => {
            if (!this.isPaused) {
                if (this.slides.length) {
                    this.currentTranslate += tickerSpeed;

                    this.carousel.style.transform = `translateX(${this.currentTranslate}px)`;

                    this.currentSlide = this.getClosestSlideSmoothScroll(
                        this.currentTranslate
                    );

                    this.handleInfiniteScroll();
                }
                window.requestAnimationFrame(update);
            }
        };

        update();


        const pause = () => {
            this.isPaused = true;
        };
        const play = () => {
            if (this.isPaused) {
                this.isPaused = false;
                window.requestAnimationFrame(update);
            }
        };

        this.carouselWrapper.addEventListener("mouseenter", pause, false);
        this.carouselWrapper.addEventListener("focusin", pause, false);
        this.carouselWrapper.addEventListener("mouseleave", play, false);
        this.carouselWrapper.addEventListener("focusout", play, false);
    }

    /**
     * Determine the index of the slide whose left edge aligns with the left edge of the slider
     * @param {Number} currentTranslate - The current translation position of the slider
     * @return {Number} The index of the aligned slide, or null if no alignment
     */
    getClosestSlideSmoothScroll(currentTranslate) {
        let alignedIndex = null;

        this.slides.forEach((slide, index) => {
            // Calculate the slide’s position relative to the carousel wrapper
            const slideLeftEdge = slide.offsetLeft - this.carouselWrapper.offsetLeft;
    
            // Check if the slide's left edge aligns perfectly with the carousel edge
            if (Math.round(slideLeftEdge + currentTranslate) === 0) {
                alignedIndex = index;
            }
        });
    
        return alignedIndex;
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data(
        "carousel",
        (
            fade,
            overflow,
            autoplay,
            infinite,
            align,
            slidesInView,
            preview,
            smoothAutoplay,
            direction
        ) =>
            new Carousel(
                fade,
                overflow,
                autoplay,
                infinite,
                align,
                slidesInView,
                preview,
                smoothAutoplay,
                direction
            )
    );
});
