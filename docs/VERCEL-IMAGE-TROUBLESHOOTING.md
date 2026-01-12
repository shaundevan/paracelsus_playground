# Vercel Image Loading Troubleshooting

## Issue: Images Not Loading on Vercel

If images aren't loading on Vercel deployment, follow these steps:

## Current Setup

1. **Next.js Rewrites** (Primary Method)
   - Configured in `next.config.ts`
   - Proxies `/wp-content/*` to `https://paracelsus-recovery.com/wp-content/*`
   - Should work automatically on Vercel

2. **API Route Fallback** (Backup Method)
   - Created at `/app/api/image-proxy/[...path]/route.ts`
   - Can be used if rewrites don't work

## Debugging Steps

### 1. Check if Rewrites are Working

Open browser DevTools → Network tab and check:
- Are image requests going to `your-vercel-app.vercel.app/wp-content/...`?
- What's the response status code?
- Are there any CORS errors?

### 2. Test Direct WordPress URLs

Try accessing an image directly:
```
https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4207.webp
```

If this works, the issue is with the rewrites, not the WordPress server.

### 3. Check Vercel Deployment Logs

In Vercel dashboard:
- Go to your deployment
- Check "Functions" tab for any errors
- Check "Logs" for rewrite-related errors

### 4. Verify Next.js Config

Ensure `next.config.ts` has:
```typescript
async rewrites() {
  return [
    {
      source: "/wp-content/:path*",
      destination: "https://paracelsus-recovery.com/wp-content/:path*",
    },
  ];
}
```

## Solutions

### Solution 1: Use Absolute URLs (Quick Fix)

If rewrites aren't working, you can temporarily use absolute URLs in the HTML:

1. Update `scripts/split-page-html.js` to NOT convert URLs to relative paths
2. Or manually update image `src` attributes to use full WordPress URLs

**Pros:** Guaranteed to work  
**Cons:** Images load directly from WordPress (no Vercel proxy)

### Solution 2: Use API Route Proxy

If rewrites don't work, update image paths to use the API route:

Change:
```html
<img src="/wp-content/uploads/2025/01/image.webp">
```

To:
```html
<img src="/api/image-proxy/uploads/2025/01/image.webp">
```

**Pros:** Works reliably, gives you control  
**Cons:** Requires updating all image paths

### Solution 3: Fix Rewrites Configuration

If rewrites should work but don't:

1. Check Vercel project settings
2. Ensure Next.js version is compatible
3. Try redeploying
4. Check if there are any Vercel-specific rewrite limitations

## Recommended Approach

1. **First**: Verify rewrites are working (check Network tab)
2. **If not working**: Use Solution 1 (absolute URLs) as temporary fix
3. **Long-term**: Investigate why rewrites aren't working and fix the root cause

## Testing

After deploying to Vercel:

1. Open the page in browser
2. Open DevTools → Network tab
3. Filter by "Img"
4. Check if images are loading and from where
5. If 404s, check the request URL format

## Common Issues

### Issue: 404 Errors
- **Cause**: Rewrites not working or image path incorrect
- **Fix**: Use absolute URLs or API route

### Issue: CORS Errors
- **Cause**: WordPress server blocking requests
- **Fix**: Usually not an issue for images (CORS mainly affects JS/CSS)

### Issue: Slow Loading
- **Cause**: Images loading from WordPress directly
- **Fix**: Use Vercel Image Optimization or CDN
