# Image Loading Debug Guide

## Information Needed to Debug

Please provide the following information from your Vercel deployment:

### 1. Browser Console Errors
Open DevTools (F12) → Console tab and copy any errors related to images.

### 2. Network Tab Details
Open DevTools (F12) → Network tab:
- Filter by "Img" 
- Click on a failed image request
- Copy the following from the "Headers" tab:
  - **Request URL**: (the full URL being requested)
  - **Status Code**: (e.g., 404, 403, CORS error, etc.)
  - **Response Headers**: (especially any CORS-related headers)

### 3. Test Direct Image URL
Try opening this URL directly in a new browser tab:
```
https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4207.webp
```

Does it load? If yes, the WordPress server is accessible. If no, there may be a server issue.

### 4. Vercel Deployment URL
What's the exact Vercel URL where images aren't loading?
(e.g., `https://paracelsus-project.vercel.app/programmes-and-therapies`)

### 5. Screenshot
A screenshot of the Network tab showing a failed image request would be very helpful.

## Quick Tests

### Test 1: Verify WordPress Server Accessibility
Open in browser:
- `https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4207.webp`

### Test 2: Check for CORS Issues
In browser console, run:
```javascript
fetch('https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4207.webp')
  .then(r => console.log('Success:', r.status))
  .catch(e => console.error('Error:', e))
```

### Test 3: Check Image Element
In browser console, run:
```javascript
const img = document.querySelector('img[src*="Parac-Reco-4207"]');
console.log('Image src:', img?.src);
console.log('Image complete:', img?.complete);
console.log('Image naturalWidth:', img?.naturalWidth);
```

## Common Issues & Solutions

### Issue: 403 Forbidden
**Cause**: WordPress server blocking requests from Vercel IPs
**Solution**: May need to whitelist Vercel IPs or use API proxy route

### Issue: CORS Error
**Cause**: Cross-origin request blocked
**Solution**: Images shouldn't have CORS issues, but if they do, use the API proxy route

### Issue: 404 Not Found
**Cause**: Image path incorrect or file doesn't exist
**Solution**: Verify the image exists at the WordPress URL

### Issue: Mixed Content (HTTP/HTTPS)
**Cause**: Page is HTTPS but image URL is HTTP (or vice versa)
**Solution**: Ensure all URLs use HTTPS

### Issue: Content Security Policy (CSP)
**Cause**: CSP blocking external images
**Solution**: Check if there's a CSP header blocking `paracelsus-recovery.com`
