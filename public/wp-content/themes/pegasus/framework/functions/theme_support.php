<?php

/**
 * pegasus_enable_svg_upload
 *
 * Description: Allow SVGs to be uploaded to the media library
 */
function pegasus_enable_svg_upload($mimes)
{
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}
add_filter('upload_mimes', 'pegasus_enable_svg_upload', 999);


/**
 * Enable post thumbnails
 *
 * Description: Turn on thumbnail images for posts
 */
add_theme_support('post-thumbnails');


/**
 * Remove Emoji Support
 *
 * Description: Remove all emoji support in the backend
 */
remove_action('admin_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('wp_print_styles', 'print_emoji_styles');
remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
remove_filter('the_content_feed', 'wp_staticize_emoji');
remove_filter('comment_text_rss', 'wp_staticize_emoji');

// filter to remove TinyMCE emojis
add_filter(
    'tiny_mce_plugins',
    function ($plugins) {
        if (is_array($plugins)) {
            return array_diff($plugins, array( 'wpemoji' ));
        } else {
            return array();
        }
    }
);

/**
 * pegasus_update_default_images
 *
 * Description: Remove un-needed default images sizes
 */
 function pegasus_update_default_images() {
     foreach (get_intermediate_image_sizes() as $size) {
         if (in_array($size, ['2048x2048'])) {
             remove_image_size($size);
         }
     }

    add_image_size('banner', 1920, 1080, false);
    add_image_size('thumb-16x9', 640, 360, false);
    add_image_size('thumb-square', 640, 640, false);
 }
add_filter('init', 'pegasus_update_default_images');

/**
 *
 * pegasus_disable_rss
 *
 * Description: Disable all RSS feed functionality
 */
function pegasus_disable_rss()
{
    wp_redirect(home_url());
    die;
}
// Disable global RSS, RDF & Atom feeds.
add_action('do_feed', 'disable_feeds', -1);
add_action('do_feed_rdf', 'disable_feeds', -1);
add_action('do_feed_rss', 'disable_feeds', -1);
add_action('do_feed_rss2', 'disable_feeds', -1);
add_action('do_feed_atom', 'disable_feeds', -1);
add_action('do_feed_rss2_comments', 'disable_feeds', -1);
add_action('do_feed_atom_comments', 'disable_feeds', -1);
add_action('feed_links_show_posts_feed', '__return_false', -1);
add_action('feed_links_show_comments_feed', '__return_false', -1);
remove_action('wp_head', 'feed_links', 2);
remove_action('wp_head', 'feed_links_extra', 3);


/**
 *
 * Admin Bar
 *
 * Description: Hide the admin bar
 */
add_filter('show_admin_bar', '__return_false');


/**
 *
 * Generator meta
 *
 * Description: Hide the generator meta tag for security reasons
 */
remove_action('wp_head', 'wp_generator');


/**
 *
 * Remove content editor
 *
 * Description: Remove the standard page editor as this theme uses ACF as a page builder
 */
// add_action('init', function () {
//     $post_types = get_post_types();
//     foreach($post_types as $post_type)
//     {
//         remove_post_type_support($post_type, 'editor');
//     }

// },99);

/**
 *
 * Remove comments
 *
 * Description: Remove the comment functionality
 */
add_action('admin_init', function () {
    // Redirect any user trying to access comments page
    global $pagenow;

    if ($pagenow === 'edit-comments.php') {
        wp_redirect(admin_url());
        exit;
    }

    // Remove comments metabox from dashboard
    remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');

    // Disable support for comments and trackbacks in post types
    foreach (get_post_types() as $post_type) {
        if (post_type_supports($post_type, 'comments')) {
            remove_post_type_support($post_type, 'comments');
            remove_post_type_support($post_type, 'trackbacks');
        }
    }
});

// Close comments on the front-end
add_filter('comments_open', '__return_false', 20, 2);
add_filter('pings_open', '__return_false', 20, 2);

// Hide existing comments
add_filter('comments_array', '__return_empty_array', 10, 2);

// Remove comments page in menu
add_action('admin_menu', function () {
    remove_menu_page('edit-comments.php');
});

// Remove comments links from admin bar
add_action('init', function () {
    remove_action('admin_bar_menu', 'wp_admin_bar_comments_menu', 60);
});


/**
 *
 * Remove WP-Embed
 *
 * Description: Remove the wp-embed script from the front end.
 *
 */
add_action( 'wp_footer', function(){
    wp_deregister_script( 'wp-embed' );
} );

/**
 *
 * Post Title Like
 *
 * Description: Add ability to search the post title for any instance of a string.
 * Currently the title search only searches the entire title
 *
 */
add_filter( 'posts_where', function($where, $wp_query){
    global $wpdb;
    if ( $post_title_like = $wp_query->get( 'post_title_like' ) ) {
        $where .= ' AND ' . $wpdb->posts . '.post_title LIKE \'%' . esc_sql( $wpdb->esc_like( $post_title_like ) ) . '%\'';
    }
    return $where;
}, 10, 2 );

/**
 *
 * JPEG Quality
 *
 * Description: Increase the default jpeg quality from 80 - 100
 *
 */
add_filter('jpeg_quality', function($arg){return 100;});

/**
 *
 * Year
 *
 * Description: Add a shortcode to display the current year on the frontend.
 *
 */
function year_shortcode() {
  $year = date('Y');
  return $year;
}
add_shortcode('year', 'year_shortcode');

/**
 * Remove P tags from CF7
 */
add_filter('wpcf7_autop_or_not', '__return_false');


/**
 * Fix for things like CF7
 */
remove_filter( 'rest_wp_navigation_item_schema', array( 'WP_Navigation_Fallback', 'update_wp_navigation_post_schema' ) );


/**
 * Convert Images to WebP on upload
 */
add_filter( 'wp_handle_upload', 'pegasus_handle_upload_convert_to_webp' );
function pegasus_handle_upload_convert_to_webp($upload) {

    $convertAllowed = get_field('convert_images', 'option');

    if(!$convertAllowed) {
        return $upload;
    }

    $accepted_mime_types = ['image/jpeg', 'image/png'];

    if(!in_array( $upload['type'], $accepted_mime_types)) {
        return $upload;
    }

    $file_path = $upload['file'];

    // Bail if ImageMagick or GD is not available
    if(!extension_loaded( 'imagick' ) && !extension_loaded('gd')){
        return $upload;
    }

    $image_editor = wp_get_image_editor( $file_path );

    if(is_wp_error($image_editor)) {
        return $upload;
    }

    $file_info = pathinfo( $file_path );
    $dirname   = $file_info['dirname'];
    $filename  = $file_info['filename'];

    // Create a new file path for the WebP image
    $new_file_path = $dirname . '/' . $filename . '.webp';

    // Attempt to save the image in WebP format
    $saved_image = $image_editor->save( $new_file_path, 'image/webp' );

    if(is_wp_error($saved_image) || !file_exists($saved_image['path'])) {
        return $upload;
    }

    // Replace the uploaded image with the WebP image
    $upload['file'] = $saved_image['path'];
    $upload['url']  = str_replace( basename( $upload['url'] ), basename( $saved_image['path'] ), $upload['url'] );
    $upload['type'] = 'image/webp';

    return $upload;
}

// delete the original image when a WebP image is deleted
add_action( 'delete_attachment', 'pegasus_delete_original_image_when_webp_deleted' );
function pegasus_delete_original_image_when_webp_deleted( $post_id ) {
    $attachment = get_post($post_id);
    $file = get_attached_file($post_id);

    $jpg_file = str_replace(".webp" ,".jpg", $file);
    $jpeg_file = str_replace(".webp" ,".jpeg", $file);
    $png_file = str_replace(".webp" ,".png", $file);

    if ( 'image/webp' === $attachment->post_mime_type ) {
        if (file_exists($jpg_file)) {
            @unlink($jpg_file);
        } elseif (file_exists($jpeg_file)) {
            @unlink($jpeg_file);
        } elseif (file_exists($png_file)) {
            @unlink($png_file);
        }
    }
}

add_filter('acf/format_value/type=wysiwyg', function( $value, $post_id, $field ) {
    return str_replace( '<ul>', '<ul class="content-list">', $value );
}, 10, 3);


add_action('init', function() {
        remove_post_type_support( 'quote', 'editor');
        remove_post_type_support( 'quote', 'excerpt');
        remove_post_type_support( 'quote', 'thumbnail');
   },
   100
);

add_action( 'pre_get_posts', function ( $query ) {
    if ( $query->is_main_query() &&  $query->is_search() ) {
        $query->query_vars['nopaging'] = 1;
        $query->query_vars['posts_per_page'] = -1;
    }
} );

add_filter('acf/load_field/name=menu_background', function ($field) {
    if (get_post_type() === 'post') {
        $field['default_value'] = 'pale-02';
    };
    return $field;
});


add_filter(
    'allowed_block_types_all',
    function ($allowed_blocks) {
        $allowed_blocks[] = 'core/embed';
        return $allowed_blocks;
    },
    20
);

add_filter(
    'render_block',
    function ($block_content, $block){
        // If block is `core/button` we add new content related to the new attribute
        if ( $block['blockName'] === 'core/button' ){
            $attrs = $block['attrs'];
            if ( isset($attrs['openInModal']) && $attrs['openInModal'] ) {
                $modalType = isset($attrs['modalType']) && $attrs['modalType'] ? ucfirst($attrs['modalType']) : 'Full';
                $block_content = str_replace('<a ', '<a data-pegasus-modal="Modal--' . $modalType . '" ', $block_content);
            }

            if ( isset($attrs['smoothScroll']) && $attrs['smoothScroll'] ) {
                $block_content = str_replace('<a ', '<a @click.prevent="document.querySelector(new URL($el.href).hash).scrollIntoView({behavior:\'smooth\'})" ', $block_content);
            }
        } elseif ( $block['blockName'] === 'core/paragraph' ) {
            $processor = new WP_HTML_Tag_Processor( $block_content );

            if ( $processor->next_tag( 'p' ) ) {
                $processor->add_class( 'wp-block-paragraph' );
            }

            $block_content = $processor->get_updated_html();
        } elseif ( $block['blockName'] === 'core/group' ) {
            $attrs = $block['attrs'];
            if ( isset($attrs['loadTransition']) && $attrs['loadTransition'] ) {
                $processor = new WP_HTML_Tag_Processor( $block_content );

                if ( $processor->next_tag() ) {
                    $processor->add_class( 'transition-all' );
                    $processor->add_class( 'duration-500' );
                    $processor->set_attribute( 'x-data', '{shown:false}' );
                    $processor->set_attribute( 'x-intersect.threshold.30', 'shown = true' );
                    $processor->set_attribute( ':class', "shown ? '' : 'opacity-0 translate-y-24'" );
                }

                $block_content = $processor->get_updated_html();
            }
        }

        return $block_content;
    },
    10,
    2
);

add_filter(
    'wp_content_img_tag',
    static function ( $image ) {
            return str_replace( ' sizes="auto, ', ' sizes="', $image );
    }
);
add_filter(
    'wp_get_attachment_image_attributes',
    static function ( $attr ) {
            if ( isset( $attr['sizes'] ) ) {
                    $attr['sizes'] = preg_replace( '/^auto, /', '', $attr['sizes'] );
            }
            return $attr;
    }
);

add_action('admin_init', 'register_view_all_nav_menu_meta_box');
add_filter('wp_setup_nav_menu_item', 'view_all_nav_menu_item_setup');

function register_view_all_nav_menu_meta_box() {
    add_meta_box(
        'view-all-links',
        'View All Link',
        'view_all_nav_menu_meta_box',
        'nav-menus',
        'side',
        'low'
    );
}

function view_all_nav_menu_meta_box() {
    ?>
    <div id="view-all-links" class="posttypediv">
        <div class="tabs-panel tabs-panel-active">
            <ul class="categorychecklist form-no-clear">
                <li>
                    <label class="menu-item-title">
                        <input type="checkbox" class="menu-item-checkbox" name="menu-item[-1][menu-item-object-id]" value="-1"> View All Link
                    </label>
                    <input type="hidden" class="menu-item-type" name="menu-item[-1][menu-item-type]" value="view_all">
                    <input type="hidden" class="menu-item-title" name="menu-item[-1][menu-item-title]" value="View All">
                    <input type="hidden" class="menu-item-url" name="menu-item[-1][menu-item-url]" value="#">
                </li>
            </ul>
        </div>
        <p class="button-controls">
            <span class="add-to-menu">
                <input type="submit" class="button-secondary submit-add-to-menu" value="Add to Menu" name="add-post-type-menu-item" id="submit-view-all-links">
            </span>
        </p>
    </div>
    <?php
}

function view_all_nav_menu_item_setup($menu_item) {
    if ($menu_item->type === 'view_all') {
        $menu_item->type_label = 'View All Link';
        $menu_item->classes[] = 'menu-item-view-all';
    }
    return $menu_item;
}
