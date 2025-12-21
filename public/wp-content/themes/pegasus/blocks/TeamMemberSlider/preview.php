<?php

\Pegasus\Pegasus::getContainer()->get('TeamMemberSlider', array_merge($block, ['is_preview' => $is_preview]))->renderView();
