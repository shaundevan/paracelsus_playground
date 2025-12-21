<?php

\Pegasus\Pegasus::getContainer()->get('BlurRevealSlide', array_merge($block, ['is_preview' => $is_preview]))->renderView();
