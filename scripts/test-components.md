# Component Testing Guide - Chrome DevTools

## Quick Test Script

Copy and paste this into Chrome DevTools Console to test all components:

```javascript
// === COMPREHENSIVE COMPONENT TEST ===
(async function() {
  console.log('🧪 Starting Component Tests...\n');
  
  // Wait for page to be fully loaded
  if (document.readyState !== 'complete') {
    await new Promise(resolve => window.addEventListener('load', resolve));
  }
  
  // Wait a bit for Alpine to initialize
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const results = {
    alpine: {},
    components: {},
    accordion: {},
    navigation: {},
    other: {}
  };
  
  // 1. Test Alpine.js
  console.log('1️⃣ Testing Alpine.js...');
  results.alpine.available = typeof window.Alpine !== 'undefined';
  results.alpine.dataFunction = typeof window.Alpine?.data === 'function';
  results.alpine.started = document.body?.hasAttribute('data-alpine-started');
  console.log('   ✅ Alpine available:', results.alpine.available);
  console.log('   ✅ Alpine.data function:', results.alpine.dataFunction);
  console.log('   ✅ Alpine started:', results.alpine.started);
  console.log('');
  
  // 2. Test Component Registration
  console.log('2️⃣ Testing Component Registration...');
  const criticalComponents = ['accordionPanel', 'paracelsusApp', 'navigation', 'videoBanner'];
  criticalComponents.forEach(name => {
    const registered = typeof window.Alpine?.data(name) === 'function';
    results.components[name] = registered;
    console.log(`   ${registered ? '✅' : '❌'} ${name}:`, registered ? 'REGISTERED' : 'NOT REGISTERED');
  });
  console.log('');
  
  // 3. Test Accordion
  console.log('3️⃣ Testing Accordion...');
  const accordions = document.querySelectorAll('[x-data="accordionPanel"]');
  results.accordion.count = accordions.length;
  console.log('   📊 Accordion panels found:', accordions.length);
  
  if (accordions.length > 0) {
    const firstAccordion = accordions[0];
    const button = firstAccordion.querySelector('button[x-on\\:click*="panelOpen"], button[\\@click*="panelOpen"]');
    const content = firstAccordion.querySelector('[x-show="panelOpen"]');
    
    results.accordion.hasButton = !!button;
    results.accordion.hasContent = !!content;
    results.accordion.hasAlpineData = !!firstAccordion._x_dataStack;
    
    if (firstAccordion._x_dataStack) {
      const panelOpen = firstAccordion._x_dataStack[0]?.panelOpen;
      results.accordion.initialState = panelOpen;
      console.log('   ✅ Button found:', !!button);
      console.log('   ✅ Content element found:', !!content);
      console.log('   ✅ Alpine data stack exists:', true);
      console.log('   📊 Initial panelOpen state:', panelOpen);
      
      // Test click
      if (button) {
        console.log('   🖱️  Testing click...');
        const beforeState = firstAccordion._x_dataStack[0]?.panelOpen;
        button.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        const afterState = firstAccordion._x_dataStack[0]?.panelOpen;
        results.accordion.clickWorks = beforeState !== afterState;
        console.log(`   ${results.accordion.clickWorks ? '✅' : '❌'} Click toggles state:`, results.accordion.clickWorks);
        console.log('      Before:', beforeState, '→ After:', afterState);
      }
    } else {
      console.log('   ❌ Alpine data stack missing - component not initialized');
      results.accordion.clickWorks = false;
    }
  } else {
    console.log('   ⚠️  No accordion panels found on page');
  }
  console.log('');
  
  // 4. Test Navigation
  console.log('4️⃣ Testing Navigation...');
  const navElement = document.querySelector('[x-data="navigation"]');
  results.navigation.exists = !!navElement;
  if (navElement) {
    results.navigation.hasAlpineData = !!navElement._x_dataStack;
    if (navElement._x_dataStack) {
      const navState = navElement._x_dataStack[0];
      results.navigation.stateKeys = Object.keys(navState || {});
      console.log('   ✅ Navigation element found');
      console.log('   ✅ Alpine data stack exists');
      console.log('   📊 State keys:', results.navigation.stateKeys);
    } else {
      console.log('   ❌ Navigation Alpine data stack missing');
    }
  } else {
    console.log('   ⚠️  Navigation element not found');
  }
  console.log('');
  
  // 5. Test ParacelsusApp (body)
  console.log('5️⃣ Testing ParacelsusApp (body)...');
  const bodyData = document.body._x_dataStack;
  results.paracelsusApp.hasData = !!bodyData;
  if (bodyData) {
    const appState = bodyData[0];
    results.paracelsusApp.stateKeys = Object.keys(appState || {});
    console.log('   ✅ Body x-data processed');
    console.log('   📊 State keys:', results.paracelsusApp.stateKeys);
  } else {
    console.log('   ❌ Body x-data not processed');
  }
  console.log('');
  
  // 6. Test Other Components with x-collapse
  console.log('6️⃣ Testing Other Components (x-collapse)...');
  const collapseElements = document.querySelectorAll('[x-collapse]');
  results.other.collapseElements = collapseElements.length;
  console.log('   📊 Elements with x-collapse:', collapseElements.length);
  
  let collapseWorking = 0;
  collapseElements.forEach((el, idx) => {
    const parent = el.closest('[x-data]');
    if (parent?._x_dataStack) {
      collapseWorking++;
    }
  });
  results.other.collapseWorking = collapseWorking;
  console.log('   ✅ x-collapse elements with Alpine data:', collapseWorking, '/', collapseElements.length);
  console.log('');
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  const allComponentsRegistered = Object.values(results.components).every(v => v === true);
  console.log(`Components Registered: ${allComponentsRegistered ? '✅' : '❌'}`);
  console.log(`Accordion Working: ${results.accordion.clickWorks ? '✅' : '❌'}`);
  console.log(`Navigation Working: ${results.navigation.hasAlpineData ? '✅' : '❌'}`);
  console.log(`ParacelsusApp Working: ${results.paracelsusApp.hasData ? '✅' : '❌'}`);
  console.log(`x-collapse Plugin: ${collapseElements.length > 0 ? '✅' : '⚠️'}`);
  console.log('');
  console.log('Full results:', results);
  
  return results;
})();
```

