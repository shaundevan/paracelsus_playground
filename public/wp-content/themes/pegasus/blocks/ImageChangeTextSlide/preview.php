<?php

\Pegasus\Pegasus::getContainer()->get('ImageChangeTextSlide', array_merge($block, ['is_preview' => $is_preview]))->renderView();
