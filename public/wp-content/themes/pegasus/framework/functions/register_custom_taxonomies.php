<?php
/**
 *
 * Register custom post types for this website
 *
 * @package Pegasus
 * @since 2.0
 */

namespace Pegasus\Functions;

use Plugandplay\Pegasus\Core\PostTypes;

add_action('init', function(){
    $post_types = new PostTypes();
    $show_in_rest = ['show_in_rest' => true];

   $post_types->register_taxonomy(
       'department',
       'team-member',
       'Departments',
       'department',
       $show_in_rest
   );

   $post_types->register_taxonomy(
       'team-category',
       'team-member',
       'Team Categories',
       'team-category',
       $show_in_rest
   );

   $post_types->register_taxonomy(
        'source',
        'quote',
        'Sources',
        'source',
        $show_in_rest
    );


    $post_types->register_taxonomy(
        'calendar-event',
        'event',
        'Calendar Event',
        'calendar',
        $show_in_rest
    );


    $post_types->register_taxonomy(
        'faq',
        'list-view',
        'Faq',
        'faq-cat',
        $show_in_rest
    );

    $post_types->register_taxonomy(
        'authors',
        'universal-access',
        'Authors',
        'authors',
        $show_in_rest
    );

}, 10);
