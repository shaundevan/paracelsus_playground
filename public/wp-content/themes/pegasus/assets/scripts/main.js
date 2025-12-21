import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';
import collapse from '@alpinejs/collapse';
import { PegasusModule, FrameworkAdaptor } from './PegasusModule';
import { AlpineAdaptor } from './PegasusModule/adaptors/AlpineAdaptor';

/**
 * Import all JS from the global folder and all compiled global blocks
 */
import.meta.glob('./global/**/*.js',{ eager: true });
import.meta.glob('../../parts/**/*.js',{ eager: true });
import './block-imports/scripts.js';

/**
 * Add FrameworkAdaptor to managed the lazy loading of framework specific modules via the PegasusModule
 */
FrameworkAdaptor.use('alpine', new AlpineAdaptor(Alpine));

/**
 * Register the PegasusModule as a custom element
 */
window.customElements.define('pegasus-module', PegasusModule);

/**
 * Initialise Alpine JS and the intersect and collapse plugin
 */
Alpine.plugin(intersect)
Alpine.plugin(collapse)
window.Alpine = Alpine
Alpine.start();
