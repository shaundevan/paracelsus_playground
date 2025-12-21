<?php
namespace Pegasus\Helper;

/**
 * Class TaxonomyHelper
 * @author tamasfeiszt
 * @package Pegasus\Helper
 */
class TaxonomyHelper
{
    /**
     * Sorts a flat array of terms hierarchically.
     *
     * @param array $terms
     * @param array $target
     * @param int $parentId
     * @return void
     * @author tamasfeiszt
     */
    public static function sortTermsHierarchically(array &$terms, array &$target, int $parentId = 0): void
    {
        foreach ($terms as $i => $term) {
            if ((int) $term->parent === $parentId) {
                $target[$term->term_id] = $term;
                unset($terms[$i]);
            }
        }

        foreach ($target as $topTerm) {
            $topTerm->children = [];
            static::sortTermsHierarchically($terms, $topTerm->children, $topTerm->term_id);
        }
    }

    /**
     * Collects all terms of a taxonomy and sorts it hierarchically before returning it.
     *
     * @param string $taxonomy
     * @param array $filteredTo
     * @param string $filterBy
     * @return array
     * @author tamasfeiszt
     */
    public static function getTermsHierarchically(string $taxonomy, array $filteredTo = [], string $filterBy = 'slug'): array
    {
        $terms = get_terms([
            'taxonomy' => $taxonomy,
            'hide_empty' => false,
        ]);

        if ($filteredTo) {
            $terms = array_filter($terms, function ($term) use ($filteredTo, $filterBy) {
                if ($filterBy === 'slug') {
                    return in_array($term->slug, $filteredTo);
                } elseif ($filterBy === 'id') {
                    return in_array($term->term_id, $filteredTo);
                }
            });
        }
        $target = [];
        static::sortTermsHierarchically($terms, $target);
        return $target;
    }

    /**
     * Returns all items of the requested level of hierarchically sorted terms, and returns it in a flat array.
     * If $level is 0, it will return the top level terms.
     * If $level is 1, it will return the children of the top level terms and so on.
     * $numberOfItems is the number of items to return. Always needs to be greater than 0.
     *
     * @param array $hierarchyItems
     * @param int $level
     * @param int $numberOfItems
     * @param int $recursion
     * @return array
     * @author tamasfeiszt
     */
    public static function getHierarchyItems(array $hierarchyItems, int $level = 0, int $numberOfItems = 1, int $recursion = 0): array
    {
        $items = [];
        $i = 0;
        foreach ($hierarchyItems as $item) {
            if ($i >= $numberOfItems) {
                break;
            }
            if ($level === $recursion) {
                $items[] = $item;
                $i++;
            } else {
                if (!empty($item->children)) {
                    $items = array_merge($items, static::getHierarchyItems($item->children, $level, $numberOfItems - $i, $recursion + 1));
                }
            }
        }
        return $items;
    }

    /**
     * Returns the terms of a taxonomy from an Elasticsearch aggregation.
     * If $termsOnly is set to true, it will return only the terms, otherwise it will return the terms with the doc_count.
     * $bucket must be an associated array with the term slugs or ids as keys and the doc_count as values.
     * [
     *    'term-slug' => 12,
     *    'term-slug-2' => 5,
     * ]
     *
     * @param array $bucket
     * @param string $taxonomy
     * @param string $taxonomyField
     * @param bool $termsOnly
     * @return array
     * @author tamasfeiszt
     */
    public static function getTermsFromAggregationBucket(array $bucket, string $taxonomy, string $taxonomyField = 'slug', bool $termsOnly = false): array
    {
        $terms = static::getTermsHierarchically($taxonomy, array_keys($bucket), $taxonomyField);
        if ($termsOnly) {
            return $terms;
        }
        return static::setDocCountToTerms($terms, $bucket);
    }

    /**
     * Sets the doc_count to the terms in the array.
     * The $bucket must be an associated array with the term slugs or ids as keys and the doc_count as values.
     * [
     *    'term-slug' => 12,
     *    'term-slug-2' => 5,
     * ]
     * @param array $terms
     * @param array $bucket
     * @return array
     * @author tamasfeiszt
     */
    public static function setDocCountToTerms(array $terms, array $bucket): array
    {
        return array_map(function ($term) use ($bucket) {
            $term->_doc_count = $bucket[$term->slug];
            if (!empty($term->children)) {
                $term->children = static::setDocCountToTerms($term->children, $bucket);
            }
            return $term;
        }, $terms);
    }

    /**
     * @param string $acfField
     * @param string $acfFieldValue
     * @param string $taxonomy
     * @return \WP_Term|null
     * @author tamasfeiszt
     */
    public static function findTermByAcfField(string $acfField, string $acfFieldValue, string $taxonomy): ?\WP_Term
    {
        /* use custom SQL query to get the term by the ACF field to speed up the process*/
        global $wpdb;
        $termId = $wpdb->get_var($wpdb->prepare(
            "SELECT term_id FROM $wpdb->termmeta WHERE meta_key = %s AND meta_value = %s",
            $acfField,
            $acfFieldValue
        ));
        if (!$termId) {
            return null;
        }
        return get_term($termId, $taxonomy);
    }
}
