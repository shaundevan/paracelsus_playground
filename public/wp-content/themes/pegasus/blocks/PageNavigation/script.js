class PageNavigation {
    item = 1;

    setItem(item) {
        this.item = item;
    }

    addIntersect(item, index) {
        let observer;

        let options = {
          rootMargin: "0px 0px -50% 0px",
        };

        const target = document.querySelector("#" + item);

        if (target) {
            target.dataset.index = index;

            observer = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.item = parseInt(entry.target.dataset.index, 10);
                        }
                    });
                },
                options
            );

            observer.observe(target);
        }
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("pageNavigation", () => new PageNavigation());
});