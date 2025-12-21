<?php

use Plugandplay\Pegasus\Core\AssetResolver;
use Pegasus\Pegasus;

/**
 *
 * Register and enqueue scripts and styles for this theme
 *
 * @package Pegasus
 * @since 2.0
 */
function pegasus_enqueue_scripts_and_styles()
{
    // Create HubSpot loader only when needed - no automatic loading on every page
    wp_register_script('hubspot-loader', false, [], false, true);
    wp_add_inline_script('hubspot-loader', '
        // HubSpot loader - only loads when explicitly called
        window.hubSpotLoader = {
            promise: null,
            load: function() {
                if (!this.promise) {
                    this.promise = new Promise((resolve, reject) => {
                        if (window.hbspt) {
                            resolve(window.hbspt);
                            return;
                        }

                        const script = document.createElement("script");
                        script.src = "https://js-eu1.hsforms.net/forms/embed/v2.js";
                        script.async = true;
                        
                        script.onload = () => {
                            if (window.hbspt) {
                                resolve(window.hbspt);
                            } else {
                                reject(new Error("HubSpot failed to load"));
                            }
                        };
                        
                        script.onerror = () => {
                            reject(new Error("Failed to load HubSpot script"));
                        };
                        
                        document.body.appendChild(script);
                    });
                }
                return this.promise;
            }
        };
    ');
    wp_enqueue_script('hubspot-loader');

    // Main script with hubspot-loader as dependency
    wp_register_script('Main', AssetResolver::getInstance()->resolve('scripts/main.js'), ['hubspot-loader'], Pegasus::getContainer()->get('Config')->get('version'), true);
    wp_enqueue_script('Main');

    /**
     * Global Stylesheet
     *
     * Description: Global stylesheet for this theme
     *
     * @since 2.0
     */
    wp_register_style('Main', AssetResolver::getInstance()->resolve('styles/main.scss'), [], Pegasus::getContainer()->get('Config')->get('version'));
    wp_enqueue_style('Main');

    if(!is_admin()){
        wp_deregister_style('dashicons');
        wp_dequeue_style('pdfemb-pdf-embedder-viewer-style');
        wp_dequeue_style('wpml-blocks');
        wp_dequeue_style('wpml-legacy-vertical-list-0');
        wp_dequeue_style('wpml-tm-admin-bar');
        
        // Optimize block library loading - remove render blockers
        // pegasus_optimize_block_library_loading();
    }

};
add_action('wp_enqueue_scripts', 'pegasus_enqueue_scripts_and_styles');
/**
 *
 * Register and enqueue scripts and styles for the block editor
 * 
 * Description: We want all the same styles and scripts as the front end, plus editor specific styles
 *
 * @package Pegasus
 * @since 2.0
 */
function pegasus_enqueue_editor_scripts_and_styles()
{

    /**
     * Main
     *
     * Description: Registers and Enqueues main.js to site footer. This is
     *              the main site JS file.
     *
     * @since 2.0
     */
    
     wp_register_script('Main', AssetResolver::getInstance()->resolve('scripts/main.js'), [], Pegasus::getContainer()->get('Config')->get('version'), true);
     wp_enqueue_script('Main');
 
     /**
      * Global Stylesheet
      *
      * Description: Global stylesheet for this theme
      *
      * @since 2.0
      */
     wp_register_style('Main', AssetResolver::getInstance()->resolve('styles/main.scss'), [], Pegasus::getContainer()->get('Config')->get('version'));
     wp_enqueue_style('Main');

    /**
     * Editor Stylesheet
     *
     * Description: Styles specific to the editor
     *
     * @since 2.0
     */
    wp_register_style('Editor', THEME_DIR_URI.'/dist/assets/styles/editor.css', [], Pegasus::getContainer()->get('Config')->get('version'));
    wp_enqueue_style('Editor');

};
add_action('enqueue_block_editor_assets', 'pegasus_enqueue_editor_scripts_and_styles');


add_filter('script_loader_tag', function($tag, $handle, $src) {
    return AssetResolver::getInstance()->module($tag, $handle, $src);
}, 8, 3 );