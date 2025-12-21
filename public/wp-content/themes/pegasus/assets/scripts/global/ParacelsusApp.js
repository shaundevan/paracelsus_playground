export default class ParacelsusApp {
    atTop = true;
    nearTop = true;
    goingUp = false;
    activeMenuItem = false;
    langSwitcherOpen = false;
    stationaryTimeout = null;
    pageSwitcherName = false;
    pageSwitcherLabel = false;

    init() {
        let prevScrollTop = 0;
        let scrollTimeout;
        let lastScrollTime = Date.now();
        let scrollFrame;
        const scrollThrottleDelay = 100; // Increased throttle delay
    
        const handleScroll = () => {
            // Cancel any pending frame
            if (scrollFrame) {
                cancelAnimationFrame(scrollFrame);
            }
    
            scrollFrame = requestAnimationFrame(() => {
                const now = Date.now();
                if (now - lastScrollTime < scrollThrottleDelay) return;
                lastScrollTime = now;
                
                const scrollTop = Math.max(0, window.pageYOffset || document.documentElement.scrollTop);
                const threshold = 20; // Increased threshold
                
                if (Math.abs(scrollTop - prevScrollTop) > threshold) {
                    this.goingUp = scrollTop < prevScrollTop;
                    prevScrollTop = scrollTop;
                }
            });
        };
    
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('paracelsusApp', () => new ParacelsusApp());
});