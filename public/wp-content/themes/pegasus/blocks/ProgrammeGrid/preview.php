<?php

\Pegasus\Pegasus::getContainer()->get('ProgrammeGrid', array_merge($block, ['is_preview' => $is_preview]))->renderView();
