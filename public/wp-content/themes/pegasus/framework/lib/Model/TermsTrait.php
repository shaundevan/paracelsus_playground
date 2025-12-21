<?php
namespace Pegasus\Model;

trait TermsTrait
{
    /**
     * @return array
     * @author owendixon
     */
    public function getTerms(): array
    {
        $terms = get_the_terms($this->ID, 'category');
        if ($terms === false || $terms instanceof \WP_Error) {
            return [];
        }

        if (count($terms) === 1 && $terms[0]->slug === 'uncategorized') {
            $terms = [];
        }
        return $terms;
    }
}
