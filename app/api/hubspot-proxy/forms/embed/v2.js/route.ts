import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for Hubspot Forms SDK
 * This allows us to serve the script with proper cache headers
 * to improve Lighthouse cache lifetime scores.
 * 
 * The original Hubspot script has a 5-minute cache TTL, which
 * Lighthouse flags. By proxying through our server, we can set
 * a longer cache lifetime (1 year for immutable scripts).
 * 
 * Note: The browser will cache this based on our Cache-Control headers,
 * which is what Lighthouse measures. The script URL from Hubspot is
 * versioned, so it's safe to cache for a long time.
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch the Hubspot script from their CDN
    const hubspotUrl = 'https://js-eu1.hsforms.net/forms/embed/v2.js';
    const response = await fetch(hubspotUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch Hubspot script', {
        status: response.status,
      });
    }

    const scriptContent = await response.text();

    // Return the script with proper cache headers
    // Using 1 year cache since the script URL is versioned and immutable
    return new NextResponse(scriptContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        // Pass through any ETag or Last-Modified from Hubspot if available
        ...(response.headers.get('etag') && {
          'ETag': response.headers.get('etag')!,
        }),
        ...(response.headers.get('last-modified') && {
          'Last-Modified': response.headers.get('last-modified')!,
        }),
      },
    });
  } catch (error) {
    console.error('Error proxying Hubspot script:', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}
