class ExpandingImages {
    constructor() {
        this.loadedImages = new Set();
        this.isDesktop = window.matchMedia('(min-width: 960px)').matches;
        this.animated = false;
    }

    checkAllImagesLoaded() {
        if (!this.$el || !this.totalImages || this.animated) return;
        
        if (this.loadedImages.size === this.totalImages) {
            this.$el.classList.add('is-loaded');
            this.$el.removeEventListener('transitionend', this.handleTransition.bind(this));
            this.animated = true;
        }
    }

    init() {
        // On mobile, immediately show content. OD
        if (!this.isDesktop) {
            this.$el.classList.add('is-loaded');
            return;
        }

        this.imagesLazy = this.$el.querySelectorAll('.pegasus-lazy-wrapper');
        this.totalImages = this.imagesLazy.length;
        
        if (this.totalImages === 0) {
            this.$el.classList.add('is-loaded');
            return;
        }

        // Handle already loaded images. OD
        this.imagesLazy.forEach(wrapper => {
            if (wrapper.classList.contains('is-loaded')) {
                this.loadedImages.add(wrapper);
            }
        });

        // Add event delegation listener. OD
        this.$el.addEventListener('transitionend', this.handleTransition.bind(this), { passive: true });

        this.checkAllImagesLoaded();
    }

    handleTransition(e) {
        const wrapper = e.target.closest('.pegasus-lazy-wrapper');
        if (wrapper && e.propertyName === 'opacity' && wrapper.classList.contains('is-loaded')) {
            this.loadedImages.add(wrapper);
            this.checkAllImagesLoaded();
        }
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("expandingImages", () => new ExpandingImages());
});

