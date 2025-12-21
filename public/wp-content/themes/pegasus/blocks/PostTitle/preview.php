<?php

\Pegasus\Pegasus::getContainer()->get('PostTitle', array_merge($block, ['is_preview' => $is_preview]))->renderView();
