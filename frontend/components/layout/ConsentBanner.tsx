'use client';

/**
 * ConsentBanner — frontend/components/layout/ConsentBanner.tsx
 *
 * A bottom-fixed, non-modal consent notice presented on first visit and
 * whenever stored consent is older than 365 days.
 *
 * Req 17.1 — prevents analytics/marketing scripts loading before consent.
 * Req 17.2 — persists consent state within 1 s of visitor action.
 * Req 17.3 — includes category, granted/denied value, and timestamp.
 * Req 17.4 — honours Do-Not-Track: 1 as denied on first load unless overridden.
 * Req 17.8 — respects prefers-reduced-motion for entry animation.
 *
 * Accessibility:
 *   - role="region" + aria-label for landmark identification.
 *   - Visible focus indicators on both buttons (focus-visible).
 *   - Links to /legal/cookies for full policy.
 *   - tabIndex managed naturally (no modal focus trap required for a banner).
 *
 * The component is mounted unconditionally in the root layout; it renders
 * null until it has confirmed (client-side) that the banner should be shown.
 * This avoids hydration mismatches from reading localStorage on the server.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  prefersReducedMotion,
  setConsent,
  shouldShowBanner,
  type ConsentState,
} from '@/lib/analytics/consent';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type BannerState = 'hidden' | 'visible' | 'dismissed';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ConsentBanner() {
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const [reduceMotion, setReduceMotion] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  // ── Determine on mount whether the banner needs to be shown ──────────────
  useEffect(() => {
    // prefersReducedMotion is browser-only
    setReduceMotion(prefersReducedMotion());

    if (!shouldShowBanner()) {
      // Consent is current — banner not needed
      return;
    }

    // Banner must be shown.
    // If Do-Not-Track is set AND no prior consent exists, we do NOT pre-fill
    // a "denied" record — we just show the banner so the visitor makes an
    // active choice. (Req 17.4: DNT is treated as implied denial only until
    // the visitor explicitly grants.)
    setBannerState('visible');
  }, []);

  // ── Move focus to "Accept All" when banner becomes visible ───────────────
  // This aids keyboard users who may not notice the bottom banner.
  useEffect(() => {
    if (bannerState === 'visible') {
      // Defer one tick so the element is painted before focus
      const id = setTimeout(() => acceptRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [bannerState]);

  // ── Persist consent (Req 17.2: within 1 s of action) ────────────────────
  function persist(granted: boolean) {
    const state: ConsentState = {
      categories: granted ? ['analytics', 'marketing'] : [],
      granted,
      timestamp: new Date().toISOString(),
    };
    // setConsent is synchronous — well within the 1 s budget.
    setConsent(state);
    setBannerState('dismissed');
  }

  function handleAccept() {
    persist(true);
  }

  function handleDecline() {
    // If Do-Not-Track is set, decline is definitive. Otherwise the visitor
    // explicitly chose to decline, which is equally final.
    persist(false);
  }

  // ── Render nothing when not applicable ──────────────────────────────────
  if (bannerState !== 'visible') return null;

  // ── Transition style (respect prefers-reduced-motion) ───────────────────
  const transitionStyle = reduceMotion
    ? undefined
    : ({
        animation: 'consent-slide-up 0.25s ease-out both',
      } as React.CSSProperties);

  return (
    <>
      {/* Keyframe style injected inline — avoids separate CSS file dependency */}
      {!reduceMotion && (
        <style>{`
          @keyframes consent-slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>
      )}

      {/*
       * z-[400] matches the toast token (§6.1 z.toast = 400).
       * position: fixed bottom-0 so it never scrolls out of view.
       * Not a modal — no aria-modal, no inert backdrop.
       */}
      <div
        role="region"
        aria-label="Cookie consent"
        aria-live="polite"
        style={transitionStyle}
        className={[
          // Layout
          'fixed bottom-0 left-0 right-0 z-[400]',
          // Surface
          'bg-[var(--surface)] border-t border-[var(--border)]',
          // Shadow
          'shadow-[var(--shadow-lg)]',
        ].join(' ')}
      >
        <div className="container-content py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* ── Message ────────────────────────────────────────────────── */}
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-prose">
            We use cookies and similar technologies to understand how you use our
            site, improve your experience, and show relevant content.{' '}
            <Link
              href="/legal/cookies"
              className="underline text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              Cookie policy
            </Link>
            .
          </p>

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div className="flex gap-3 shrink-0">
            {/*
             * "Accept All" — primary action, receives focus on mount.
             * Keyboard: Tab navigates between buttons; Enter/Space activates.
             */}
            <button
              ref={acceptRef}
              type="button"
              onClick={handleAccept}
              className={[
                'px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold',
                'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
                'hover:bg-[var(--btn-primary-hover)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
                'transition-colors duration-150',
                // Minimum 44×44 px touch target (Req §24 / WCAG 2.5.5)
                'min-h-[44px]',
              ].join(' ')}
            >
              Accept All
            </button>

            {/*
             * "Decline Optional" — secondary action.
             * Declines analytics + marketing; strictly necessary cookies
             * (e.g. theme preference) are unaffected.
             */}
            <button
              type="button"
              onClick={handleDecline}
              className={[
                'px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold',
                'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)]',
                'border border-[var(--border)]',
                'hover:bg-[var(--btn-secondary-hover)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
                'transition-colors duration-150',
                'min-h-[44px]',
              ].join(' ')}
            >
              Decline Optional
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
