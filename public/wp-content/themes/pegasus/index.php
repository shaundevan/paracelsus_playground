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

if (! empty($_GET['modal']) && has_block('pegasus/modalcontent')) {
    // If a modal and the Modal Content block is present, only include blocks within a Modal Content block
    add_filter(
        'timber/post/import_data',
        function ($data) {
            $content = explode('<!-- wp:pegasus/modalcontent ', $data['post_content']);
            $modal_content = '';
            foreach ($content as $content_part) {
                if (strpos($content_part, '"name":"pegasus/modalcontent"') !== false) {
                    $modal_content_part = explode('<!-- /wp:pegasus/modalcontent -->', $content_part);
                    $modal_content .= '<!-- wp:pegasus/modalcontent ' . array_shift($modal_content_part) . '<!-- /wp:pegasus/modalcontent -->';
                }
            }
            if ($modal_content) {
                $data['post_content'] = $modal_content;
            }
            return $data;
        }
    );
}

$context = Timber::context();
$context['modal'] = isset($_GET['modal']);
$navigationFields = get_field('navigation_settings', 'options') ?: [];
$pageSettings = get_field('navigation_settings', get_the_ID()) ?: [];
$navFields = array_merge($navigationFields, array_filter($pageSettings));
$context['navigation'] = $navFields;

Timber::render('views/index.twig', $context);

