import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';
import collapse from '@alpinejs/collapse';
import Flickity from 'flickity';
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

/**
 * Expose Flickity globally so components can access it
 */
window.Flickity = Flickity

// FORCE INCLUDE: Explicitly import components that Vite incorrectly tree-shakes
import { QuoteSlider } from '../../blocks/QuoteSlider/script.js';
import { TeamGridSlider } from '../../blocks/TeamMemberSlider/script.js';
// Reference exports to force Vite inclusion
window._forceInclude = { QuoteSlider, TeamGridSlider };

// Signal that bundle components have been registered
// NOTE: This MUST come AFTER window.Alpine and window.Flickity are set!
window.__bundleComponentsLoaded = true;
console.log('[Pegasus] Bundle components registered');

// Dispatch custom event for more reliable detection
window.dispatchEvent(new CustomEvent('pegasus:bundle-ready'));

// DO NOT call Alpine.start() here - it's handled by layout.tsx timing system
// Alpine.start() is called after all component registrations are complete
