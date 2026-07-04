/**
 * axe.spec.ts
 *
 * Automated WCAG 2.1 AA accessibility audit for all critical routes.
 * Uses @axe-core/playwright to run axe-core against a running Next.js server.
 *
 * Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7
 *
 * Run locally:
 *   npm run test:a11y
 *
 * The test suite:
 *   - Sets prefers-reduced-motion: reduce for every page visit (Req 24.5).
 *   - Visits all critical routes.
 *   - Runs axe-core and asserts zero violations.
 *   - Logs any violations to the console for easier diagnosis.
 */

import { test, expect } from '@playwright/test';
// @axe-core/playwright uses playwright-core's Page type; cast via `as` below
import AxeBuilder from '@axe-core/playwright';
import type { Page as PlaywrightCorePage } from 'playwright-core';

// ── Critical routes to audit ──────────────────────────────────────────────────

const CRITICAL_ROUTES: Array<{ path: string; name: string }> = [
  { path: '/',                 name: 'Home' },
  { path: '/about',            name: 'About' },
  { path: '/solar/calculator', name: 'Solar Calculator' },
  { path: '/consultation',     name: 'Consultation' },
  { path: '/contact',          name: 'Contact' },
  { path: '/blog',             name: 'Blog' },
  { path: '/search',           name: 'Search' },
  { path: '/careers',          name: 'Careers' },
  { path: '/support/faq',      name: 'FAQ' },
  { path: '/legal/privacy',    name: 'Privacy Policy' },
];

// ── Helper: run axe on the current page and return violations ─────────────────

async function runAxe(page: PlaywrightCorePage) {
  const results = await new AxeBuilder({ page })
    // Target WCAG 2.1 Level A and AA rules only
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    // Exclude third-party widgets outside our control
    .exclude('#hubspot-messages-iframe-container')
    .exclude('[data-consent-banner]')
    .analyze();

  return results.violations;
}

// ── Set prefers-reduced-motion: reduce before each test ──────────────────────

test.beforeEach(async ({ page }) => {
  // Emulate prefers-reduced-motion: reduce for every page (Req 24.5)
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

for (const { path, name } of CRITICAL_ROUTES) {
  test(`${name} (${path}) — zero axe violations`, async ({ page }) => {
    // Navigate to the route
    const response = await page.goto(path, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });

    // Allow 200 and 404 (the 404 page itself must be accessible)
    const status = response?.status() ?? 0;
    expect(
      status,
      `Route ${path} returned unexpected status ${status}`,
    ).toBeLessThan(500);

    // Wait for the page to be interactive
    await page.waitForLoadState('domcontentloaded');

    // Run axe-core — cast page type to satisfy @axe-core/playwright's playwright-core dependency
    const violations = await runAxe(page as unknown as PlaywrightCorePage);

    // Build a human-readable summary for failure messages
    if (violations.length > 0) {
      const summary = violations
        .map(
          (v) =>
            `\n  [${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}: ${v.description}\n` +
            `    Help: ${v.helpUrl}\n` +
            v.nodes
              .slice(0, 3)
              .map((n) => `    Target: ${n.target.join(', ')}`)
              .join('\n'),
        )
        .join('\n');

      // Log for visibility in CI output
      console.error(`Axe violations on "${name}" (${path}):${summary}`);
    }

    expect(
      violations,
      `Found ${violations.length} axe violation(s) on "${name}" (${path})`,
    ).toHaveLength(0);
  });
}

// ── Additional targeted structural checks ─────────────────────────────────────

test('Root layout — exactly one H1 per page', async ({ page }) => {
  for (const { path, name } of CRITICAL_ROUTES) {
    const response = await page.goto(path, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    // Skip server-error pages (already tested above)
    if ((response?.status() ?? 0) >= 500) continue;

    const h1Count = await page.locator('h1').count();
    expect(
      h1Count,
      `Page "${name}" (${path}) should have exactly 1 H1`,
    ).toBe(1);
  }
});

test('Root layout — skip-to-content link present and points to #main-content', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 });

  const skipLink = page.locator('a[href="#main-content"]').first();
  await expect(skipLink).toBeAttached();

  const href = await skipLink.getAttribute('href');
  expect(href).toBe('#main-content');

  const mainContent = page.locator('#main-content');
  await expect(mainContent).toBeAttached();
});

test('Root layout — required landmark regions present', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 });

  await expect(page.locator('header').first()).toBeAttached();
  await expect(page.locator('main').first()).toBeAttached();
  await expect(page.locator('footer').first()).toBeAttached();
  await expect(page.locator('nav').first()).toBeAttached();
});
