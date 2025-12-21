<?php
namespace Gutenberg\PostGrid;

use Gutenberg\PostGrid\PostGrid;
use Plugandplay\Pegasus\PostGrid\Provider as PostGridProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\PostGrid;
 */
class Provider extends PostGridProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'PostGrid' => PostGrid::class,
        ];
    }
}
