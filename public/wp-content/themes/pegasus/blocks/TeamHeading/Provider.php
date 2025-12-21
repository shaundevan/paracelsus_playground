<?php
namespace Gutenberg\TeamHeading;

use Gutenberg\TeamHeading\TeamHeading;
use Plugandplay\Pegasus\Core\AbstractProvider;;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\TeamHeading;
 */
class Provider extends AbstractProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'TeamHeading' => TeamHeading::class,
        ];
    }

    /**
     * Returns an array of ID => class pairs
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredPostTypeModels(): array
    {
        return [];
    }

    /**
     * Returns an array of ID => class pairs. The class must have a static method called `getInstance`
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredServices(): array
    {
        return [];
    }

    /**
     * Returns an array of ID => Closure pairs
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredFactories(): array
    {
        return [];
    }
}
