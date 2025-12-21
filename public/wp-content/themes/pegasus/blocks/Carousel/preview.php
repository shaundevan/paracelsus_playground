<?php

\Pegasus\Pegasus::getContainer()->get('Carousel', array_merge($block, ['is_preview' => $is_preview]))->renderView();
