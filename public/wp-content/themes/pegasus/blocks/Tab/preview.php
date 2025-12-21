<?php

\Pegasus\Pegasus::getContainer()->get('Tab', array_merge($block, ['is_preview' => $is_preview]))->renderView();
