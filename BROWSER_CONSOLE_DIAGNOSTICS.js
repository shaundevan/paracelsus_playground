/**
 * Browser Console Diagnostics for Flickity & Accordion Issues
 * 
 * Copy and paste these into your browser console to diagnose issues
 */

// ============================================
// 1. QUICK STATUS CHECK
// ============================================
console.log('=== QUICK STATUS CHECK ===');
console.log('Alpine available:', typeof window.Alpine !== 'undefined');
console.log('Alpine started:', document.body?.hasAttribute('data-alpine-started'));
console.log('Components ready:', window.__pegasusComponentsReady);
console.log('Flickity available:', typeof window.Flickity !== 'undefined');
console.log('accordionPanel registered:', typeof window.Alpine?.data('accordionPanel') === 'function');

// ============================================
// 2. ACCORDION SPECIFIC DIAGNOSTICS
// ============================================
console.log('\n=== ACCORDION DIAGNOSTICS ===');

// Find all accordion elements
const accordions = document.querySelectorAll('[x-data="accordionPanel"]');
console.log('Accordion elements found:', accordions.length);

accordions.forEach((accordion, index) => {
    console.log(`\n--- Accordion ${index + 1} ---`);
    console.log('Element:', accordion);
    console.log('Alpine data stack:', accordion._x_dataStack);
    
    if (accordion._x_dataStack && accordion._x_dataStack[0]) {
        console.log('Panel open state:', accordion._x_dataStack[0].panelOpen);
    }
    
    const button = accordion.querySelector('button');
    console.log('Button found:', !!button);
    console.log('Button element:', button);
    
    const content = accordion.querySelector('[x-show]');
    console.log('Content element:', content);
    if (content) {
        console.log('Content visible:', window.getComputedStyle(content).display !== 'none');
        console.log('Content has x-collapse:', content.hasAttribute('x-collapse'));
    }
});

// ============================================
// 3. FLICKITY DIAGNOSTICS
// ============================================
console.log('\n=== FLICKITY DIAGNOSTICS ===');

// Find all slider containers
const sliderContainers = document.querySelectorAll('.ImageChangeTextSlider__slider, .QuoteSlider__slider, .TeamMemberSlider__slider');
console.log('Slider containers found:', sliderContainers.length);

sliderContainers.forEach((container, index) => {
    console.log(`\n--- Slider ${index + 1} ---`);
    console.log('Container:', container);
    console.log('Has Flickity instance:', !!(container._flickity || container.flickity));
    
    if (container._flickity || container.flickity) {
        const flickity = container._flickity || container.flickity;
        console.log('Flickity instance:', flickity);
        console.log('Selected index:', flickity.selectedIndex);
        console.log('Cells:', flickity.cells.length);
    } else {
        console.log('❌ NO FLICKITY INSTANCE - Slider not initialized');
    }
    
    const slides = container.querySelectorAll('.slide');
    console.log('Slides found:', slides.length);
});

// ============================================
// 4. ALPINE INITIALIZATION TIMING
// ============================================
console.log('\n=== ALPINE INITIALIZATION TIMING ===');

// Check if alpine:init has fired
let alpineInitFired = false;
const checkInit = () => {
    if (window.Alpine && typeof window.Alpine.data === 'function') {
        console.log('Alpine.data is available');
        console.log('Registered components:', Object.keys(window.Alpine._x_dataStack || {}));
        
        // Check specific components
        const components = ['accordionPanel', 'paracelsusApp', 'navigation', 'imageChangeTextSlider', 'quoteSlider', 'teamGridSlider'];
        components.forEach(comp => {
            const registered = typeof window.Alpine.data(comp) === 'function';
            console.log(`${comp}: ${registered ? '✅' : '❌'} ${registered ? 'registered' : 'NOT registered'}`);
        });
    } else {
        console.log('❌ Alpine.data not available yet');
    }
};

checkInit();

// Monitor for alpine:init event
document.addEventListener('alpine:init', () => {
    alpineInitFired = true;
    console.log('✅ alpine:init event fired');
    checkInit();
}, { once: true });

// ============================================
// 5. TEST ACCORDION CLICK
// ============================================
console.log('\n=== TEST ACCORDION CLICK ===');
console.log('To test accordion, run: testAccordionClick(0)');

window.testAccordionClick = function(index = 0) {
    const accordions = document.querySelectorAll('[x-data="accordionPanel"]');
    if (accordions.length === 0) {
        console.error('No accordions found');
        return;
    }
    
    const accordion = accordions[index];
    if (!accordion) {
        console.error(`Accordion at index ${index} not found`);
        return;
    }
    
    const button = accordion.querySelector('button');
    if (!button) {
        console.error('Button not found in accordion');
        return;
    }
    
    console.log('Before click - Panel open:', accordion._x_dataStack?.[0]?.panelOpen);
    console.log('Clicking button...');
    button.click();
    
    setTimeout(() => {
        console.log('After click - Panel open:', accordion._x_dataStack?.[0]?.panelOpen);
        const content = accordion.querySelector('[x-show]');
        if (content) {
            console.log('Content visible:', window.getComputedStyle(content).display !== 'none');
        }
    }, 100);
};

// ============================================
// 6. CHECK FOR ERRORS
// ============================================
console.log('\n=== ERROR CHECK ===');

// Check console for errors
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
    errorCount++;
    originalError.apply(console, args);
    if (args.some(arg => typeof arg === 'string' && (arg.includes('Alpine') || arg.includes('Flickity') || arg.includes('accordion')))) {
        console.log('⚠️ Relevant error detected:', args);
    }
};

setTimeout(() => {
    console.log(`Total errors logged: ${errorCount}`);
    console.error = originalError;
}, 2000);

// ============================================
// 7. BUNDLE LOADING CHECK
// ============================================
console.log('\n=== BUNDLE LOADING CHECK ===');

const bundleScript = document.querySelector('script[src*="dist/C-nlNhNL.js"], script[src*="dist/"]');
if (bundleScript) {
    console.log('Bundle script found:', bundleScript.src);
    console.log('Bundle loaded:', bundleScript.hasAttribute('data-loaded') || 'unknown');
} else {
    console.log('❌ Bundle script not found in DOM');
}

// Check network timing
if (window.performance && window.performance.getEntriesByType) {
    const scripts = window.performance.getEntriesByType('resource').filter(r => r.name.includes('dist/'));
    scripts.forEach(script => {
        console.log(`Script: ${script.name}`);
        console.log(`  Load time: ${script.duration.toFixed(2)}ms`);
        console.log(`  Start time: ${script.startTime.toFixed(2)}ms`);
    });
}

// ============================================
// SUMMARY
// ============================================
console.log('\n=== DIAGNOSTIC SUMMARY ===');
console.log('Run these additional checks:');
console.log('1. testAccordionClick(0) - Test first accordion');
console.log('2. Check Network tab for bundle load errors');
console.log('3. Check Console tab for Alpine/Flickity errors');
console.log('4. Inspect accordion element in Elements tab');
console.log('5. Check if x-data attribute is being processed by Alpine');

