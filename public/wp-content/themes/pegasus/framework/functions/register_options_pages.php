<?php

function pegasus_register_options_pages()
{
    $website_settings = acf_add_options_page([
        'page_title'    => __('Website Settings'),
        'menu_slug'     => 'website-settings',
        'capability'    => 'edit_posts',
        'redirect'      => false,
        'position'      => '75.1'
    ]);
}

add_action('acf/init', 'pegasus_register_options_pages', 10);
