<?php

\Pegasus\Pegasus::getContainer()->get('Accordion', array_merge($block, ['is_preview' => $is_preview]))->renderView();
