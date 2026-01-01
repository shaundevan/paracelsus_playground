// Diagnostic script to check component registration and timing
// Run this in Chrome DevTools console to check current state

(function() {
  console.log('=== COMPONENT REGISTRATION DIAGNOSTICS ===');
  console.log('');
  
  // Check Alpine availability
  console.log('1. Alpine.js Status:');
  console.log('   Alpine available:', typeof window.Alpine !== 'undefined');
  console.log('   Alpine.data function:', typeof window.Alpine?.data === 'function');
  console.log('   Alpine.start function:', typeof window.Alpine?.start === 'function');
  console.log('   Alpine started:', document.body?.hasAttribute('data-alpine-started'));
  console.log('');
  
  // Check critical components
  console.log('2. Component Registration Status:');
  const criticalComponents = [
    'accordionPanel',
    'paracelsusApp', 
    'navigation',
    'videoBanner'
  ];
  
  criticalComponents.forEach(componentName => {
    const isRegistered = typeof window.Alpine?.data(componentName) === 'function';
    console.log(`   ${componentName}:`, isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED');
  });
  console.log('');
  
  // Check plugins
  console.log('3. Plugin Status:');
  // Check if collapse plugin is available (x-collapse directive should work)
  const testElement = document.createElement('div');
  testElement.setAttribute('x-collapse', '');
  const hasCollapse = testElement.hasAttribute('x-collapse');
  console.log('   x-collapse directive supported:', hasCollapse);
  console.log('');
  
  // Check accordion elements
  console.log('4. Accordion Elements:');
  const accordions = document.querySelectorAll('[x-data="accordionPanel"]');
  console.log('   Accordion panels found:', accordions.length);
  
  if (accordions.length > 0) {
    const firstAccordion = accordions[0];
    const button = firstAccordion.querySelector('button[x-on\\:click*="panelOpen"]');
    console.log('   First accordion button found:', !!button);
    
    // Check if Alpine has processed it
    const alpineData = firstAccordion._x_dataStack;
    console.log('   Alpine data stack exists:', !!alpineData);
    console.log('   panelOpen state:', alpineData?.[0]?.panelOpen);
    
    // Check click handlers
    const clickHandlers = button?._x_attributeCleanups || [];
    console.log('   Click handlers attached:', clickHandlers.length > 0);
  }
  console.log('');
  
  // Check timing
  console.log('5. Timing Status:');
  console.log('   Components ready flag:', window.__pegasusComponentsReady);
  console.log('   Alpine start queue length:', window.__alpineStartQueue?.length || 0);
  console.log('');
  
  // Check other components using x-collapse
  console.log('6. Other Components Using x-collapse:');
  const collapseElements = document.querySelectorAll('[x-collapse]');
  console.log('   Elements with x-collapse:', collapseElements.length);
  collapseElements.forEach((el, idx) => {
    const parent = el.closest('[x-data]');
    const xData = parent?.getAttribute('x-data');
    console.log(`   Element ${idx + 1}:`, xData || 'inline x-data');
  });
  console.log('');
  
  // Check navigation
  console.log('7. Navigation Component:');
  const navElement = document.querySelector('[x-data="navigation"]');
  console.log('   Navigation element found:', !!navElement);
  if (navElement) {
    const navData = navElement._x_dataStack;
    console.log('   Navigation data stack:', !!navData);
    console.log('   Navigation state:', navData?.[0] ? Object.keys(navData[0]) : 'none');
  }
  console.log('');
  
  // Check paracelsusApp
  console.log('8. ParacelsusApp Component:');
  const bodyData = document.body._x_dataStack;
  console.log('   Body x-data processed:', !!bodyData);
  console.log('   ParacelsusApp state:', bodyData?.[0] ? Object.keys(bodyData[0]) : 'none');
  console.log('');
  
  console.log('=== END DIAGNOSTICS ===');
  console.log('');
  console.log('To test accordion:');
  console.log('1. Find an accordion button: document.querySelector(\'[x-data="accordionPanel"] button\')');
  console.log('2. Click it: document.querySelector(\'[x-data="accordionPanel"] button\').click()');
  console.log('3. Check if panelOpen changed: document.querySelector(\'[x-data="accordionPanel"]\')._x_dataStack[0].panelOpen');
})();




