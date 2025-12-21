export default class Media {
    // Set class variables
    videoType = "upload";
    video = null;
    modalOpen = false;
    openInModal = false;

    constructor(openInModal, mediaType) {
        this.openInModal = openInModal;
        this.videoType = mediaType.replace('video_', '');
    }

    setVideo(video) {
        this.video = video;
    }

    /**
     * playVideo
     * Description: Hides the placeholder and plays the video.
     * @returns void
     */
    async playVideo() {
        this.modalOpen = true;
        await this.$nextTick();

        // Standard HTML5 videos can simply use the play() and pause() methods.
        if (this.videoType === "upload") {
            this.video.play();
        }

        // Embed videos need to update the autoplay parameter in the URL.
        if (this.videoType === "embed") {
            const currentSrc = this.video.src;

            const currentSrcArray = currentSrc.split("&");

            let newSrc = "";

            currentSrcArray.forEach((part) => {
                if (part.includes("autoplay=")) {
                    part = "autoplay=1";
                }
                newSrc += part + "&";
            });

            this.video.src = newSrc;
        }

        if (window.screen.width < 782) {
            this.tryFullcreen();
        } else if (!this.openInModal) {
            this.$refs.videoPlaceholder.classList.add("hidden");
        }
    }

    stopVideo() {

        if (this.videoType === "upload") {
            this.video.pause();
        }

        // Embed videos need to update the autoplay parameter in the URL.
        if (this.videoType === "embed") {
            const currentSrc = this.video.src;

            const currentSrcArray = currentSrc.split("&");

            let newSrc = "";

            currentSrcArray.forEach((part) => {
                if (part.includes("autoplay=")) {
                    part = "autoplay=0";
                }
                newSrc += part + "&";
            });

            this.video.src = newSrc;
        }

        this.modalOpen = false;

        this.$refs.videoPlaceholder.classList.remove("hidden");
    }

    tryFullcreen() {
        if (typeof (this.video.requestFullscreen) !== "undefined") {
            this.video.requestFullscreen();
        } else if (typeof (this.video.webkitEnterFullscreen) !== "undefined") {
            this.video.webkitEnterFullscreen();
        } else if (typeof (this.video.webkitRequestFullscreen) !== "undefined") {
            this.video.webkitRequestFullscreen();
        } else if (typeof (this.video.mozRequestFullScreen) !== "undefined") {
            this.video.mozRequestFullScreen();
        } else if (this.videoType === "embed") {
            this.$refs.videoPlaceholder.classList.add("hidden");
        }

        this.video.addEventListener("fullscreenchange", (event) => {
            if (document.fullscreenElement === null) {
                this.stopVideo();
            }
        });
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("PegasusMediaBlock", (openInModal, mediaType) => new Media(openInModal, mediaType));
});
