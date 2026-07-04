import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // Allow images from S3/CloudFront for editorial media
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Experimental: typed routes only; instrumentationHook is stable in Next 15
  experimental: {
    typedRoutes: false,
  },
};

// ── Sentry build-time configuration ──────────────────────────────────────────
// withSentryConfig wraps the Next.js config to:
//   - Upload source maps to Sentry during builds (requires SENTRY_AUTH_TOKEN)
//   - Automatically tree-shake Sentry from client bundles when DSN is absent
//   - Inject Sentry's auto-wrapApiHandlerWithSentry into route handlers
//
// Source-map uploads are gated by SENTRY_AUTH_TOKEN being present, so local
// and CI builds without the token simply skip the upload step.
const sentryWebpackPluginOptions = {
  // Suppresses all Sentry build step logs except errors
  silent: process.env.CI !== 'true',

  // Organisation + project slugs are read from SENTRY_ORG / SENTRY_PROJECT env
  // vars set in the CI environment or .env.local (never committed to source).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for source-map uploads (SENTRY_AUTH_TOKEN env var).
  // Without this, source maps are not uploaded but the build still succeeds.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Disable automatic error handling wrapping (we do it manually in error.tsx)
  autoInstrumentServerFunctions: false,

  // Hides Sentry source-map upload warnings in non-CI environments
  hideSourceMaps: true,

  // Disable the Sentry webpack plugin entirely when no DSN is configured
  // (local development without Sentry set up).
  disableLogger: true,
} as Parameters<typeof withSentryConfig>[1];

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
