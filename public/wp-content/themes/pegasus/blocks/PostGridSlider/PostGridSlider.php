<?php
namespace Gutenberg\PostGridSlider;

use Plugandplay\Pegasus\PostGridSlider\BasePostGridSlider;
use Timber\Timber;

if (!class_exists(PostGridSlider::class)) {
    /**
     * Class PostGridSlider
     * @author <Pegasus>
     * @package Gutenberg\PostGridSlider
     */
    class PostGridSlider extends BasePostGridSlider
    {
        /**
        * @param array $block
        * @param array $fields
        * @param string $viewTemplate
        * @author <Pegasus>
        */
        public function __construct(array $block, array $fields = [])
        {
            // We need to modify the block data directly
            if (isset($block['data'])) {
                // Force how_to_populate to global_posts
                $block['data']['how_to_populate'] = 'global_posts';

                // Get global posts from ACF options
                if (function_exists('get_field') && get_field_object('global_posts', 'option')) {
                    $global_posts = get_field('global_posts', 'option');

                    // Only use global posts if they exist
                    if (!empty($global_posts)) {
                        $block['data']['posts'] = $global_posts;
                        error_log('PostGridSlider: Successfully populated with ' . count($global_posts) . ' global posts');
                    } else {
                        error_log('PostGridSlider: No global posts found in options');
                    }
                }
            }

            // Pass the modified block to parent constructor
            parent::__construct($block, $fields);

            // Register ACF filters for this block
            $this->registerACFFilters();
        }

        /**
         * Register ACF filters for this block's fields
         *
         * @return void
         */
        protected function registerACFFilters(): void
        {
            // General filter for all fields
            add_filter('acf/update_value', [$this, 'modifyPostGridSliderValues'], 10, 4);
            add_filter('acf/load_value', [$this, 'loadPostGridSliderValues'], 10, 3);

            // You can keep these specific filters if you want more targeted control
            add_filter('acf/update_value/name=how_to_populate', [$this, 'forceGlobalPosts'], 10, 4);
            add_filter('acf/update_value/name=posts_per_page', [$this, 'limitPostsPerPage'], 10, 4);
        }

        /**
         * Modify PostGridSlider values before saving
         * @param mixed $value The field value
         * @param int $post_id The post ID
         * @param array $field The field array
         * @param mixed $original The original value
         * @return mixed The modified value
         */
        public function modifyPostGridSliderValues($value, $post_id, $field, $original) {
            // Only target the PostGridSlider block fields
            if (strpos($field['key'], 'field_663dd') === 0) {
                // Force 'global_posts' for how_to_populate field
                if ($field['name'] === 'how_to_populate') {
                    return 'global_posts';
                }

                // No longer need to modify the posts field - the block will use global posts

                // Modify post_per_page to enforce minimum/maximum
                if ($field['name'] === 'posts_per_page') {
                    // Ensure posts_per_page is between 3 and 10
                    return max(3, min(10, intval($value)));
                }
            }

            return $value;
        }

        /**
         * Load PostGridSlider values when displaying
         * @param mixed $value The field value
         * @param int $post_id The post ID
         * @param array $field The field array
         * @return mixed The modified value
         */
        public function loadPostGridSliderValues($value, $post_id, $field) {
            // Check if this field belongs to PostGridSlider block
            if (strpos($field['key'], 'field_663dd') === 0) {

                // Modify how_to_populate to always be 'global_posts' when displaying
                if ($field['name'] === 'how_to_populate') {
                    return 'global_posts';
                }

                // No need to modify posts field - the block will handle this

                // Set default posts per page if not set
                if ($field['name'] === 'posts_per_page' && empty($value)) {
                    return 6; // Default to 6 posts
                }
            }

            return $value;
        }

        /**
         * Force the how_to_populate field to use 'global_posts'
         *
         * @param mixed $value The field value
         * @param mixed $post_id The post ID where the value is saved
         * @param array $field The field array
         * @param mixed $original The original value
         * @return string The modified value
         */
        public function forceGlobalPosts($value, $post_id, $field, $original)
        {
            // Always return 'global_posts' regardless of input
            return 'global_posts';
        }

        /**
         * Ensure posts_per_page is within acceptable limits
         *
         * @param mixed $value The field value`
         * @param mixed $post_id The post ID where the value is saved
         * @param array $field The field array
         * @param mixed $original The original value
         * @return int The modified value
         */
        public function limitPostsPerPage($value, $post_id, $field, $original)
        {
            // Ensure minimum of 3 and maximum of 12 posts per page
            return max(3, min(12, intval($value)));
        }

        /**
         * @return void
         * @author <Pegasus>
         */
        public function inflate(): void
        {
            $this->fields['how_to_populate'] = 'global_posts';

            if (function_exists('get_field') && get_field_object('global_posts', 'option')) {
                $global_posts = get_field('global_posts', 'option');

                if (!empty($global_posts)) {

                    shuffle($global_posts);

                    $this->fields['posts'] = $global_posts;
                    $this->fields['posts_per_page'] = 30;
                }
            }

            $this->additionalArgs = [
                'post_type' => get_post_types(['public' => true]),
            ];

            //Only allow arrows at the bottom
            if(!empty($this->fields['show_arrows'])) {
                $this->fields['arrow_position']['vertical'] = 'bottom';
                $this->fields['arrow_position']['horizontal'] = $this->fields['arrow_position']['horizontal'] ?? 'center';
                $this->fields['arrow_position']['spacing'] = $this->fields['arrow_position']['spacing'] ?? 1;
                $this->fields['arrow_position']['inset'] = $this->fields['arrow_position']['inset'] ?? -5;

                $this->addData([
                    'arrow_position' => $this->fields['arrow_position']
                ]);
            }

            parent::inflate();
        }
    }
}
