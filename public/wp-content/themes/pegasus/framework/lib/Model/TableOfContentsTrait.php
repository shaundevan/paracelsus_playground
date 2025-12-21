<?php

namespace Pegasus\Model;

/**
 * Trait TableOfContentsTrait
 * @package Pegasus\Model
 */
trait TableOfContentsTrait
{
    /**
     * generate Table of Contents from H2 and H3
     *
     * @return array
     */
    public function getTableOfContents(): array
    {
        $content = $this->content ?? '';

        if (empty($content)) {
            return [];
        }

        $toc = [];

        preg_match_all('/<h([23])(?:[^>]*)>(.*?)<\/h[23]>/i', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $level = (int)$match[1];
            $title = strip_tags($match[2]);
            $id = sanitize_title($title);

            $toc[] = [
                'level' => $level,
                'title' => $title,
                'id' => $id
            ];
        }

        return $toc;
    }
}