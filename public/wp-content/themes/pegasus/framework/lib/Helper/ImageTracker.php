<?php

namespace Pegasus\Helper;

class ImageTracker {
    private static $instance = null;
    private $currentImageIndex = 0;

    private function __construct() {}

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function incrementIndex() {
        return ++$this->currentImageIndex;
    }

    public function getCurrentIndex() {
        return $this->currentImageIndex;
    }

    public function reset() {
        $this->currentImageIndex = 0;
    }
}
