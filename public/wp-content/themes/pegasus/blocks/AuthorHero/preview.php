<?php

\Pegasus\Pegasus::getContainer()->get('AuthorHero', array_merge($block, ['is_preview' => $is_preview]))->renderView();
