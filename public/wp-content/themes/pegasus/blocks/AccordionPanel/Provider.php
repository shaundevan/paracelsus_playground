<?php
namespace Gutenberg\AccordionPanel;

use Gutenberg\AccordionPanel\AccordionPanel;
use Plugandplay\Pegasus\AccordionPanel\Provider as AccordionPanelProvider;

/**
 * Class Provider
 * @author <Pegasus>
 * @package Gutenberg\AccordionPanel;
 */
class Provider extends AccordionPanelProvider
{
    /**
     * @return string[]
     * @author <Pegasus>
     */
    protected function registeredBlocks(): array
    {
        return [
            'AccordionPanel' => AccordionPanel::class,
        ];
    }
}
