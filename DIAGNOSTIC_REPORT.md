# Flickity & Accordion Diagnostic Report

## Executive Summary

This report diagnoses issues with **Flickity sliders** and **Alpine.js accordion components** that are not working properly. The accordion uses Alpine.js (not Flickity directly), but both share similar initialization timing issues.

---

## 1. Flickity Issues

### 1.1 Inconsistent Flickity Reference Usage

**Problem**: Components use different methods to access Flickity, causing potential module scope issues.

| Component | File | Usage | Status |
|-----------|------|-------|--------|
| ImageChangeTextSlider | `blocks/ImageChangeTextSlider/script.js:102` | `new window.Flickity(...)` | ✅ Correct |
| QuoteSlider | `blocks/QuoteSlider/script.js:72` | `new Flickity(...)` | ❌ Uses imported Flickity |
| TeamMemberSlider | `blocks/TeamMemberSlider/script.js:60` | `new Flickity(...)` | ❌ Uses imported Flickity |

**Impact**: When Flickity is bundled, the imported `Flickity` may not be the same instance as `window.Flickity`, causing initialization failures.

**Root Cause**: 
- `main.js` exposes Flickity globally: `window.Flickity = Flickity` (line 35)
- Some components import Flickity directly: `import Flickity from "flickity"`
- In bundled environments, the imported instance may differ from the global instance

### 1.2 Flickity Initialization Status

**Current State** (from previous diagnostic):
- Flickity Global: ✅ Available (`window.Flickity` exists)
- Flickity Instances: ❌ 0 instances found (NONE initialized)
- Slider Containers: ✅ 17 containers found with proper DOM structure
- Issue: All sliders have Flickity DOM structure but NO JavaScript instances

**Possible Causes**:
1. Components initialize before Flickity is globally available
2. Imported Flickity is undefined in component scope
3. Errors are being silently caught
4. Timing issue with bundle loading

---

## 2. Accordion Issues (Alpine.js)

### 2.1 Accordion Component Structure

**Location**: `vendor/plug-and-play-design/pegasus-one-accordion-panel/src/script.js`

**Registration Method**:
```javascript
document.addEventListener('alpine:init', () => {
    Alpine.data('accordionPanel', () => new BaseAccordionPanel());
});
```

**HTML Usage**:
```html
<div x-data="accordionPanel">
  <button x-on:click="panelOpen = !panelOpen">
  <div x-show="panelOpen" x-collapse>
```

### 2.2 Alpine.js Initialization Sequence

**Current Flow** (from `app/layout.tsx`):

1. **Alpine Interceptor Script** (line 38-44)
   - Intercepts `Alpine.start()` before bundle loads
   - Queues `Alpine.start()` calls until components are ready

2. **Bundle Load** (line 46-50)
   - Loads `/wp-content/themes/pegasus/dist/C-nlNhNL.js`
   - Contains: Alpine.js, plugins, Flickity, and all component scripts
   - `main.js` calls `Alpine.start()` immediately (line 37)

3. **Bundle Handler** (line 52-104)
   - Waits for bundle to load
   - Checks if `window.Alpine` exists
   - Sets `__pegasusComponentsReady = true` after 100ms delay
   - Executes queued `Alpine.start()` calls

4. **Component Registration** (line 109-260)
   - Registers custom components (`paracelsusApp`, `navigation`, `videoBanner`)
   - Listens for `alpine:init` event

### 2.3 Potential Timing Issues

**Problem 1: Race Condition with `alpine:init` Event**

The accordion script registers via:
```javascript
document.addEventListener('alpine:init', () => {
    Alpine.data('accordionPanel', () => new BaseAccordionPanel());
});
```

**Timeline Analysis**:
1. Bundle loads → `main.js` executes
2. `main.js` line 37: `Alpine.start()` is called
3. BUT: `Alpine.start()` is intercepted and queued
4. Bundle handler waits 100ms, then executes queued `Alpine.start()`
5. **Issue**: `alpine:init` event fires when `Alpine.start()` is called
6. If accordion script hasn't loaded yet, the listener won't fire

**Problem 2: Eager Import Timing**

The accordion script is imported in `block-imports/scripts.js`:
```javascript
import '../../../vendor/plug-and-play-design/pegasus-one-accordion-panel/src/script.js';
```

