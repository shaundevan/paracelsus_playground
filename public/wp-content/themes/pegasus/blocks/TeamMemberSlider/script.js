import Flickity from "flickity";
import Media from "@PegasusTheme/blocks/Media/script";
import pegasus from "../../assets/scripts/global/01-pegasus";

class TeamGridSlider
{
    autoplay = false;
    infinite = false;
    slider = null;
    sliderContainer = null;
    slides = [];
    modalOpen = false;
    media = new Media(1, 'upload');
    inView = false;
    screenWidth = 0;

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
    };

    initSlider() {
        this.media.$nextTick = this.$nextTick;
        this.media.$refs = this.$refs;
        this.sliderContainer = this.$refs.slider;
        this.slides = this.sliderContainer.querySelectorAll(".slide");
        this.screenWidth = window.innerWidth; // Changed from outerWidth

        let options = {
            wrapAround: this.infinite,
            prevNextButtons: false,
            pageDots: false,
            draggable: true,
            groupCells: '80%',
            watchCSS: false,
            percentPosition: true,
            // Improve touch handling
            dragThreshold: 15, // Increase threshold for iOS
            selectedAttraction: 0.015, // Reduce attraction for smoother scrolling
            friction: 0.32, // Increase friction
            touchVerticalScroll: false, // Prevent vertical scroll interference
            // Disable default resize handling
            resize: false
        };

        if (this.autoplay && this.autoplay > 0) {
            options.autoPlay = this.autoplay * 1000;
        }

        this.slider = new Flickity(this.sliderContainer, options);
        
        // Prevent scroll interference during drag
        this.slider.on('dragStart', () => {
            document.documentElement.classList.add('flickity-dragging');
        });

        this.slider.on('dragEnd', () => {
            document.documentElement.classList.remove('flickity-dragging');
        });

        this.slider.on('scroll', () => this.updateProgressBar(), { passive: true });

        this.slider.on('ready', () => this.slider.resize());

        // Replace ResizeObserver setup with pegasus resize handler
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

    playVideo(video, modalIndex) {
        this.modalOpen = modalIndex;
        this.media.setVideo(video);
        this.media.playVideo();

        video.addEventListener("fullscreenchange", (event) => {
            if (document.fullscreenElement === null) {
                this.modalOpen = false;
            }
        });
    }

    stopVideo() {
        this.media.stopVideo();
        this.modalOpen = false;
    }

    nextSlide() {
        this.slider.next();
    }

    previousSlide() {
        this.slider.previous();
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("teamGridSlider", (autoplay, infinite) => new TeamGridSlider(autoplay, infinite));
});
