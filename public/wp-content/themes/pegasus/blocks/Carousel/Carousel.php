<?php
namespace Gutenberg\Carousel;

use Plugandplay\Pegasus\Carousel\BaseCarousel;
use Timber\Timber;

if (!class_exists(Carousel::class)) {
    /**
     * Class Carousel
     * @author <Pegasus>
     * @package Gutenberg\Carousel
     */
    class Carousel extends BaseCarousel
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
            //Only allow arrows at the bottom
            if(!empty($this->fields['show_arrows'])) {
                $this->fields['arrow_position']['vertical'] = $this->fields['arrow_position']['vertical'] ?? 'bottom';
                $this->fields['arrow_position']['horizontal'] = $this->fields['arrow_position']['horizontal'] ?? 'left';
                $this->fields['arrow_position']['spacing'] = $this->fields['arrow_position']['spacing'] ?? 1;
                $this->fields['arrow_position']['inset'] = $this->fields['arrow_position']['inset'] ?? -5;
                $this->fields['arrow_style']['has_background'] = $this->fields['arrow_style']['has_background'] ?? false;
                $this->fields['arrow_style']['icon_color'] = $this->fields['arrow_style']['has_background'] ? 'light' : 'dark';

                $this->addData([
                    'arrow_position' => $this->fields['arrow_position'],
                    'arrow_style' => $this->fields['arrow_style']
                ]);
            }
            // Put you custom application logic here, and load the data into $this->data.
            // You will reach the data in the template: {{ my_field }} or {{ this.getData().my_field }}
            // $this->addData(Timber::context());
            parent::inflate();
        }
    }
}
