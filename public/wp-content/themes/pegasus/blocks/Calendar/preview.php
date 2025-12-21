<?php

\Pegasus\Pegasus::getContainer()->get('Calendar', array_merge($block, ['is_preview' => $is_preview]))->renderView();
