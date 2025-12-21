class QuoteList
{
    constructor(postsToShow, itemCount) {
        this.postsToShow = parseInt(postsToShow, 10);
        this.itemCount = parseInt(itemCount, 10);
    }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("quoteList", (postsToShow, itemCount) => new QuoteList(postsToShow, itemCount));
});
