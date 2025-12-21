<?php

\Pegasus\Pegasus::getContainer()->get('ModalContent', array_merge($block, ['is_preview' => $is_preview]))->renderView();
