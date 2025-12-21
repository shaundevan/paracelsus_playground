export function loadCheck() {
    return true;
};

export function visibleCheck({ element }) {
    return new Promise(function (resolve) {
        const observer = new IntersectionObserver(async function (entries) {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    resolve(true);
                }
            }
        });
        observer.observe(element)
    });
}

export function mediaCheck({ query }) {
    const mediaQuery = window.matchMedia(query);
    
    return new Promise(function (resolve) {
        if (mediaQuery.matches) {
            resolve(true)
        } else {
            mediaQuery.addEventListener('change', resolve, { once: true })
        }
    });
}

export function idleCheck() {
    return new Promise(resolve => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(resolve);
        } else {
            setTimeout(resolve, 200);
        }
    });
};

export function eventCheck({ event }) {
    return new Promise(resolve => {
        if (event) {
            window.addEventListener(event, () => resolve(),{ once: true });
        }
    });
};