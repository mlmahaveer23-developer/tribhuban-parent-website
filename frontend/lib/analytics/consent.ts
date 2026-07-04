/**
 * Consent Manager — frontend/lib/analytics/consent.ts
 *
 * Gates GA4, PostHog, and Clarity behind explicit visitor consent.
 * Implements DPDP/GDPR-aligned storage and retrieval of consent state.
 * Server-safe: guards every browser API with typeof-window checks.
 *
 * Req 17.1 — no analytics/marketing script loads before consent.
 * Req 17.2 — consent state persisted within 1 s of action.
 * Req 17.3 — consent state includes category, granted/denied, timestamp.
 * Req 17.4 — Do-Not-Track header honoured as denied unless visitor grants.
 * Req 17.8 — prefers-reduced-motion honoured for motion.
 */

export const CONSENT_KEY = 'tribhuban_consent';
const CONSENT_TTL_DAYS = 365;

export interface ConsentState {
  categories: ('analytics' | 'marketing')[];
  granted: boolean;
  timestamp: string; // ISO 8601
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read and parse the stored consent state.
 * Returns null when running server-side or when no value is stored.
 */
export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // Basic shape validation
    if (typeof parsed.granted !== 'boolean' || !parsed.timestamp) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist a ConsentState to localStorage synchronously.
 * Called within 1 second of the visitor's action (Req 17.2).
 */
export function setConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private browsing, storage quota) — fail silently
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Query helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true iff the visitor has granted consent for the given category.
 * Always false server-side.
 */
export function hasConsent(category: 'analytics' | 'marketing'): boolean {
  const state = getConsent();
  if (!state || !state.granted) return false;
  return state.categories.includes(category);
}

/**
 * Returns true iff stored consent is older than 365 days and should be
 * re-collected from the visitor.
 */
export function isConsentExpired(): boolean {
  const state = getConsent();
  if (!state) return false;
  const stored = new Date(state.timestamp).getTime();
  if (Number.isNaN(stored)) return true;
  const ageMs = Date.now() - stored;
  return ageMs > CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Returns true when the consent banner should be presented:
 *   - no stored consent, OR
 *   - stored consent is expired (> 365 days old).
 */
export function shouldShowBanner(): boolean {
  if (typeof window === 'undefined') return false;
  const state = getConsent();
  return state === null || isConsentExpired();
}

/**
 * Returns true iff the browser signals Do-Not-Track (Req 17.4).
 * Only meaningful client-side.
 */
export function checkDoNotTrack(): boolean {
  if (typeof window === 'undefined') return false;
  return navigator.doNotTrack === '1';
}

// ─────────────────────────────────────────────────────────────────────────────
// prefers-reduced-motion helper (Req 17.8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true iff the visitor has requested reduced motion.
 * Use this to skip animations on analytics-related UI elements.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics script gate stubs
// These are the integration points where GA4, PostHog, and Clarity scripts
// would be loaded. They perform NO actual loading — they only check consent.
// Real script injection is wired in the analytics provider (Post-MVP).
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true iff GA4 is permitted to load (analytics consent granted). */
export function canLoadGA4(): boolean {
  return hasConsent('analytics');
}

/** Returns true iff PostHog is permitted to load (analytics consent granted). */
export function canLoadPostHog(): boolean {
  return hasConsent('analytics');
}

/** Returns true iff Clarity is permitted to load (analytics + marketing consent). */
export function canLoadClarity(): boolean {
  return hasConsent('analytics') && hasConsent('marketing');
}
