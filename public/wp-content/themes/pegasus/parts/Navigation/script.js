export default class Navigation {
    open = false;
    openSearchForm = false;
    activeSubMenuItem = false;
    languagePrompt = true;
    languagePromptOpen = false;
    languageLocation = 0;
    navigationIn = false;

    init() {
        this.$watch('activeMenuItem', () => this.activeSubMenuItem = false);

        setTimeout(() => {
            this.navigationIn = true;
        }, 150);
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('navigation', () => new Navigation());
});