This is an **eager import** (via `import.meta.glob` with `eager: true` in `main.js` line 11).

**Potential Issue**: Even though it's eager, the `alpine:init` listener might not be attached before Alpine tries to start.

**Problem 3: 100ms Delay May Be Insufficient**

The bundle handler waits 100ms before marking components as ready:
```javascript
setTimeout(() => {
    window.__pegasusComponentsReady = true;
    // Execute queued Alpine.start()
}, 100);
```

If the bundle is large or the browser is slow, 100ms might not be enough for all `alpine:init` listeners to be registered.

### 2.4 Alpine.js Collapse Plugin

**Requirement**: Accordion uses `x-collapse` directive, which requires `@alpinejs/collapse` plugin.

**Status Check**:
- ✅ Plugin imported: `main.js` line 3: `import collapse from '@alpinejs/collapse'`
- ✅ Plugin registered: `main.js` line 28: `Alpine.plugin(collapse)`

**Status**: Plugin should be available.

---

## 3. Root Cause Analysis

### 3.1 Primary Issues

1. **Flickity Inconsistency**
   - Mixed usage of `window.Flickity` vs imported `Flickity`
   - May cause initialization failures in bundled environment

2. **Alpine.js Timing Race Condition**
   - Complex interception logic may cause `alpine:init` listeners to miss the event
   - 100ms delay may be insufficient for all components to register
   - Eager imports may not guarantee execution order

3. **Missing Error Handling**
   - No try/catch around Flickity initialization
   - No error logging for Alpine component registration
   - Silent failures make debugging difficult

4. **Bundle Loading Sequence**
   - Components may initialize before bundle fully loads
   - Alpine may start before all components register
   - React hydration may interfere with Alpine initialization

### 3.2 Specific Accordion Failure Points

**DOM Path Provided**:
```
div[2] > main#content > article#page-147 > section.Accordion > 
div > div.acf-innerblock-container > div[1] > div.Accordion__Title > 
button > div > svg
```

**Expected Behavior**:
- Clicking the button should toggle `panelOpen`
- `x-show="panelOpen"` should show/hide content
- `x-collapse` should animate the transition

**Possible Failure Scenarios**:

1. **`accordionPanel` not registered**
   - `x-data="accordionPanel"` fails because component doesn't exist
   - Alpine throws error or silently fails
   - Button click does nothing

2. **`alpine:init` listener missed**
   - Accordion script loads after `alpine:init` fires
   - Component never registers
   - `x-data="accordionPanel"` is invalid

3. **Alpine not started**
   - Interception logic prevents Alpine from starting
   - Components never initialize
   - All Alpine directives fail

4. **Collapse plugin not loaded**
   - `x-collapse` directive not recognized
   - Content shows/hides but no animation
   - May cause layout issues

---

## 4. Diagnostic Checklist

### 4.1 Browser Console Checks

Run these in the browser console to diagnose:

```javascript
// Check if Alpine is available
console.log('Alpine available:', typeof window.Alpine !== 'undefined');
console.log('Alpine started:', document.body.hasAttribute('data-alpine-started'));

// Check if accordionPanel is registered
console.log('accordionPanel registered:', typeof window.Alpine?.data('accordionPanel') === 'function');

// Check if Flickity is available
console.log('Flickity available:', typeof window.Flickity !== 'undefined');

// Check component readiness
console.log('Components ready:', window.__pegasusComponentsReady);

// Check for Alpine errors
console.log('Alpine instance:', window.Alpine);
```

### 4.2 DOM Inspection

1. **Find accordion element**:
   ```javascript
   const accordion = document.querySelector('[x-data="accordionPanel"]');
   console.log('Accordion element:', accordion);
   ```

2. **Check Alpine data**:
   ```javascript
   if (accordion) {
       console.log('Alpine data:', accordion._x_dataStack);
       console.log('Panel open:', accordion._x_dataStack?.[0]?.panelOpen);
   }
   ```

3. **Check button click handler**:
   ```javascript
   const button = accordion?.querySelector('button');
   console.log('Button:', button);
   console.log('Click handler:', button?._x_attributeCleanups);
   ```

### 4.3 Network Tab Checks

