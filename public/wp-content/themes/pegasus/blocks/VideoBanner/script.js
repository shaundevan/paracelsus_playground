class VideoBanner {
    videoLoaded = false;
    shouldLoadVideo = false;
    
    init() {
        this.checkIfShouldLoadVideo();
        this.setupVideoLoading();
    }
    
    checkIfShouldLoadVideo() {
        // Check connection speed
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.saveData || 
                ['slow-2g', '2g'].includes(connection.effectiveType)) {
                return; // Don't auto-load on slow connections
            }
        }
        
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return; // Respect accessibility preferences
        }
        
        this.shouldLoadVideo = true;
    }
    
    setupVideoLoading() {
        if (!this.shouldLoadVideo) {
            return;
        }
        
        // Use Intersection Observer for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadVideo();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(this.$refs.videoContainer);
    }
    
    loadVideo() {
        const container = this.$refs.videoContainer;
        const isMobile = window.innerWidth < 768;
        
        const desktopVideo = container.dataset.desktopVideo;
        const mobileVideo = container.dataset.mobileVideo;
        const poster = container.dataset.poster;
        
        const videoSrc = isMobile && mobileVideo ? mobileVideo : desktopVideo;
        
        if (!videoSrc) return;
        
        const video = document.createElement('video');
        video.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full !h-full object-cover opacity-80';
        video.src = videoSrc;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata'; // Load metadata first
        
        if (poster) {
            video.poster = poster;
        }
        
        // Load video data after a short delay
        setTimeout(() => {
            video.preload = 'auto';
        }, 1500);
        
        video.addEventListener('loadeddata', () => {
            this.videoLoaded = true;
            container.appendChild(video);
        });
        
        video.addEventListener('error', () => {
            console.warn('Video failed to load, falling back to poster');
        });
    }
    
    setupClickToPlay() {
        const container = this.$refs.videoContainer;
        const playButton = document.createElement('button');
        playButton.innerHTML = '▶️ Play Video';
        playButton.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg';
        
        playButton.addEventListener('click', () => {
            this.loadVideo();
            playButton.remove();
        });
        
        container.appendChild(playButton);
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("videoBanner", () => new VideoBanner);
});