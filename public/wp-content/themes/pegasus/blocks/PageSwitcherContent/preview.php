<?php

\Pegasus\Pegasus::getContainer()->get('PageSwitcherContent', array_merge($block, ['is_preview' => $is_preview]))->renderView();
