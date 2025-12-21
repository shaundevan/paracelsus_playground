<?php
/**
* The main template file
*
* This is the most generic template file in a WordPress theme
* and one of the two required files for a theme (the other being style.css).
* It is used to display a page when nothing more specific matches a query.
* E.g., it puts together the home page when no home.php file exists.
*
* @link https://developer.wordpress.org/themes/basics/template-hierarchy/
*
* @package Pegasus
*/

use Timber\Timber;

$context = Timber::context();

$result_page = get_field('search_result_page', 'option');

if ($result_page) {
    $result_page = Timber::get_post($result_page);

    if ($result_page) {
        $context['result_page'] = $result_page;
    }
}

$posts = Timber::get_posts()->to_array();

$context['post_type_count'] = array_count_values(wp_list_pluck( $posts, 'post_type' ));

Timber::render('views/search.twig', $context);
