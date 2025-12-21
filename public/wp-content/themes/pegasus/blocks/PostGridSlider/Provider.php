<?php
namespace Gutenberg\PostGridSlider;

use Gutenberg\PostGridSlider\PostGridSlider;
use Plugandplay\Pegasus\PostGridSlider\Provider as PostGridSliderProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\PostGridSlider;
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
            'PostGridSlider' => PostGridSlider::class,
        ];
    }
}
