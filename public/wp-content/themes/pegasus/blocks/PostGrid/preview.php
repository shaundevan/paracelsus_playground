<?php

\Pegasus\Pegasus::getContainer()->get('PostGrid', array_merge($block, ['is_preview' => $is_preview]))->renderView();
