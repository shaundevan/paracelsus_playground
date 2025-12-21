<?php
/**
 * Pegasus functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Pegasus
 */

namespace Pegasus;

use Timber\Timber;
use Plugandplay\Pegasus\Core\DotEnv;

require_once( __DIR__ . '/vendor/autoload.php' );

$envFile = '.env';
DotEnv::load(realpath(ABSPATH . '../' . $envFile));

new Theme();

/**
 * Class Theme
 * @author tamasfeiszt
 * @package Pegasus
 */
class Theme
{

    /**
    * Contructor
    *
    * Initialise all of the theme functions
    *
    * @since 2.0
    *
    */
    public function __construct()
    {
        //Timber::init();
        $this->constants(); // Define all the constant variables for this theme.
        $this->init_theme(); // Initialise the theme. Sets up a hook that CREATES A NEW INSTANCE OF THE PEGASUS CLASS.
        $this->load_theme_functions(); // Load all the main functions for this theme.
        $this->load_theme_helpers(); // Load all the helper functions for this theme.
        $this->ACF_updates(); // Load ACF classes
        $this->load_theme_core(); //This one should not be needed as we use namespaces
        $this->loadAcfJsons(); // Register ACF hooks for loading jsons and saving them
        $this->init_fonts(); // Initialize font management
    }

    /**
    * Constants
    *
    * Define all of the constant variables for this theme.
    *
    * @since 2.0
    *
    */
    public function constants()
    {
        $pegasus_parent_theme = get_file_data(
    		get_template_directory() . '/style.css',
    		['Version'],
    		get_template()
    	);

        define('THEME_ROOT', str_replace(ABSPATH, '/', dirname(__FILE__)));
        define('THEME_DIR', get_template_directory());
        define('THEME_DIR_URI', get_template_directory_uri());
        define('THEME_VERSION', $pegasus_parent_theme[0]);
        define('THEME_NAME', 'Pegasus');
        define('THEME_DIST', THEME_DIR . '/dist');
        define('THEME_DIST_URI', THEME_DIR_URI . '/dist');
        define('THEME_FONTS', THEME_DIR . '/assets/fonts');
        define('THEME_FONTS_URI', THEME_DIR_URI . '/assets/fonts');
        define('THEME_FRAMEWORK', THEME_DIR . '/framework');
        define('THEME_FRAMEWORK_URI', THEME_DIR_URI . '/framework');
        define('THEME_FUNCTIONS', THEME_FRAMEWORK . '/functions');
        define('THEME_HELPERS', THEME_FRAMEWORK . '/helpers');
        define('THEME_LIBS', THEME_FRAMEWORK . '/lib');
        define('THEME_LIBS_URI', THEME_FRAMEWORK_URI . '/lib');
        define('THEME_BUILD_DIR', THEME_DIR . '/build');
        define('THEME_BUILD_URI', THEME_DIR_URI . '/build');
        define('THEME_BLOCKS', THEME_DIR . '/blocks');
        define('THEME_BLOCKS_URI', THEME_DIR_URI . '/blocks');
        define('THEME_PARTS', THEME_DIR . '/parts');
        define('THEME_PARTS_URI', THEME_DIR_URI . '/parts');
        define('THEME_HMR_HOST', 'http://localhost:5173');
        define('THEME_HMR_URI', THEME_HMR_HOST . THEME_ROOT);

    }

    /**
     * Init Theme
     *
     * Description: Initialise the theme.
     *
     * @since 2.0
     *
     */
    public function init_theme()
    {
        add_action('after_setup_theme', [Pegasus::class, 'init'], 101);
    }

    /**
     * ACF Updates
     *
     * Description: Modify acf for this theme.
     *
     * @since 2.0
     *
     */
    public function ACF_updates()
    {
        add_action('acf/include_field_types', function(){
            $custom_field_files = glob(THEME_LIBS . '/acf/custom_fields/**/*.php');
            foreach($custom_field_files as $file){
                include($file);
            }
        }, 1);
    }

