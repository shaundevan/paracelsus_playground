<?php

\Pegasus\Pegasus::getContainer()->get('PostGridSlider', array_merge($block, ['is_preview' => $is_preview]))->renderView();
