<?php
namespace Gutenberg\QuoteSlider;

use Gutenberg\QuoteSlider\QuoteSlider;
use Plugandplay\Pegasus\PostGridSlider\Provider as PostGridSliderProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\QuoteSlider;
 */
class Provider extends PostGridSliderProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'QuoteSlider' => QuoteSlider::class,
        ];
    }
}
