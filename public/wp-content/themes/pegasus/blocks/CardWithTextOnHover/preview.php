<?php

\Pegasus\Pegasus::getContainer()->get('CardWithTextOnHover', array_merge($block, ['is_preview' => $is_preview]))->renderView();
