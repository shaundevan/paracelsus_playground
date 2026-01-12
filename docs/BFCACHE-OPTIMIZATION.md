# Back/Forward Cache (bfcache) Optimization

This document explains the bfcache optimization status and known limitations.

## What is bfcache?

The back/forward cache (bfcache) is a browser optimization that allows instant navigation when users go back or forward through their browsing history. Instead of reloading the page, the browser restores it from cache.

## Current Status

### ✅ Fixed Issues

1. **Cache-Control Headers**
   - Added middleware to ensure pages don't use `Cache-Control: no-store`
   - Static pages now use `public, max-age=0, must-revalidate` which is bfcache-compatible

### ⚠️ Known Limitations (Not Actionable)

The following bfcache blockers cannot be fixed because they come from external sources:

1. **Unload Handlers**
   - **Source**: Third-party scripts (HubSpot, analytics, etc.)
   - **Impact**: Pages with unload handlers cannot enter bfcache
   - **Status**: Not actionable - these are from third-party scripts we don't control
   - **Note**: In production, many third-party scripts are lazy-loaded, which may reduce this impact

2. **WebSocket Connections**
   - **Source**: 
     - Next.js dev mode HMR (Hot Module Replacement) - only in development
     - Third-party scripts that use WebSockets
   - **Impact**: Pages with active WebSocket connections cannot enter bfcache
   - **Status**: 
     - Dev mode WebSockets: Expected behavior, only affects development
     - Third-party WebSockets: Not actionable

3. **Cache-Control: no-store from Third-Party Resources**
   - **Source**: JavaScript network requests from third-party scripts
   - **Impact**: If any resource request has `no-store`, bfcache is disabled
   - **Status**: Not actionable - controlled by third-party servers

## Testing bfcache

To test if bfcache is working:

1. Open Chrome DevTools
2. Go to Application > Back/forward cache
3. Navigate to a page
4. Navigate away
5. Use browser back button
6. Check if page was restored from bfcache

## Best Practices

1. **Avoid unload handlers** - Use `pagehide` event instead if cleanup is needed
2. **Close WebSocket connections** - Ensure WebSockets are closed before navigation
3. **Use appropriate cache headers** - Avoid `no-store` for pages that should be cacheable
4. **Test in production** - Dev mode has additional bfcache blockers (HMR, etc.)

## References

- [Web.dev: Back/forward cache](https://web.dev/bfcache/)
- [Chrome: Back/forward cache](https://developer.chrome.com/docs/browsing-topics/back-forward-cache/)
