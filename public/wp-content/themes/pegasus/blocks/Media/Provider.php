<?php
namespace Gutenberg\Media;

use Gutenberg\Media\Media;
use Plugandplay\Pegasus\Media\Provider as MediaProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\Media;
 */
class Provider extends MediaProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'Media' => Media::class,
        ];
    }
}
