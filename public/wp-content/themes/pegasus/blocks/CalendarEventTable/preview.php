<?php

\Pegasus\Pegasus::getContainer()->get('CalendarEventTable', array_merge($block, ['is_preview' => $is_preview]))->renderView();
