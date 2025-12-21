<?php

\Pegasus\Pegasus::getContainer()->get('ImageChangeTextSlider', array_merge($block, ['is_preview' => $is_preview]))->renderView();
