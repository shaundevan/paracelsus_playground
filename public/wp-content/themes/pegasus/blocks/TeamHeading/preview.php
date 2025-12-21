<?php

\Pegasus\Pegasus::getContainer()->get('TeamHeading', array_merge($block, ['is_preview' => $is_preview]))->renderView();