1. Verify bundle loads: `/wp-content/themes/pegasus/dist/C-nlNhNL.js`
2. Check load time and size
3. Verify no 404 errors for component scripts

### 4.4 Timing Checks

```javascript
// Check when components register
document.addEventListener('alpine:init', () => {
    console.log('alpine:init fired at:', Date.now());
    console.log('accordionPanel available:', typeof Alpine.data('accordionPanel') === 'function');
}, { once: true });

// Check when Alpine starts
const observer = new MutationObserver(() => {
    if (document.body.hasAttribute('data-alpine-started')) {
        console.log('Alpine started at:', Date.now());
        observer.disconnect();
    }
});
observer.observe(document.body, { attributes: true });
```

---

## 5. Recommended Fixes

### 5.1 Flickity Fixes

**Priority: HIGH**

1. **Standardize Flickity Usage**
   - Change `QuoteSlider` to use `window.Flickity`
   - Change `TeamMemberSlider` to use `window.Flickity`
   - Remove direct Flickity imports if not needed

2. **Add Error Handling**
   - Wrap all `new Flickity()` calls in try/catch
   - Log errors to console
   - Verify Flickity is available before calling

### 5.2 Accordion/Alpine Fixes

**Priority: CRITICAL**

1. **Ensure `alpine:init` Fires Before Start**
   - Verify accordion script loads before `Alpine.start()` is called
   - Consider using `Alpine.data()` directly instead of event listener
   - Or ensure `alpine:init` listener is attached synchronously

2. **Increase Delay or Use Better Timing**
   - Increase 100ms delay to 200-300ms
   - Or use `requestAnimationFrame` + `setTimeout` for better timing
   - Or check if all components are registered before starting

3. **Add Registration Verification**
   - Before starting Alpine, verify `accordionPanel` is registered
   - Log warning if component is missing
   - Retry registration if needed

4. **Simplify Interception Logic**
   - Current interception logic is complex and may cause issues
   - Consider simpler approach: wait for bundle, then start Alpine once

### 5.3 General Improvements

1. **Add Debug Logging**
   - Log when components register
   - Log when Alpine starts
   - Log any errors during initialization

2. **Error Boundaries**
   - Wrap component initialization in try/catch
   - Prevent one failing component from breaking others

3. **Component Health Check**
   - Add function to verify all required components are registered
   - Run before starting Alpine
   - Log missing components

---

## 6. Files Requiring Changes

### 6.1 Flickity Fixes

1. `blocks/QuoteSlider/script.js` - Line 72: Change to `window.Flickity`
2. `blocks/TeamMemberSlider/script.js` - Line 60: Change to `window.Flickity`
3. Both files: Add error handling around Flickity initialization

### 6.2 Accordion/Alpine Fixes

1. `app/layout.tsx` - Improve timing logic (lines 52-104)
2. `vendor/plug-and-play-design/pegasus-one-accordion-panel/src/script.js` - Consider direct registration
3. `assets/scripts/main.js` - Verify component registration order

### 6.3 Diagnostic Tools

1. Add console logging to track initialization
2. Add error handling to catch failures
3. Add verification functions to check component health

---

## 7. Testing Checklist

After fixes, verify:

- [ ] `window.Flickity` is available before any component initializes
- [ ] All three sliders initialize Flickity correctly
- [ ] No console errors during initialization
- [ ] Accordion panels respond to clicks
- [ ] `x-collapse` animation works
- [ ] `panelOpen` state toggles correctly
- [ ] Multiple accordions on same page work
- [ ] Works on page load and after navigation
- [ ] Works after React hydration
- [ ] Resize handling works for sliders

---

## 8. Next Steps

1. **Immediate**: Run browser console checks to identify specific failure point
2. **Short-term**: Fix Flickity inconsistency issues
3. **Short-term**: Improve Alpine timing logic
4. **Long-term**: Simplify initialization sequence
5. **Long-term**: Add comprehensive error handling and logging

---

## 9. Additional Notes

- The accordion uses Alpine.js, not Flickity directly
- Flickity issues may be separate from accordion issues
- Both share similar timing/initialization problems
- React hydration may interfere with Alpine initialization
- Bundle size and load time may affect timing

---

**Report Generated**: Based on codebase analysis
**Focus**: Diagnostic only (no code changes)
**Status**: Ready for implementation fixes

