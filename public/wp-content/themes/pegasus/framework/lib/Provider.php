<?php
namespace Pegasus;

use Plugandplay\Pegasus\Core\AbstractProvider;
use Pegasus\Model\PegasusImage;
use Pegasus\Model\TeamMemberModel;
use Pegasus\Model\QuoteModel;
use Pegasus\Model\PostModel;
use Pegasus\Model\CalendarEventModel;
use Pegasus\Model\AuthorsModel;
use Pegasus\Model\FaqModel;
/**
 * Class Provider
 * @author tamasfeiszt
 * @package Pegasus
 */
class Provider extends AbstractProvider
{
    /**
     * @return array
     * @author tamasfeiszt
     */
    protected function registeredBlocks(): array
    {
        return [];
    }

    /**
     * @return string[]
     * @author tamasfeiszt
     */
    protected function registeredPostTypeModels(): array
    {
        return [
            'TeamMember' => TeamMemberModel::class,
            'Quote' => QuoteModel::class,
            'CalendarEvent' => CalendarEventModel::class,
            'Authors' => AuthorsModel::class,
            'Faq' => FaqModel::class,
            'Post' => PostModel::class
        ];


    }

    /**
     * @return array
     * @author tamasfeiszt
     */
    protected function registeredServices(): array
    {
        return [
        ];
    }

    /**
     * @return array
     * @author tamasfeiszt
     */
    protected function registeredFactories(): array
    {
        return [
            'PegasusImage' => PegasusImage::class
        ];
    }
}