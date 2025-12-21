<?php

\Pegasus\Pegasus::getContainer()->get('CallToAction', array_merge($block, ['is_preview' => $is_preview]))->renderView();
