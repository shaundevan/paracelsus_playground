export default class IconCarousel {
    isPreview = false;
    observer = null;
    scrollHandler = null;
    handleVisibilityChange = null;
    resumeAnimation = null;
    pauseAnimation = null;

    constructor(isPreview) {
        this.isPreview = isPreview;
        
        // Bind methods to instance
        this.resumeAnimation = () => {
            this.$refs.iconCarousel.style.animationPlayState = 'running';
        };

        this.pauseAnimation = () => {
            this.$refs.iconCarousel.style.animationPlayState = 'paused';
        };
    }

    init() {    
        if(!this.$refs.iconCarousel) return;

        const isInViewport = (element) => {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= -100 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };

        this.scrollHandler = () => {
            if (isInViewport(this.$refs.iconCarousel)) {
                this.resumeAnimation();
            } else {
                this.pauseAnimation();
            }
        };

        try {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.resumeAnimation();
                    } else {
                        this.pauseAnimation();
                    }
                });
            }, { 
                threshold: [0, 0.1, 1],
                root: null,
                rootMargin: "100px 0px"
            });
            
            this.observer.observe(this.$refs.iconCarousel);
        } catch (e) {
            window.addEventListener('scroll', this.scrollHandler, { passive: true });
            window.addEventListener('resize', this.scrollHandler, { passive: true });
            this.scrollHandler(); // Initial check
        }

        this.handleVisibilityChange = () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        };

        // Add all event listeners
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('pagehide', this.pauseAnimation);
        document.addEventListener('pageshow', this.resumeAnimation);
        this.$refs.iconCarousel.addEventListener('touchstart', this.resumeAnimation);
        this.$refs.iconCarousel.addEventListener('mousedown', this.resumeAnimation);
        this.$refs.iconCarousel.addEventListener('mouseenter', this.pauseAnimation);
        this.$refs.iconCarousel.addEventListener('mouseleave', this.resumeAnimation);
    }
}

// Register component - use window.Alpine to ensure we use the global instance
const registerIconCarousel = () => {
    if (window.Alpine) {
        window.Alpine.data("IconCarousel", (isPreview) => new IconCarousel(isPreview));
    }
};

// Try immediate registration, also listen for alpine:init
registerIconCarousel();
document.addEventListener("alpine:init", registerIconCarousel);
