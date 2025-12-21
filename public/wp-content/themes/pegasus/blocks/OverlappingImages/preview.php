<?php

\Pegasus\Pegasus::getContainer()->get('OverlappingImages', array_merge($block, ['is_preview' => $is_preview]))->renderView();
