<?php

namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\AbstractPostType;

class AuthorsModel extends AbstractPostType
{

    protected static array $postTypeRegistrationInfo = [
        'title' => 'Authors',
        'singular' => 'Author',
        'icon' => 'dashicons-groups',
        'public' => true,
        'extraArgs' => [
            'show_in_rest' => true,
            'exclude_from_search' => true
        ],
    ];

    public static function getPostType(): string
    {
        return 'authors';
    }
}
