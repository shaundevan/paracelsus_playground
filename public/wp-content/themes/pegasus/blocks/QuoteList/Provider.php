<?php
namespace Gutenberg\QuoteList;

use Gutenberg\QuoteList\QuoteList;
use Plugandplay\Pegasus\PostGridSlider\Provider as PostGridSliderProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\QuoteList;
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
            'QuoteList' => QuoteList::class,
        ];
    }
}
