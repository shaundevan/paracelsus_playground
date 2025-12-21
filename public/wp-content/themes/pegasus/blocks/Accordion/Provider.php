<?php
namespace Gutenberg\Accordion;

use Gutenberg\Accordion\Accordion;
use Plugandplay\Pegasus\Accordion\Provider as AccordionProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\Accordion;
 */
class Provider extends AccordionProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'Accordion' => Accordion::class,
        ];
    }
}
