/**
 * Next.js instrumentation hook.
 *
 * This file is picked up automatically by Next.js when
 * `experimental.instrumentationHook` is set to true in next.config.ts.
 * It is the recommended integration point for @sentry/nextjs in the
 * App Router.
 *
 * @sentry/nextjs recommends calling `register()` here so that the Sentry
 * SDK is initialised once for both the Node.js runtime and the Edge runtime,
 * picking up the correct config file for each.
 *
 * See: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
