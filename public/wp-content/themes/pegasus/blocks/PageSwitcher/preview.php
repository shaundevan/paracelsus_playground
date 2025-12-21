<?php

\Pegasus\Pegasus::getContainer()->get('PageSwitcher', array_merge($block, ['is_preview' => $is_preview]))->renderView();
