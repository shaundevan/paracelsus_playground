<?php


namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\AbstractPostType;

class FaqModel extends AbstractPostType
{

    protected static array $postTypeRegistrationInfo = [
        'title' => 'Faq',
        'singular' => 'Faq',
        'icon' => 'dashicons-list-view',
        'public' => false,
        'extraArgs' => [
            'show_in_rest' => true,
            'exclude_from_search' => true,
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'supports' => ['title', 'editor', 'custom-fields'],
        ],
    ];

    public static function getPostType(): string
    {
        return 'faq';
    }
}
