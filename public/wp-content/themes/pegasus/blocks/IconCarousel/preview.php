<?php

\Pegasus\Pegasus::getContainer()->get('IconCarousel', array_merge($block, ['is_preview' => $is_preview]))->renderView();
