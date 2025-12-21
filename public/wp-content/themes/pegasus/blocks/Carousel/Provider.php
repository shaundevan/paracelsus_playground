<?php
namespace Gutenberg\Carousel;

use Gutenberg\Carousel\Carousel;
use Plugandplay\Pegasus\Carousel\Provider as CarouselProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\Carousel;
 */
class Provider extends CarouselProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'Carousel' => Carousel::class,
        ];
    }
}
