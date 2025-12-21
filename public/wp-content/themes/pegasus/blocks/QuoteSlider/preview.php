<?php

\Pegasus\Pegasus::getContainer()->get('QuoteSlider', array_merge($block, ['is_preview' => $is_preview]))->renderView();
