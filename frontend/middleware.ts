import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_REDIRECTS } from '@/lib/siteConfig';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

// ── Constants ─────────────────────────────────────────────────────────────────
// CANONICAL_HOST is read from env so it works on Vercel without a custom domain.
// Set NEXT_PUBLIC_SITE_URL in Vercel environment variables, e.g.:
//   https://tribhuban-parent-website.vercel.app
// When you purchase a real domain, update the env var only.

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app';
const CANONICAL_ORIGIN = RAW_SITE_URL.replace(/\/$/, '');
const CANONICAL_HOST   = CANONICAL_ORIGIN.replace(/^https?:\/\//, '');

const RESERVED_PREFIXES = [
  '/app', '/dashboard', '/portal', '/partner', '/customer', '/api/internal',
];

const PROTECTED_ROUTE_PREFIXES = ['/account', '/profile', '/orders'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

// ── Security headers ──────────────────────────────────────────────────────────

function applySecurityHeaders(response: NextResponse): void {
  const h = response.headers;
  h.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.amazonaws.com https://*.cloudfront.net",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options', 'DENY');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}

// ── Correlation ID ────────────────────────────────────────────────────────────

function ensureRequestId(request: NextRequest, response: NextResponse): void {
  const existing = request.headers.get('x-request-id');
  const id = existing ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  response.headers.set('X-Request-ID', id);
}

// ── Middleware entry point ────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search, host } = request.nextUrl;

  // 1. Canonical-host redirect (www → non-www)
  if (host === `www.${CANONICAL_HOST}`) {
    return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, { status: 301 });
  }

  // 2. Trailing-slash normalisation (/path/ → /path)
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      `${CANONICAL_ORIGIN}${pathname.slice(0, -1)}${search}`,
      { status: 308 },
    );
  }

  // 3. Reserved namespace guard
  const isReserved = RESERVED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isReserved) {
    const res = new NextResponse(
      JSON.stringify({ error: 'Reserved namespace', message: 'This path is reserved for a future system.' }),
      { status: 406, headers: { 'Content-Type': 'application/json' } },
    );
    applySecurityHeaders(res);
    ensureRequestId(request, res);
    return res;
  }

  // 4. Legacy URL redirects (301 permanent — SEO-safe)
  //    Defined in lib/siteConfig.ts so they stay in sync with the nav config.
  const legacyTarget = LEGACY_REDIRECTS[pathname];
  if (legacyTarget) {
    const res = NextResponse.redirect(
      `${CANONICAL_ORIGIN}${legacyTarget}${search}`,
      { status: 301 },
    );
    applySecurityHeaders(res);
    ensureRequestId(request, res);
    return res;
  }

  // 4.5 Auth session refresh + protected route guard
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(request, res);

  // Refresh the session if the access token is expired
  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute && user) {
    applySecurityHeaders(res);
    ensureRequestId(request, res);
    return NextResponse.redirect(`${CANONICAL_ORIGIN}/`);
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', CANONICAL_ORIGIN);
    redirectUrl.searchParams.set('redirect_to', pathname + search);
    applySecurityHeaders(res);
    ensureRequestId(request, res);
    return NextResponse.redirect(redirectUrl);
  }

  // 5. Pass-through — attach security headers + correlation ID
  applySecurityHeaders(res);
  ensureRequestId(request, res);
  return res;
}

// ── Matcher ───────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|otf|css|js|map)).*)',
  ],
};
