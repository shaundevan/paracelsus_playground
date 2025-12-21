<?php

\Pegasus\Pegasus::getContainer()->get('FeaturedPost', array_merge($block, ['is_preview' => $is_preview]))->renderView();
