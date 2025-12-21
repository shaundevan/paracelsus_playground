<?php

\Pegasus\Pegasus::getContainer()->get('Container', array_merge($block, ['is_preview' => $is_preview]))->renderView();
