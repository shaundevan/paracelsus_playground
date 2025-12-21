<?php

\Pegasus\Pegasus::getContainer()->get('ExpandingImages', array_merge($block, ['is_preview' => $is_preview]))->renderView();
