<?php

\Pegasus\Pegasus::getContainer()->get('Media', array_merge($block, ['is_preview' => $is_preview]))->renderView();
