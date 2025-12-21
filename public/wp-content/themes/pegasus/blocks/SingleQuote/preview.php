<?php

\Pegasus\Pegasus::getContainer()->get('SingleQuote', array_merge($block, ['is_preview' => $is_preview]))->renderView();
