<?php

\Pegasus\Pegasus::getContainer()->get('HubSpotForm', array_merge($block, ['is_preview' => $is_preview]))->renderView();
