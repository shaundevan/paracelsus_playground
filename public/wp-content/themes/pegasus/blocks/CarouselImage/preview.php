<?php

\Pegasus\Pegasus::getContainer()->get('CarouselImage', array_merge($block, ['is_preview' => $is_preview]))->renderView();
