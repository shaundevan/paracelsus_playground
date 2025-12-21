export default class PageSwitcher {
    open = false;
}

document.addEventListener('alpine:init', () => {
    Alpine.data('pageSwitcher', () => new PageSwitcher());
});