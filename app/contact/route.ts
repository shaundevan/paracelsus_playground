import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic to ensure fresh content during development
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isModal = searchParams.get('modal') === 'yes';

  if (isModal) {
    // Read fresh content each request (for development hot-reload)
    const contactModalHtml = fs.readFileSync(
      path.join(process.cwd(), 'clone-kit/html/05-contact-modal.html'),
      'utf8'
    );
    
    // Return just the modal content HTML
    return new NextResponse(contactModalHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  // For non-modal requests, redirect to the production contact page
  // or return a placeholder
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <title>Contact - Paracelsus Recovery</title>
  <meta http-equiv="refresh" content="0;url=https://paracelsus-recovery.com/contact/">
</head>
<body>
  <p>Redirecting to contact page...</p>
</body>
</html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