## Manual Testing Steps

### 1. Test Accordion
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Find an accordion: `document.querySelector('[x-data="accordionPanel"]')`
4. Check state: `document.querySelector('[x-data="accordionPanel"]')._x_dataStack[0].panelOpen`
5. Click button: `document.querySelector('[x-data="accordionPanel"] button').click()`
6. Verify state changed: `document.querySelector('[x-data="accordionPanel"]')._x_dataStack[0].panelOpen`

### 2. Test Navigation
1. Check navigation element: `document.querySelector('[x-data="navigation"]')`
2. Check state: `document.querySelector('[x-data="navigation"]')._x_dataStack[0]`
3. Try opening menu (if visible)

### 3. Test Scroll Behavior
1. Scroll page
2. Check body state: `document.body._x_dataStack[0].goingUp`
3. Verify header behavior changes

### 4. Test Other Components
1. Find ReadMore: `document.querySelectorAll('[x-collapse]')`
2. Verify they have Alpine data stacks
3. Test interactions

## Expected Results

✅ **All components should be registered**
✅ **Accordion should toggle on click**
✅ **Navigation should have Alpine data**
✅ **Body should have paracelsusApp data**
✅ **x-collapse elements should work**

## Troubleshooting

If accordion doesn't work:
1. Check if `accordionPanel` is registered: `typeof Alpine.data('accordionPanel') === 'function'`
2. Check if Alpine started: `document.body.hasAttribute('data-alpine-started')`
3. Check console for errors
4. Verify bundle loaded: `typeof window.Alpine !== 'undefined'`

If other components break:
1. Check if they're still registered
2. Verify no duplicate registrations
3. Check console for errors
4. Verify timing - components should register before Alpine.start()



