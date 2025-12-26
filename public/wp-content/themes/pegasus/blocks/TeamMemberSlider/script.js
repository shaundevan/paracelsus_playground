import Flickity from "flickity";

// Use window globals instead of imports to avoid Vite tree-shaking issues
const pegasus = window.pegasus;
const Media = window.Media;

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
        
        // Set --slide-width CSS variable for proper slide sizing (approx 3 visible slides)
        const slideWidth = 100 / 3; // ~33% for 3 visible slides
        this.slides.forEach(slide => {
            slide.style.setProperty('--slide-width', `${slideWidth}%`);
        });
        
        // Prevent scroll interference during drag
        this.slider.on('dragStart', () => {
            document.documentElement.classList.add('flickity-dragging');
        });

        this.slider.on('dragEnd', () => {
            document.documentElement.classList.remove('flickity-dragging');
        });

        this.slider.on('scroll', () => this.updateProgressBar(), { passive: true });

        this.slider.on('ready', () => this.slider.resize());
        
        // Fix for layout issues on initial load - resize after fonts/images load
        if (document.readyState === 'complete') {
            this.slider.resize();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.slider.resize(), 100);
            }, { once: true });
        }

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

// Register component - use window.Alpine to ensure we use the global instance
const registerTeamGridSlider = () => {
    if (window.Alpine) {
        window.Alpine.data("teamGridSlider", (autoplay, infinite) => new TeamGridSlider(autoplay, infinite));
    }
};

// Try immediate registration, also listen for alpine:init
registerTeamGridSlider();
document.addEventListener("alpine:init", registerTeamGridSlider);

// Named export for Vite inclusion
export { TeamGridSlider };