    /**
    * Functions
    *
    * Initialise all of the main functions for this theme.
    *
    * @since 2.0
    *
    */
    public static function load_theme_functions()
    {
        $function_files = glob(THEME_FUNCTIONS . '/*.php');
        foreach($function_files as $file){
            include_once $file;
        };
    }

    /**
     * Helpers
     *
     * Initialise all of the helper functions for this theme.
     *
     * @since 2.0
     *
     */
    public static function load_theme_helpers()
    {
        $function_files = glob(THEME_HELPERS . '/*.php');
        foreach($function_files as $file){
            include_once $file;
        };
    }


    /**
    IN theory this not needed any more, as we use the container to create instances from the classes
     */
    public static function load_theme_core()
    {
        $function_files = glob(THEME_LIBS . '/*.php');
        foreach($function_files as $file){
            include_once $file;
        };
    }

    /**
     * Initialize font management
     *
     * @return void
     */
    public function init_fonts()
    {
        new \Pegasus\Assets\Fonts();
    }

    /**
     * Register ACF hooks for loading jsons and saving them
     * @return void
     * @author tamasfeiszt
     */
    public static function loadAcfJsons()
    {
        /**
         * Setting loading paths for ACF jsons
         */
        add_filter('acf/settings/load_json', function () {
            // Cache the directory scanning
            $cache_key = 'acf_json_directories';
            $dir = wp_cache_get($cache_key);

            if (false === $dir) {
            $dir = [];
            // Add paths to ACF jsons (In the package provider you must insert a path, and labeled that to "acf_path")
            $acfPaths = Pegasus::getContainer()->getTagged('acf_path');
            foreach ($acfPaths as $path) {
                $dir = array_merge($dir, [Pegasus::getContainer()->get($path)]);
            }
            // Blocks acf paths
            $blocks = Pegasus::getContainer()->getTagged('block');
            foreach ($blocks as $block) {
                $dir = array_merge($dir, [Pegasus::getContainer()->get($block, [])::getPath() . '/acf-json']);
            }
            // Theme acf paths
            $dir = array_merge($dir, glob(THEME_BLOCKS, GLOB_ONLYDIR)); // Blocks directory root
            // And their subdirectories for overridden blocks or acf jsons.
            $dir = array_merge($dir, glob(THEME_BLOCKS . '/*', GLOB_ONLYDIR)); // Subdirectories
            // Parts Dir
            $dir = array_merge($dir, glob(THEME_PARTS . '/*', GLOB_ONLYDIR)); // Parts directories

                // Cache for 1 hour
                wp_cache_set($cache_key, $dir, '', 3600);
            }

            return $dir;
        }, 10,1);

        /**
         * Extending the component if necessary (if a core block is saved)
         * Saving file name
         */
        add_filter('acf/json/save_file_name', function( $filename, $post, $load_path ) {
            // Clear cache when saving ACF fields
            wp_cache_delete('acf_json_directories');

            $blockConstructor = new BlockConstructor($post, $filename, $load_path);
            $blockConstructor->createBlock();
            return $filename;
        }, 10, 5);
    }
}




/**
 * filters for table of contents
 */
add_action('init', function() {
    add_filter('the_content', function($content) {
        if (!is_single()) {
            return $content;
        }

        $content = preg_replace_callback(
            '/<h([23])([^>]*)>(.*?)<\/h[23]>/i',
            function($matches) {
                $level = $matches[1];
                $attributes = $matches[2];
                $title = strip_tags($matches[3]);
                $id = sanitize_title($title);

                // Sprawdź czy ID już istnieje
                if (strpos($attributes, 'id=') === false) {
                    $attributes .= ' id="' . $id . '"';
                }

                return '<h' . $level . $attributes . '>' . $matches[3] . '</h' . $level . '>';
            },
            $content
        );

        return $content;
    }, 10);
});