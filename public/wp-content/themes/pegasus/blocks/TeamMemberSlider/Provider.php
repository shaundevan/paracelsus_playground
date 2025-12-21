<?php
namespace Gutenberg\TeamMemberSlider;

use Gutenberg\TeamMemberSlider\TeamMemberSlider;
use Plugandplay\Pegasus\PostGridSlider\Provider as PostGridSliderProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\TeamMemberSlider;
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
            'TeamMemberSlider' => TeamMemberSlider::class,
        ];
    }
}
