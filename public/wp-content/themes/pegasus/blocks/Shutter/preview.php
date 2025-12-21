<?php

\Pegasus\Pegasus::getContainer()->get('Shutter', array_merge($block, ['is_preview' => $is_preview]))->renderView();
