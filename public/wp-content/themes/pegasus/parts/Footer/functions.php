<?php

namespace Pegasus\Components;

use Timber\Timber;
use Pegasus\PartManager;

$manager = PartManager::getInstance();

$data = [];

$footerFields = get_field('footer_settings', 'option') ?: [];
$contactInfo = get_field('contact_information', 'options') ?: [];
$socialNetworks = get_field('social_networks', 'options') ?: [];

foreach ($socialNetworks as $item) {
    if ($item['network'] === 'whatsapp') {
        $data['whatsapp'] = $item['url'];
    } else if ($item['network'] === 'telegram') {
        $data['telegram'] = $item['url'];
    }
}
$data = array_merge($footerFields, $contactInfo, $socialNetworks, $data);

$data['footerMenu'] = Timber::get_menu('footer', ['depth' => 2]);

$manager->setPartData($key, $data);
