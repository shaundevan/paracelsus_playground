<?php

\Pegasus\Pegasus::getContainer()->get('TeamMemberCard', array_merge($block, ['is_preview' => $is_preview]))->renderView();
