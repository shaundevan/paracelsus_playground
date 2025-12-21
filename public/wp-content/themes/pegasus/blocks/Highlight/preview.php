<?php

\Pegasus\Pegasus::getContainer()->get('Highlight', array_merge($block, ['is_preview' => $is_preview]))->renderView();
