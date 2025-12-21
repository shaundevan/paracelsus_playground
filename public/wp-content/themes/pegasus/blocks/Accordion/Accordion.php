<?php
namespace Gutenberg\Accordion;

use Plugandplay\Pegasus\Accordion\BaseAccordion;
use Timber\Timber;

if (!class_exists(Accordion::class)) {
    /**
     * Class Accordion
     * @author <Pegasus>
     * @package Gutenberg\Accordion
     */
    class Accordion extends BaseAccordion
    {
        /**
        * @param array $block
        * @param array $fields
        * @param string $viewTemplate
        * @author <Pegasus>
        */
        public function __construct(array $block, array $fields = [])
        {
            // Custom dependency injection here
            parent::__construct($block, $fields);
        }

        /**
         * @return void
         * @author <Pegasus>
         */
        public function inflate(): void
        {
            // Put you custom application logic here, and load the data into $this->data.
            // You will reach the data in the template: {{ my_field }} or {{ this.getData().my_field }}
            // $this->addData(Timber::context());
            parent::inflate();

            $this->addData([
                'allowedBlocks' => esc_attr(wp_json_encode(['pegasus/accordionpanel', 'pegasus/accordionlink']))
            ]);
        }
    }
}
