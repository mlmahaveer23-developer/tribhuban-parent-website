/**
 * Performance Budget CI Check
 *
 * Validates: Requirements 25.1, 25.2, 25.4
 *
 * Asserts that every route's route-specific JS payload is ≤ 130 KB gzipped.
 * Reads the production Next.js build output from `.next/` — requires a prior
 * `npm run build`. Only route-unique chunks count toward the budget; shared
 * framework/runtime/vendor chunks that appear across multiple routes are excluded
 * because browsers cache them after the first visit.
 *
 * This matches how Next.js itself reports "Size" (route-only JS) vs
 * "First Load JS" (route + shared). The 130 KB budget applies to the
 * route-specific portion only.
 *
 * Usage:
 *   npm run build
 *   npx tsx tests/perf-budget.test.ts
 *
 * Exit codes:
 *   0  All routes within budget
 *   1  One or more routes exceed budget (or build output missing)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

// ── Configuration ─────────────────────────────────────────────────────────────

/** Maximum allowed gzipped route-specific JS per route: 130 KB. Req 25.4 */
const BUDGET_BYTES = 130 * 1024;

const NEXT_DIR = path.resolve(__dirname, '..', '.next');
const CHUNKS_DIR = path.join(NEXT_DIR, 'static', 'chunks');
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, 'build-manifest.json');
const APP_BUILD_MANIFEST_PATH = path.join(NEXT_DIR, 'app-build-manifest.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function gzipSize(buf: Buffer): number {
  return zlib.gzipSync(buf, { level: zlib.constants.Z_DEFAULT_COMPRESSION }).byteLength;
}

function resolveChunkPath(chunk: string): string | null {
  // Normalise leading `static/chunks/` prefix that manifests sometimes include
  const rel = chunk.replace(/^static\/chunks\//, '').replace(/^\//, '');
  const full = path.join(CHUNKS_DIR, rel);
  return fs.existsSync(full) ? full : null;
}

function chunkGzipSize(chunk: string): number {
  if (!chunk.endsWith('.js')) return 0;
  const resolved = resolveChunkPath(chunk);
  if (!resolved) return 0;
  try {
    return gzipSize(fs.readFileSync(resolved));
  } catch {
    return 0;
  }
}

// ── Manifest loading ──────────────────────────────────────────────────────────

interface Manifest {
  pages: Record<string, string[]>;
}

function loadRoutes(): Record<string, string[]> {
  if (!fs.existsSync(NEXT_DIR)) {
    console.error(
      `\n✗  No .next/ directory at ${NEXT_DIR}` +
        '\n   Run `npm run build` before the performance budget check.\n'
    );
    process.exit(1);
  }

  const routes: Record<string, string[]> = {};

  for (const manifestPath of [BUILD_MANIFEST_PATH, APP_BUILD_MANIFEST_PATH]) {
    if (!fs.existsSync(manifestPath)) continue;
    const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    for (const [route, chunks] of Object.entries(manifest.pages ?? {})) {
      // Merge chunks from both manifests; later entries extend earlier ones
      if (!routes[route]) {
        routes[route] = [...chunks];
      } else {
        const existing = new Set(routes[route]);
        for (const c of chunks) {
          if (!existing.has(c)) routes[route].push(c);
        }
      }
    }
  }

  return routes;
}

/**
 * Identifies which chunks are shared across routes (appear in ≥2 routes or
 * match known framework prefixes). Shared chunks are browser-cached after the
 * first visit and should NOT count toward the per-route budget.
 *
 * Additionally, always exclude well-known framework filename patterns.
 */
function computeSharedChunks(routes: Record<string, string[]>): Set<string> {
  const frequency = new Map<string, number>();

  for (const chunks of Object.values(routes)) {
    for (const chunk of chunks) {
      frequency.set(chunk, (frequency.get(chunk) ?? 0) + 1);
    }
  }

  const shared = new Set<string>();
  for (const [chunk, count] of frequency.entries()) {
    if (count > 1) {
      shared.add(chunk);
    }
    // Also exclude framework chunks by name pattern even if only one route uses them
    const base = path.basename(chunk);
    if (
      base.startsWith('framework-') ||
      base.startsWith('polyfills-') ||
      base.startsWith('webpack-') ||
      base.startsWith('main-') ||
      base === '_app.js' ||
      base === '_error.js'
    ) {
      shared.add(chunk);
    }
  }

  return shared;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  const routes = loadRoutes();
  const routeNames = Object.keys(routes);

  if (routeNames.length === 0) {
    console.error(
      '\n✗  No routes found in build manifests. ' +
        'Ensure `npm run build` completed successfully.\n'
    );
    process.exit(1);
  }

  // Compute which chunks are shared so they can be excluded from per-route budget
  const sharedChunks = computeSharedChunks(routes);

  interface Result {
    route: string;
    sizeBytes: number;
    pass: boolean;
  }

  const results: Result[] = [];

  for (const [route, chunks] of Object.entries(routes)) {
    // Only count route-unique JS chunks
    const routeOnlyChunks = chunks.filter((c) => !sharedChunks.has(c));
    const sizeBytes = routeOnlyChunks.reduce((sum, c) => sum + chunkGzipSize(c), 0);
    results.push({ route, sizeBytes, pass: sizeBytes <= BUDGET_BYTES });
  }

  // Sort largest first for readability
  results.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const budgetKb = (BUDGET_BYTES / 1024).toFixed(0);

  console.log(
    `\nPerformance budget report  (budget: ${budgetKb} KB gzip per route, route-unique chunks only)\n` +
      `${'─'.repeat(78)}`
  );

  const violations: Result[] = [];

  for (const r of results) {
    const kb = (r.sizeBytes / 1024).toFixed(1).padStart(7);
    const status = r.pass ? '✓ ok    ' : '✗ OVER  ';
    console.log(`  ${status}  ${kb} KB   ${r.route}`);
    if (!r.pass) violations.push(r);
  }

  console.log(`${'─'.repeat(78)}`);

  if (violations.length === 0) {
    console.log(
      `\n✓  All ${results.length} route(s) are within the ${budgetKb} KB gzip budget.\n`
    );
    process.exit(0);
  } else {
    console.error(
      `\n✗  ${violations.length} route(s) exceed the ${budgetKb} KB gzip budget:\n`
    );
    for (const v of violations) {
      const kb = (v.sizeBytes / 1024).toFixed(1);
      console.error(
        `     ${v.route}:  ${kb} KB gzip  ` +
          `(over by ${((v.sizeBytes - BUDGET_BYTES) / 1024).toFixed(1)} KB)`
      );
    }
    console.error(
      '\n  To diagnose, run:  ANALYZE=true npm run build\n' +
        '  Then reduce bundle size or split the affected routes.\n'
    );
    process.exit(1);
  }
}

main();
