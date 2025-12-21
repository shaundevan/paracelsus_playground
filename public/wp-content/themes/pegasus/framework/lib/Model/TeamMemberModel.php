<?php

namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\AbstractPostType;

class TeamMemberModel extends AbstractPostType
{

    protected static array $postTypeRegistrationInfo = [
        'title' => 'Team Members',
        'singular' => 'Team Member',
        'icon' => 'dashicons-groups',
        'public' => true,
        'extraArgs' => [
            'show_in_rest' => true,
            'exclude_from_search' => true
        ],
    ];

    public static function getPostType(): string
    {
        return 'team-member';
    }
}
