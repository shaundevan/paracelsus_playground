import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Enable bfcache (back/forward cache) for page routes
  // This allows browsers to cache pages for instant back/forward navigation
  // Only apply to HTML pages, not API routes or static assets
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static assets, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/wp-content/') ||
    pathname.startsWith('/wp-includes/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|css|js|json)$/i)
  ) {
    return response;
  }

  // Set headers to enable bfcache
  // Important: Do NOT use 'no-store' as it prevents bfcache
  // Use 'public' with appropriate max-age to allow browser caching
  // For static pages, we want them to be cacheable for bfcache
  const existingCacheControl = response.headers.get('Cache-Control');
  
  // Only override if no-store is present (which blocks bfcache)
  if (existingCacheControl?.includes('no-store')) {
    // Replace no-store with bfcache-compatible headers
    // Use 'public' to allow caching, but 'must-revalidate' to ensure freshness
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, must-revalidate'
    );
  } else if (!existingCacheControl) {
    // If no cache control is set, add bfcache-compatible headers
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, must-revalidate'
    );
  }
  
  return response;
}

export const config = {
  // Match all page routes except API routes and static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - wp-content (WordPress assets - handled by rewrites)
     * - wp-includes (WordPress includes - handled by rewrites)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|wp-content|wp-includes).*)',
  ],
};
