<?php
add_theme_support( 'menus' );

/**
*
* Navigation Menus
*
* Description: Array of key value pairs that define the menu locations and
*              descriptive text. To add a new menu to the theme, simply add a
*              new item to this array.
*
* @since 2.0
*/
$navigation_menus = [
    'primary' => __('Primary Navigation', 'pegasus'),
    'footer' => __('Footer Navigation', 'pegasus'),
];

$args = [
    'post_type' => 'territory',
    'posts_per_page' => -1,
    'post_status' => ['publish']
];

$territories = new WP_Query($args);

foreach($territories->posts as $territory){
    if($territory->post_name == 'united-kingdom')
        continue;

    $navigation_menus[$territory->post_name.'_primary'] = $territory->post_title . ' ' . __('Primary Navigation', 'pegasus');
}


if (!empty($navigation_menus)) {
    register_nav_menus($navigation_menus);
}
