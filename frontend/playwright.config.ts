/**
 * playwright.config.ts
 *
 * Playwright configuration for the Tribhuban Parent Website accessibility
 * test suite (axe-core automated checks).
 *
 * Requirements: 24.1–24.7
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Base URL for the server under test.
 * In CI, the Next.js production build is served on port 3000.
 * Locally the same applies via the webServer config below.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  // Directory where a11y tests live
  testDir: './tests/a11y',

  // Give each test up to 60 s — pages may do SSR/ISR on first load
  timeout: 60_000,

  // Fail fast in CI; locally run all tests
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Report formats
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  use: {
    baseURL: BASE_URL,

    // Basic appearance
    colorScheme: 'light',

    // Capture a screenshot and trace on failure for debugging
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',

    // Reasonable viewport
    viewport: { width: 1280, height: 720 },
  },

  // Single project: Chromium only (per spec task 22.1)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Output directory for test artifacts
  outputDir: 'playwright-results',

  /**
   * Web server configuration.
   *
   * In CI (PLAYWRIGHT_CI=true), the server is already started by the workflow
   * before Playwright runs, so we skip the automatic startup here.
   *
   * Locally, Playwright will build and start the Next.js production server.
   * Using production build matches what CI does and catches SSR issues.
   */
  webServer: process.env.PLAYWRIGHT_CI
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          PORT: '3000',
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
          NEXT_PUBLIC_SENTRY_DSN: '',
        },
      },
});
