<?php
/**
*
* Currency Converter Helpers (plugin)
*
* @package Pegasus
* @since 2.0
*/

/**
 * pegasus_get_currency_exchange_rates
 *
 * Description: 
 * Get the exchange rates for the selected currencies (set in 'Website Settings') from the Currency Converter plugin
 *
 * @since 2.0
 *
 * @return array $exchange_rates The exchange rates for the selected currencies 
 */
function pegasus_get_currency_exchange_rates()
{
    // Get selected currencies, fallback to empty array if ACF field doesn't exist
    $selected_currencies = [];
    $currencies_field = get_field('currencies', 'option');
    if ($currencies_field) {
        $selected_currencies = array_column($currencies_field, 'currency_code');
    }
    
    // Ensure USD is always included
    if (!in_array('USD', $selected_currencies)) {
        $selected_currencies[] = 'USD';
    }
    
    $rates_data = get_option('currencyconverter_rates');
    if (!$rates_data || !is_array($rates_data) || empty($rates_data[0]['rates'])) {
        // Return fallback rates (1:1 conversion) for selected currencies
        return array_fill_keys($selected_currencies, 1);
    }
    
    $all_rates = $rates_data[0]['rates'];
    
    if (!is_array($all_rates)) {
        return array_fill_keys($selected_currencies, 1);
    }
    
    // Filter rates and ensure all selected currencies have a rate
    $filtered_rates = array_intersect_key($all_rates, array_flip($selected_currencies));
    
    // Add fallback rate (1) for any missing currencies
    foreach ($selected_currencies as $currency) {
        if (!isset($filtered_rates[$currency])) {
            $filtered_rates[$currency] = 1;
        }
    }
    
    return $filtered_rates;
}

