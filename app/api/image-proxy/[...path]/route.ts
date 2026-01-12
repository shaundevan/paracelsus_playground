import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy route for WordPress images
 * This ensures images load correctly on Vercel by proxying requests
 * through an API route instead of relying on rewrites
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params (required in Next.js 15+)
    const { path } = await params;
    
    // Reconstruct the path from the catch-all route
    const imagePath = path.join('/');
    
    // Build the full WordPress URL
    const wordPressUrl = `https://paracelsus-recovery.com/wp-content/${imagePath}`;
    
    // Fetch the image from WordPress
    const imageResponse = await fetch(wordPressUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Next.js Image Proxy)',
      },
    });

    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Get content type from the WordPress response
    const contentType = imageResponse.headers.get('content-type') || 'image/webp';
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
