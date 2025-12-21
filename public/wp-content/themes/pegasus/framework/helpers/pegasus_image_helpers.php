<?php
/**
 *
 * Image Helpers
 *
 * @package Pegasus
 * @since 2.0
 */


/**
 * pegasus_get_image_sizes
 *
 * Description: Get an array of all available image sizes for a given image
 *
 * @since 2.0
 *
 * @param string $size Optionally return the details for a single given size
 *
 * @return array $sizes The array of all gound image sizes and their dimensions
 */
function pegasus_get_image_sizes( $size = '' ) {
    $wp_additional_image_sizes = wp_get_additional_image_sizes();

    $sizes = array();
    $get_intermediate_image_sizes = get_intermediate_image_sizes();

    // Create the full array with sizes and crop info
    foreach( $get_intermediate_image_sizes as $_size ) {
        if ( in_array( $_size, array( 'thumbnail', 'medium', 'large' ) ) ) {
            $sizes[ $_size ]['width'] = get_option( $_size . '_size_w' );
            $sizes[ $_size ]['height'] = get_option( $_size . '_size_h' );
            $sizes[ $_size ]['crop'] = (bool) get_option( $_size . '_crop' );
        } elseif ( isset( $wp_additional_image_sizes[ $_size ] ) ) {
            $sizes[ $_size ] = array(
                'width' => $wp_additional_image_sizes[ $_size ]['width'],
                'height' => $wp_additional_image_sizes[ $_size ]['height'],
                'crop' =>  $wp_additional_image_sizes[ $_size ]['crop']
            );
        }
    }

    if ( $size ) {
        if( isset( $sizes[ $size ] ) ) {
            return $sizes[ $size ];
        } else {
            return [];
        }
    }
    return $sizes;
}