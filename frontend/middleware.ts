import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANONICAL_HOST = 'tribhubanconcepts.com';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

/**
 * Reserved namespaces that must never resolve to an MVP page.
 * Requests targeting these paths receive a 406 Not Acceptable response.
 */
const RESERVED_PREFIXES = [
  '/app',
  '/dashboard',
  '/portal',
  '/partner',
  '/customer',
  '/api/internal',
];

/**
 * Known legitimate crawler user-agent substrings — must never be blocked.
 * Kept here as a documentation/safety reference; the middleware passes all
 * traffic through regardless of user-agent.
 */
// const ALLOWED_CRAWLERS = [
//   'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot',
//   'GPTBot', 'ChatGPT-User', 'Google-Extended',
//   'anthropic-ai', 'Claude-Web', 'PerplexityBot',
// ];

// ---------------------------------------------------------------------------
// Security headers applied to every response
// ---------------------------------------------------------------------------

function applySecurityHeaders(response: NextResponse): void {
  const headers = response.headers;

  // Content-Security-Policy — baseline policy allowing self + Google Fonts
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://*.amazonaws.com https://*.cloudfront.net",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );

  // Prevent MIME-type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Disallow framing entirely
  headers.set('X-Frame-Options', 'DENY');

  // Only send origin on cross-origin requests, full URL on same-origin
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable sensitive browser features we don't use
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  // Enforce HTTPS for 2 years, include subdomains, preload-eligible
  headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
}

// ---------------------------------------------------------------------------
// Correlation-ID helper
// ---------------------------------------------------------------------------

function ensureRequestId(
  request: NextRequest,
  response: NextResponse,
): string {
  const existing = request.headers.get('x-request-id');
  if (existing) {
    response.headers.set('X-Request-ID', existing);
    return existing;
  }
  // Generate a lightweight correlation ID without depending on the crypto
  // module (Edge runtime compatible approach using Math.random + Date).
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  response.headers.set('X-Request-ID', id);
  return id;
}

// ---------------------------------------------------------------------------
// Middleware entry point
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search, host } = request.nextUrl;

  // 1. HTTPS + canonical-host redirect ─────────────────────────────────────
  //    Redirect www.tribhubanconcepts.com → tribhubanconcepts.com
  if (host === `www.${CANONICAL_HOST}`) {
    const url = `${CANONICAL_ORIGIN}${pathname}${search}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Trailing-slash normalization ─────────────────────────────────────────
  //    /path/ → /path (308 Permanent Redirect)
  //    Leave root `/` alone.
  if (pathname !== '/' && pathname.endsWith('/')) {
    const stripped = pathname.slice(0, -1);
    const url = `${CANONICAL_ORIGIN}${stripped}${search}`;
    return NextResponse.redirect(url, { status: 308 });
  }

  // 3. Reserved namespace guard ─────────────────────────────────────────────
  //    Return 406 for any request targeting a reserved future namespace.
  //    This prevents accidental content at these paths during MVP and signals
  //    to the caller that the namespace is intentionally reserved.
  const isReserved = RESERVED_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );
  if (isReserved) {
    const response = new NextResponse(
      JSON.stringify({
        error: 'Reserved namespace',
        message:
          'This path is reserved for a future system and is not available at this time.',
      }),
      {
        status: 406,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    applySecurityHeaders(response);
    ensureRequestId(request, response);
    return response;
  }

  // 4. Pass-through — attach security headers and correlation ID ────────────
  const response = NextResponse.next();
  applySecurityHeaders(response);
  ensureRequestId(request, response);
  return response;
}

// ---------------------------------------------------------------------------
// Matcher — run on all routes except Next.js internals and static files
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico, robots.txt, sitemap.xml (and other well-known static)
     * - Public folder assets served directly
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|otf|css|js|map)).*)',
  ],
};
