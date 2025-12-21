<?php
namespace Gutenberg\Container;

use Gutenberg\Container\Container;
use Plugandplay\Pegasus\Container\Provider as ContainerProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\Container;
 */
class Provider extends ContainerProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'Container' => Container::class,
        ];
    }
}
