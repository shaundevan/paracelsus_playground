<?php

\Pegasus\Pegasus::getContainer()->get('VideoBanner', array_merge($block, ['is_preview' => $is_preview]))->renderView();
