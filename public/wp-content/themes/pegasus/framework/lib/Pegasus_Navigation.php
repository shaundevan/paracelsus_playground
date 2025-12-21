<?php
/**
*
* Navigation Menu Constructor
*
* @package Pegasus
* @since 2.0
*/

namespace Pegasus;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class Pegasus_Navigation extends AbstractExtension
{
    public function getFunctions()
    {
        return [
            new TwigFunction('pegasus_navigation_menu', [$this, 'pegasus_navigation_menu']),
            new TwigFunction('pegasus_sub_navigation', [$this, 'pegasus_sub_navigation']),
            new TwigFunction('pegasus_ancestor_sub_navigation', [$this, 'pegasus_ancestor_sub_navigation']),
        ];
    }

    private function pegasus_ancestor_sub_navigation($page_id) {

        $ancestors = get_post_ancestors($page_id);

        $sub_nav_items = [
            'show' => null,
            'label' => '',
            'link_fields' => [],
        ];

        foreach($ancestors as $post) {
            $sub_nav = get_field('sub_navigation', $post);
            if(!empty($sub_nav['links'])){
                $sub_nav_items = [
                    'show' => $sub_nav['show_sub_navigation'],
                    'label' => $sub_nav['title'],
                    'link_fields' => $sub_nav['links'],
                ];
                break;
            } else {
                continue;
            }
        }

        return $sub_nav_items;

    }

    public function pegasus_sub_navigation($page_id) {
        $sub_nav = get_field('sub_navigation', $page_id);
        if(!$sub_nav){
            return;
        }
        $show_field = $sub_nav['show_sub_navigation'];
        $label_field = $sub_nav['title'];
        $link_field = $sub_nav['links'];
        $ancestor_fields = $this->pegasus_ancestor_sub_navigation($page_id);

        $links = !empty($link_field) ? $link_field : $ancestor_fields['link_fields'];

        $sub_nav_items = [
            'show' => !empty($show_field) ? $show_field : $ancestor_fields['show'],
            'label' => !empty($label_field) ? $label_field : $ancestor_fields['label'],
            'links' => [],
        ];

        foreach($links as $item) {

            $tmp = [
                'title' => $item['link']['title'],
                'url' => $item['link']['url'],
                'target' => $item['link']['target'],
            ];

            $sub_nav_items['links'][] = $tmp;
        }

        return $sub_nav_items;
    }

    public function pegasus_navigation_menu($location)
    {
        $theme_locations = get_nav_menu_locations();
        if(isset($theme_locations[$location]) && !empty($theme_locations[$location])){
            $menu_obj = get_term($theme_locations[$location], 'nav_menu');
        } else {
            $menu_obj = [];
        }

        return empty($menu_obj) ? [] : $this->pegasus_navigation_items($menu_obj->slug, 0);
    }

    private function pegasus_navigation_items($menu_slug, $parent_id)
    {
        $args = [
            'post_type' => 'nav_menu_item',
            'meta_key' => '_menu_item_menu_item_parent',
            'meta_value' => $parent_id,
            'tax_query' => [
                [
                    'taxonomy' => 'nav_menu',
                    'field' => 'slug',
                    'terms' => [$menu_slug]
                ]
            ],
            'posts_per_page' => '-1',
            'order' => 'ASC',
            'orderby' => 'menu_order',
        ];

        $tmpItems = query_posts($args);
        $items = [];

        foreach ($tmpItems as $tmpItem) {
            $item = new \stdClass;
            $type = get_post_meta($tmpItem->ID, '_menu_item_type', true);

            switch($type):
                case 'post_type':
                    $post_id = get_post_meta($tmpItem->ID, '_menu_item_object_id', true);
                    $post = get_post($post_id);

                    if (isset($tmpItem->post_title) && $tmpItem->post_title != '') {
                        $item->title = $tmpItem->post_title;
                    } else {
                        $item->title = $post->post_title;
                    }

                    $item->url = get_permalink($post_id);
                    $item->ID = $post_id;
                    $item->post_type = get_post_type($post_id);

                    if (get_post_type($post_id) === 'mega-menu') {
                        $item->mega_menu = true;
                    }
                    
                    break;
                case 'taxonomy':
                    $tax_id = get_post_meta($tmpItem->ID, '_menu_item_object_id', true);
                    $term_obj = get_term($tax_id);

                    $tax_title = $tmpItem->post_title;

                    if ($tax_title == '') {
                        $tax_title = $term_obj->name;
                    }

                    $item->title = $tax_title;
                    $item->url = get_term_link($term_obj);
                    $item->ID = $tax_id;
                    $item->term_obj = $term_obj;
                    break;
                case 'post_type_archive':
                    $post_title = $tmpItem->post_title;
                    $post_type = get_post_meta($tmpItem->ID, '_menu_item_object', true);

                    if ($post_title == '') {
                        $post_title = str_replace('-', ' ', $post_type);
                        $post_title = ucwords($post_type);
                    }

                    $item->title = $post_title;
                    $item->url = get_post_type_archive_link($post_type);
                    $item->post_type = $post_type;
                    break;
                case 'custom':
                    $item->title = $tmpItem->post_title;
                    $item->url = get_post_meta($tmpItem->ID, '_menu_item_url', true);
                    break;

                // note : this has to be completed with every '_menu_item_type' (could also come from plugin)
            endswitch;

            $item->menuItemID = $tmpItem->ID;
            $item->children = $this->pegasus_navigation_items($menu_slug, $tmpItem->ID);
            $items[] = $item;
        }

        return $items;

    }
}
