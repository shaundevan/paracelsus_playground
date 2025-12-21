export default class Shutter
{
    sticking = false;

    stuck(e) {
        this.sticking = true;
        this.$root.style.height = this.$root.offsetHeight + 'px';
    }

    unstuck(e) {
        this.sticking = false;
        this.$root.style.height = '';
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("shutter", () => new Shutter());
});