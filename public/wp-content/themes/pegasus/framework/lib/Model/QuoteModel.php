<?php

namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\AbstractPostType;

class QuoteModel extends AbstractPostType
{

    protected static array $postTypeRegistrationInfo = [
        'title' => 'Quotes',
        'singular' => 'Quote',
        'icon' => 'dashicons-format-quote',
        'public' => true,
        'extraArgs' => [
            'show_in_rest' => true,
            'exclude_from_search' => true
        ],
    ];

    public static function getPostType(): string
    {
        return 'quote';
    }
}
