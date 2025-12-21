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
use Pegasus\Model\PostModel;

$postModel = PostModel::build(get_post());

$context = Timber::context();

$context['postModel'] = $postModel;
$context['categories'] = wp_get_post_terms($postModel->ID, 'category');
$context['tags'] = wp_get_post_terms($postModel->ID, 'post_tag');
$context['modal'] = isset($_GET['modal']);
$context['relatedPosts'] = wp_list_pluck($postModel->getRelatedPosts(8), 'id');
$context['read_time'] = $postModel->getReadTime();
$context['authors_box'] = get_field('authors_box_pb_repeater', $postModel->ID);
$context['toc'] = $postModel->getTableOfContents();

Timber::render('views/post.twig', $context);
