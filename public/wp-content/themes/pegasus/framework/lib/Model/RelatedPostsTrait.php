<?php
namespace Pegasus\Model;
use Timber\Timber;
use Pegasus\Pegasus;  // Add this line to import the Pegasus class

/**
 * Dependency: Terms trait
 *
 * @author owendixon
 */
trait RelatedPostsTrait
{
    /**
     * @param int $defaultLimit
     * @return array|\Timber\Post[]
     * @author owendixon
     */
    public function getRelatedPosts(int $defaultLimit = 5, $args = [])
    {
        $defaultArgs = [
            'post_type' => $this->post_type,
            'posts_per_page' => $defaultLimit,
        ];

        $pickRelatedPosts = get_field('posts_to_show', $this->id);

        if(!empty($pickRelatedPosts)){
            $defaultArgs['post__in'] = $pickRelatedPosts;
            $defaultArgs['orderby'] = 'post__in';
        } else {
            $terms= $this->getTerms();
            if (!empty($terms)) {
                $termSlugs = array_map(function ($term) {
                    return $term->slug;
                }, $terms);
                if (!empty($termSlugs)) {
                    $defaultArgs['tax_query'] = [
                        'relation' => 'OR',
                        [
                            'taxonomy' => 'category',
                            'terms' => $termSlugs,
                            'field' => 'slug',
                        ],
                        [
                            'taxonomy' => 'post_tag',
                            'terms' => $termSlugs,
                            'field' => 'slug',
                        ],
                    ];
                }
            }
        }

        $args = wp_parse_args($args, $defaultArgs);

        $collection = Pegasus::getContainer()->get('ModelFactory')->findByArgs($args);
        return $collection->getItems();
    }

    /**
     * Calculates the estimated reading time for the post content
     * 
     * @return int The estimated reading time in minutes
     */
    public function getReadTime()
    {
        $content = $this->content;
        $wordCount = str_word_count(strip_tags($content));
        $wordsPerMinute = 200;
        $minutes = ceil($wordCount / $wordsPerMinute);
        return $minutes;
    }
}
