<?php

\Pegasus\Pegasus::getContainer()->get('SearchResults', array_merge($block, ['is_preview' => $is_preview]))->renderView();
