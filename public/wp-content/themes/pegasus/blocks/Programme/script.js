export default class Programme {
    constructor(price, exchangeRates, baseCurrency) {
        this.basePrice = price;
        this.exchangeRates = typeof exchangeRates === 'string' ? JSON.parse(exchangeRates) : exchangeRates;
        this.baseCurrency = baseCurrency;
        this.selectedCurrency = pegasus.getCookie('currency') || baseCurrency;
    }

    get price() {
        // If selected currency is the same as base, return original price
        if (this.selectedCurrency === this.baseCurrency) return this.basePrice;
        
        // Get exchange rates for USD conversion
        const baseToUSD = 1 / this.exchangeRates[this.baseCurrency];
        const usdToTarget = this.exchangeRates[this.selectedCurrency];
        
        if (!baseToUSD || !usdToTarget) return this.basePrice;
        
        // Convert base currency to USD, then to target currency
        const priceInUSD = this.basePrice * baseToUSD;
        const convertedPrice = priceInUSD * usdToTarget;
        
        return Math.round(convertedPrice);
    }

    get currency() {
        return this.selectedCurrency;
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('programme', (price, exchangeRates, baseCurrency) => 
        new Programme(price, exchangeRates, baseCurrency)
    );
});
