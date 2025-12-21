<?php

\Pegasus\Pegasus::getContainer()->get('Tabs', array_merge($block, ['is_preview' => $is_preview]))->renderView();
