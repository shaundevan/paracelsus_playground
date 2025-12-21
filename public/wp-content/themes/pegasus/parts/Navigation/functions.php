<?php

namespace Pegasus\Components;

use Timber\Timber;
use Pegasus\PartManager;
use PnpdIpToCountry\Managers\IpManager;

$manager = PartManager::getInstance();

$data = [
    'languagePrompt' => false
];

if (class_exists('PnpdIpToCountry\Managers\IpManager')) {
    try {
        // Get client IP with fallbacks
        $clientIp = $_SERVER['REMOTE_ADDR'];
        $headers = getallheaders();
        
        if (isset($headers['CLIENT-IP'])) {
            $clientIp = $headers['CLIENT-IP'];
        } elseif (isset($headers['REMOTE_ADDR'])) {
            $clientIp = $headers['REMOTE_ADDR'];
        } elseif (isset($headers['X-Forwarded-For'])) {
            $ips = explode(',', $headers['X-Forwarded-For']);
            $clientIp = trim(reset($ips));
        }

        // Get country info
        $ipInfo = \PnpdIpToCountry\Managers\IpManager::info($clientIp);
        $visitor_country = $ipInfo ? $ipInfo->country->isoCode : false;
        
        // Get WPML current language
        $current_language = apply_filters('wpml_current_language', NULL);
        
        // Get language prompt settings
        $languagePrompt = get_field('language_prompt', 'option') ?: [];

        if ($visitor_country && !empty($languagePrompt)) {
            $visitor_language = \PnpdIpToCountry\Constants::getLanguageFromCountry($visitor_country);
            foreach ($languagePrompt as $prompt) {
                if ($prompt['browser_language'] === $visitor_language && $prompt['browser_language'] !== $current_language) {
                    $data['languagePrompt'] = $prompt;
                    break;
                }
            }
        }
    } catch (\Exception $e) {
        // Silent fail - keep default languagePrompt = false
    }
} else {
    //Reverse browser language
    $http_accept_language            = filter_var( $_SERVER['HTTP_ACCEPT_LANGUAGE'], FILTER_SANITIZE_SPECIAL_CHARS );
    $accepted_languages              = explode(',', $http_accept_language);
    $default_accepted_language_codes = [];
    foreach ($accepted_languages as $accepted_language) {
        if (!empty($accepted_language)) {
            $default_accepted_language_codes[] = explode(';', $accepted_language)[0];
        }
    }

    $current_langauge = apply_filters( 'wpml_current_language', NULL );

    if (!in_array($current_langauge, $default_accepted_language_codes)) {

        $languagePrompt = get_field('language_prompt', 'option') ?: [];

        $languagePromptCodes = wp_list_pluck( $languagePrompt, 'browser_language' );

        foreach ($default_accepted_language_codes as $accepted_language_code) {
            $result = array_search($accepted_language_code, $languagePromptCodes);
            if ($result !== false) {
                $data['languagePrompt'] = $languagePrompt[$result];
                break;
            }
        }
    }
}

$navigationFields = get_field('navigation_settings', 'options') ?: [];
$siteHeader = get_field('site_header', 'options') ?: [];
$contactInfo = get_field('contact_information', 'options') ?: [];
$mainNav = get_field('main_navigation', 'options') ?: [];
$pageSettings = get_field('navigation_settings', get_the_ID()) ?: [];
$navFields = array_merge($navigationFields, array_filter($pageSettings, 'strval'));

if(!isset($navFields['hide_logo_on_desktop']) || $navFields['hide_logo_on_desktop'] === null || empty($navFields['hide_logo_on_desktop'])) {
    $navFields['hide_logo_on_desktop'] = "false";
}

$data = array_merge($navFields, $siteHeader, $contactInfo, $mainNav, $data);

$data['primaryMenu'] = Timber::get_menu('primary');

$data['isHomePage'] = is_front_page();


$manager->setPartData($key, $data);


// disable schema yoast on home page - piotr




add_filter( 'wpseo_json_ld_output', '__return_false' );
add_filter( 'wpseo_schema_graph_pieces', '__return_empty_array', 11 );
