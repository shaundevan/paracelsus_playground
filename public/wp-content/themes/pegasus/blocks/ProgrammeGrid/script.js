class ProgrammeGrid {
    open = false;

    constructor(currencies) {
        this.currencies = currencies;
        this.currency = pegasus.getCookie('currency');

        if (!this.currency && currencies.length) {
            this.currency = currencies[0];
        }
    }

    toggleCurrency(currency) {
        this.currency = currency;
        pegasus.setCookie('currency', this.currency, 60);
        this.$dispatch('currency-changed', currency);
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('programmeGrid', (currencies = []) => new ProgrammeGrid(currencies));
});
