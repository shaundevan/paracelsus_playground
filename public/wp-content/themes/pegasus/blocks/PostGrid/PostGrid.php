<?php
namespace Gutenberg\PostGrid;

use Plugandplay\Pegasus\PostGrid\BasePostGrid;
use Timber\Timber;

if (!class_exists(PostGrid::class)) {
    /**
     * Class PostGrid
     * @author <Pegasus>
     * @package Gutenberg\PostGrid
     */
    class PostGrid extends BasePostGrid
    {
        /**
        * @param array $block
        * @param array $fields
        * @param string $viewTemplate
        * @author <Pegasus>
        */
        public function __construct(array $block, array $fields = [])
        {
            // Custom dependency injection here
            parent::__construct($block, $fields);
        }

        /**
         * Override buildQuery to fix tax_query merging and order handling
         *
         * FIXES:
         * 1. Deep merges tax_query instead of replacing it (ACF + URL filters combine)
         * 2. Configurable default order via ACF field
         * 3. Handles all three population modes (automatically, pick_posts, global_posts)
         *
         * @param array $args Additional query arguments
         * @return array Complete WP_Query arguments
         */
        public function buildQuery($args = []): array
        {
            global $paged;
            if (!isset($paged) || !$paged) {
                $paged = 1;
            }

            $defaultOrder = $this->fields['default_order'] ?? 'DESC';

            $defaultArgs = [
                'post_status' => ['publish'],
                'posts_per_page' => isset($this->fields['posts_per_page']) && $this->fields['posts_per_page'] > 0 ? (int)$this->fields['posts_per_page'] : 10,
                'paged' => $paged,
            ];

            // Handle all three population modes
            if($this->getPopulationMethod() === 'automatically') {
                // Mode 1: Query specific post type
                $defaultArgs['post_type'] = $this->fields['post_type'] ?? 'post';
                $defaultArgs['orderby'] = $this->fields['order_by'] ?? 'date';
                $defaultArgs['order'] = $this->fields['order'] ?? $defaultOrder;
            } elseif($this->getPopulationMethod() === 'pick_posts') {
                // Mode 2: Manual post picking
                $defaultArgs['post_type'] = 'any';
                $defaultArgs['orderby'] = 'post__in';
                $defaultArgs['post__in'] = $this->pickPosts();
            } else {
                // Mode 3: global_posts - Query all public post types with order
                $defaultArgs['post_type'] = $this->fields['post_type'] ?? get_post_types(['public' => true]);
                $defaultArgs['orderby'] = $this->fields['order_by'] ?? 'date';
                $defaultArgs['order'] = $this->fields['order'] ?? $defaultOrder;
            }

            // Build date query
            $dateFields = !empty($this->fields['posted_dates']) ? $this->fields['posted_dates'] : null;
            if ($dateFields) {
                $dateQuery = ['relation' => 'AND'];
                $hasDates = false;
                foreach ($dateFields as $dateField) {
                    $dateQuery = array_merge($dateQuery, [
                        $dateField['qualifier'] => $dateField['date']
                    ]);
                    $hasDates = true;
                }
                if ($hasDates) {
                    $defaultArgs['date_query'] = $dateQuery;
                }
            }

            // Build tax query from ACF category field
            $taxFields = !empty($this->fields['category']) ? $this->fields['category'] : null;
            if ($taxFields) {
                $taxQuery = ['relation' => 'OR'];
                $terms = [];
                foreach ($taxFields as $taxField) {
                    $terms[$taxField->taxonomy] = array_merge($terms[$taxField->taxonomy] ?? [], [$taxField->slug]);
                }
                foreach ($terms as $key => $term) {
                    $taxQuery = array_merge($taxQuery, [
                        [
                            'taxonomy' => $key,
                            'field' => 'slug',
                            'terms' => $term
                        ]
                    ]);
                }
                if (!empty($terms)) {
                    $defaultArgs['tax_query'] = $taxQuery;
                }
            }

            // Merge with additional args
            $query = wp_parse_args($args, $defaultArgs);

            // FIX: Deep merge tax_query when filtering (CRITICAL BUG FIX)
            if($this->isFiltering()) {
                $filterArgs = $this->getFilterArgs();

                // Deep merge tax_query if both ACF and URL filters exist
                if (!empty($query['tax_query']) && !empty($filterArgs['tax_query'])) {
                    $query['tax_query'] = [
                        'relation' => 'AND',
                        $query['tax_query'],
                        $filterArgs['tax_query']
                    ];
                    unset($filterArgs['tax_query']);
                }

                // Deep merge meta_query if both exist
                if (!empty($query['meta_query']) && !empty($filterArgs['meta_query'])) {
                    $query['meta_query'] = [
                        'relation' => 'AND',
                        $query['meta_query'],
                        $filterArgs['meta_query']
                    ];
                    unset($filterArgs['meta_query']);
                }

                // Preserve order settings
                $preserveOrder = $query['order'] ?? null;
                $preserveOrderBy = $query['orderby'] ?? null;

                // Merge remaining filter args
                $query = array_merge($query, $filterArgs);

                // Restore order
                if ($preserveOrder) $query['order'] = $preserveOrder;
                if ($preserveOrderBy) $query['orderby'] = $preserveOrderBy;
            }

            return $query;
        }
    }
}
