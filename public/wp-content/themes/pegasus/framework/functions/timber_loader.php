<?php

namespace Pegasus\TimberLoader;

use Pegasus\Helper\Pegasus_Template_Tags;
use Pegasus\Pegasus_Navigation;
use Pegasus\Pegasus_Twig_Extension;

add_filter('timber/twig', function ($twig) {
    $twig->addExtension(new Pegasus_Twig_Extension());
    $twig->addExtension(new Pegasus_Template_Tags());
    $twig->addExtension(new Pegasus_Navigation());
    return $twig;
});

add_filter('timber/locations', function ($paths) {
    $paths = array_merge($paths, [
        'PegasusCore' => [ABSPATH . '/wp-content/themes/pegasus/vendor/plug-and-play-design'],
        'PegasusTheme' => [ABSPATH . '/wp-content/themes/pegasus'],
    ]);

    return $paths;
});
