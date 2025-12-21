export default class OverlappingImages {
    init() {
        var targets = document.querySelectorAll('.OverlappingImages');

        targets.forEach((target) => {

            if (!target.classList.contains('parallax-init')) {

                target.classList.add('parallax-init');

                const observer = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                if (entry.boundingClientRect.top > 0) {
                                    target.style.setProperty("--parallax-offset", 1 - entry.intersectionRatio);
                                } else {
                                    target.style.setProperty("--parallax-offset", -1 + entry.intersectionRatio);
                                }
                            }
                        });
                    },
                    { threshold: [...Array(101)].map((v, i) => i / 100) }
                );
                observer.observe(target);
            }
        });
    }
}
document.addEventListener("alpine:init", () => {
    Alpine.data("overlappingImages", () => new OverlappingImages());
});