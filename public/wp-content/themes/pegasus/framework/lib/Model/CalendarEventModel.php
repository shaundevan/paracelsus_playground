<?php


namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\AbstractPostType;

class CalendarEventModel extends AbstractPostType
{

    protected static array $postTypeRegistrationInfo = [
        'title' => 'Calendar Events',
        'singular' => 'Calendar Event',
        'icon' => 'dashicons-calendar',
        'public' => true,
        'extraArgs' => [
            'show_in_rest' => true,
            'exclude_from_search' => true,
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'supports' => ['title', 'editor', 'custom-fields'],
        ],
    ];

    public static function getPostType(): string
    {
        return 'event';
    }
}
