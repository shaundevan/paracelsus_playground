<?php
/**
 *
 * Contains functions to build out the wp_head
 *
 * @package Pegasus
 * @subpackage wp_head
 * @since 2.0
 */

use Pegasus\Pegasus;

/**
 * Output the page title. Checks for the Yoast title first.
 */
if ( ! function_exists( '_wp_render_title_tag' ) ) {
    function pegasus_page_title()
    {
        ?>
        <title>
            <?php wp_title( '|', true, 'right' ); ?>
        </title>
        <?php
    }
    add_action( 'wp_head', 'pegasus_page_title' );
}
add_theme_support( 'title-tag' );

/**
                                                                                                                                                             * Output header meta tags and resource hints
 */
function pegasus_head_meta()
{
    echo '<meta charset="' . esc_attr(get_bloginfo('charset')) . '" />';
    echo '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, minimal-ui">';
    echo '<meta name="format-detection" content="telephone=no">';
    echo '<meta name="apple-mobile-web-app-capable" content="yes">';
    echo '<meta name="mobile-web-app-capable" content="yes">';

    // Preconnect to external domains for faster resource loading
    echo '<link rel="preconnect" href="https://js-eu1.hsforms.net" crossorigin>';
    echo '<link rel="preconnect" href="//p.typekit.net">';
    echo '<link rel="dns-prefetch" href="//js-eu1.hsforms.net">';
}

add_action('wp_head', 'pegasus_head_meta', 0);

/**
 * Output favicon and other application icons
 */
function pegasus_icons()
{
    echo '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">';
    echo '<link rel="icon" href="favicon-dark.png" sizes="32x32" media="(prefers-color-scheme: light)">';
    echo '<link rel="icon" href="favicon-light.png" sizes="32x32" media="(prefers-color-scheme: dark)">';
    echo '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">';
    echo '<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ffffff">';
    echo '<meta name="msapplication-TileColor" content="#ffffff">';
    echo '<meta name="theme-color" content="#ffffff">';
}

add_action('wp_head', 'pegasus_icons', 999);

/**
 * Output location scheme
 */
//function location_schema()
//{
//    $contact_fields = get_field('contact_information', 'options');
//    $url = get_site_url();
//
//    echo '<script type="application/ld+json">';
//        echo '{';
//            echo '"@context": "http://schema.org",';
//            echo '"@type": "Organization",';
//            echo '"address": {';
//                echo '"@type": "PostalAddress",';
//                echo '"streetAddress": "'.($contact_fields['street_address'] ?? '').'",';
//                echo '"addressLocality": "'.($contact_fields['address_locality'] ?? '').'",';
//                echo '"addressRegion": "'.($contact_fields['address_region'] ?? '').'",';
//                echo '"addressCountry": "'.($contact_fields['country'] ?? '').'",';
//                echo '"postalCode": "'.($contact_fields['postal_code'] ?? '').'"';
//            echo '},';
//            echo '"email": "'.($contact_fields['contact_email'] ?? '').'",';
//            echo '"telephone": "'.($contact_fields['contact_phone'] ?? '').'",';
//            echo '"name": "'.($contact_fields['company_name'] ?? '').'",';
//            echo '"url": "'.$url.'"';
//        echo '}';
//    echo '</script>';
//}
//add_action('wp_head', 'location_schema', 2);


/**
 * Additional Head Tag Snippets
 */
function additional_head_tag_snippets()
{
    $snippet = get_field('head_tag_snippets', 'options');

    if (Pegasus::getContainer()->has('TerritoryHelper')) {
        $advanced_fields = Pegasus::getContainer()->get('TerritoryHelper')::getCurrentTerritory()->getAdvancedFields();
        if (!empty($advanced_fields['head_tag_snippets'])) :
            $snippet = $advanced_fields['head_tag_snippets'];
        endif;
    }

    if (!empty($snippet)) :
        echo $snippet;
    endif;
}
add_action('wp_head', 'additional_head_tag_snippets', 999);

/**
 * Additional Top of Body Snippets
 */
function additional_top_of_body_snippets()
{
    $snippet = get_field('start_of_body_tag_snippets', 'options');

    if (Pegasus::getContainer()->has('TerritoryHelper')) {
        $advanced_fields = Pegasus::getContainer()->get('TerritoryHelper')::getCurrentTerritory()->getAdvancedFields();
        if (!empty($advanced_fields['start_of_body_tag_snippets'])) :
            $snippet = $advanced_fields['start_of_body_tag_snippets'];
        endif;
    }

    if (!empty($snippet)) :
        echo $snippet;
    endif;
}
add_action('wp_body_open', 'additional_top_of_body_snippets', 10);

/**
 * Set the admin ajax url globally
 */
function admin_ajax_url()
{
    echo '<script type="text/javascript">';
    echo 'var ajaxurl = "' . admin_url('admin-ajax.php') . '"';
    echo '</script>';
}
add_action('wp_head', 'admin_ajax_url', 10);
