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

use Pegasus\Pegasus;
use Timber\Timber;

$territory = null;
if (Pegasus::getContainer()->has('TerritoryHelper')) {
    $territory = Pegasus::getContainer()->get('TerritoryHelper')::getCurrentTerritory();
}

$args = [
    'post_type' => ['page'],
    'posts_per_page' => 1,
    'post_status' => ['publish'],
    'title' => '404',
    'fields' => 'ids',
];

$meta_query = [
    'relation' => 'OR',
];

$meta_queries = [];

if (!empty($territory)) {
    $meta_queries[] = [
        'key' => 'territory',
        'value' => $territory->ID,
        'compare' => '=',
    ];

    if ($territory->ID == Pegasus::getContainer()->get('TerritoryHelper')::getDefaultTerritory()->ID) {
        $meta_queries[] = [
            'key' => 'territory',
            'value' => false,
            'compare' => '=',
        ];
    }
}
$meta_query = array_merge($meta_query, $meta_queries);

$args['meta_query'] = $meta_query;

$four_oh_four = new WP_Query($args);

if(!is_array($four_oh_four->posts) || count($four_oh_four->posts) === 0){
    global $wp_query;
    $wp_query->set_404();
    status_header(404);
    exit;
} 

$context = Timber::context();
$context['post'] = Timber::get_post($four_oh_four->posts[0]);
$context['modal'] = isset($_GET['modal']);
Timber::render('views/404.twig', $context);
