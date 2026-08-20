import { NextResponse } from 'next/server';

export function GET() {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Ad Frame</title>
  </head>
  <body>
    <script>
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'INJECT_AD') {
          document.open();
          document.write(event.data.code);
          document.close();
        }
      });
      // Tell the parent window we are ready to receive the ad code
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'AD_FRAME_READY' }, '*');
      }
    </script>
  </body>
</html>`;

  return new NextResponse(html.trim(), {
    headers: {
      'Content-Type': 'text/html',
      'X-Robots-Tag': 'noindex, nofollow'
    },
  });
}
