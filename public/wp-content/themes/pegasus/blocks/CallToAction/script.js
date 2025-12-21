class CallToAction {
    visible = false;
}

document.addEventListener("alpine:init", () => {
    Alpine.data("callToAction", () => new CallToAction);
});