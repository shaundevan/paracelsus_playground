<?php
/**
 *
 * Contains functions to build out the wp_footer
 *
 * @package Pegasus
 * @subpackage wp_footer
 * @since 2.0
 */

use Pegasus\Pegasus;

/**
 * Additional End of Body Snippets
 */
function additional_end_of_body_snippets()
{
    $snippet = get_field('end_of_body_tag_snippets', 'options');

    if (Pegasus::getContainer()->has('TerritoryHelper')) {
        $advanced_fields = Pegasus::getContainer()->get('TerritoryHelper')::getCurrentTerritory()->getAdvancedFields();
        if (!empty($advanced_fields['end_of_body_tag_snippets'])) :
            $snippet = $advanced_fields['end_of_body_tag_snippets'];
        endif;
    }

    if (!empty($snippet)) :
        echo $snippet;
    endif;
}
add_action('wp_footer', 'additional_end_of_body_snippets', 10);