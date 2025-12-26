class BlurRevealSlide
{
    blur = true;
}

document.addEventListener("alpine:init", () => {
    Alpine.data("blurRevealSlide", () => new BlurRevealSlide());
});