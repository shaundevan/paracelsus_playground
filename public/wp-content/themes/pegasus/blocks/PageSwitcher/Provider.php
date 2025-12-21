<?php
namespace Gutenberg\PageSwitcher;

use Gutenberg\PageSwitcher\PageSwitcher;
use Plugandplay\Pegasus\Core\AbstractProvider;;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\PageSwitcher;
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
            'PageSwitcher' => PageSwitcher::class,
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
