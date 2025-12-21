import BasePostGridSlider from "@PegasusCore/pegasus-one-post-grid-slider/src/script";

class PostGridSlider extends BasePostGridSlider
{
    inView = false;

    /**
     * init
     * 
     * @return void
     */
    init() {
        super.init();

        this.$watch("inView", (value) => {
            if (value) {
                this.carouselWrapper.style.transform = "translateX(0)";
            }
        });
    };

    /**
     * Handle drag start
     */
    onDragStart(event) {

        if(event.target.tagName === "A") {
            return;
        }
        
        this.isDragging = true;
        this.carousel.classList.add("dragging");
        this.startX = event.type.includes("mouse")
            ? event.pageX
            : event.touches[0].clientX;
        this.prevTranslate = this.getSliderCurrentTranslate();

        // Attach move and end listeners
        this.carouselWrapper.addEventListener("mousemove", this.onDragMove);

        this.carouselWrapper.addEventListener("touchmove", this.onDragMove, { passive: true });

        this.carouselWrapper.addEventListener("mouseup", this.onDragEnd);
        this.carouselWrapper.addEventListener("touchend", this.onDragEnd);
    }

}

document.addEventListener("alpine:init", () => {
    Alpine.data("postGridSlider", (autoplay, infinite, slidesInView) => new PostGridSlider(autoplay, infinite, slidesInView));
});
