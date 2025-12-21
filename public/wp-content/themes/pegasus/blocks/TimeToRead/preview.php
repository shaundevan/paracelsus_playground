<?php

\Pegasus\Pegasus::getContainer()->get('TimeToRead', array_merge($block, ['is_preview' => $is_preview]))->renderView();
