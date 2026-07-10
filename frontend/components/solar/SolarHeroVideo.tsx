'use client';

/**
 * SolarHeroVideo — full-bleed responsive video background for the Solar hero.
 *
 * ─── Responsiveness ────────────────────────────────────────────────────────
 * - position:absolute; inset:0 fills the parent at every viewport size
 * - object-fit:cover; object-position:center 30% keeps the rooftop/sky
 *   focal area in frame on all aspect ratios (portrait mobile → ultrawide)
 * - The <section> in solar/page.tsx controls height via min-h-* classes
 *
 * ─── Autoplay compatibility ─────────────────────────────────────────────────
 * - muted + playsInline + webkit-playsinline  → all mobile browsers allow this
 * - Manual video.play() on mount              → bypasses HTML attribute quirks
 * - loadedmetadata guard                      → ensures metadata before play()
 * - DOMException catch                        → silently falls back to poster
 *
 * ─── Performance ────────────────────────────────────────────────────────────
 * - preload="none"         → no bytes fetched until JS calls play()
 * - IntersectionObserver   → pauses when off-screen (saves CPU / battery)
 * - will-change:transform  → promotes to GPU compositing layer
 * - pointer-events:none    → never intercepts clicks on content above
 *
 * ─── Accessibility ──────────────────────────────────────────────────────────
 * - aria-hidden="true"           → invisible to screen readers
 * - prefers-reduced-motion       → pauses immediately, shows poster only
 * - live listener on media query → handles mid-session OS setting change
 *
 * ─── Fallback chain ─────────────────────────────────────────────────────────
 * 1. Video plays (mp4 — all modern browsers)
 * 2. Autoplay blocked → poster WebP shown (no layout shift)
 * 3. Video error      → poster WebP div rendered instead
 * 4. prefers-reduced-motion → poster WebP div rendered instead
 * 5. No image support → dark bg-[#0e1a0e] on parent section
 */

import { useEffect, useRef, useState } from 'react';

// Shared styles for the full-bleed positioning
const FILL_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  // center 30% — keeps sky + rooftop panels in frame; avoids cropping sky on portrait
  objectPosition: 'center 30%',
  zIndex: 0,
  pointerEvents: 'none',
  willChange: 'transform',
};

export default function SolarHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // When true we render a <div> with the poster as background-image instead
  const [usePosterFallback, setUsePosterFallback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // ── prefers-reduced-motion ──────────────────────────────────────────────
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setUsePosterFallback(true);
      return;
    }

    // ── Attempt play ────────────────────────────────────────────────────────
    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — poster is already showing through opacity:0 video
        // Nothing to do; the <video poster> attribute handles the static image
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadedmetadata', tryPlay, { once: true });
    }

    // ── Error handler ───────────────────────────────────────────────────────
    const onError = () => setUsePosterFallback(true);
    video.addEventListener('error', onError);

    // ── IntersectionObserver — pause when hero is off-screen ────────────────
    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        },
        { threshold: 0, rootMargin: '200px 0px' },
      );
      observer.observe(video);
    }

    // ── Handle OS reduced-motion toggle during session ──────────────────────
    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        video.pause();
        setUsePosterFallback(true);
      } else {
        setUsePosterFallback(false);
        tryPlay();
      }
    };
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      observer?.disconnect();
      video.removeEventListener('loadedmetadata', tryPlay);
      video.removeEventListener('error', onError);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  // ── Static fallback (reduced-motion / video load error) ───────────────────
  if (usePosterFallback) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/rooftop-solar-poster.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      muted
      loop
      playsInline
      autoPlay
      // webkit-playsinline — required by older iOS Safari (pre-12)
      {...{ 'webkit-playsinline': 'true' }}
      // preload="none" — defer all video bytes until JS calls play()
      preload="none"
      // poster — displayed immediately on SSR and while video buffers
      poster="/rooftop-solar-poster.webp"
      style={{
        ...FILL_STYLE,
        // Start transparent so the poster (set via CSS on the parent or
        // via the video's own poster attribute) shows through until the
        // video has buffered enough to play smoothly
        opacity: 0,
        transition: 'opacity 0.8s ease',
      }}
      // Fade in once enough data is buffered for uninterrupted playback
      onCanPlayThrough={(e) => {
        (e.target as HTMLVideoElement).style.opacity = '1';
      }}
      // Also fade in on canplay (fires sooner on fast connections)
      onCanPlay={(e) => {
        (e.target as HTMLVideoElement).style.opacity = '1';
      }}
    >
      {/* mp4 — supported by all modern browsers including Safari on iOS */}
      <source src="/rooftop-solar-bg.mp4" type="video/mp4" />
      {/*
        No <source> fallback needed.
        The `poster` attribute on <video> handles the static image fallback
        when video cannot play (old browser, no codec, etc.).
      */}
    </video>
  );
}
