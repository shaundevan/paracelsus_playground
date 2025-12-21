<?php

\Pegasus\Pegasus::getContainer()->get('Programme', array_merge($block, ['is_preview' => $is_preview]))->renderView();
