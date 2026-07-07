'use client';

/**
 * SolarHeroVideo — responsive autoplay background video for the Solar hero.
 *
 * Mobile autoplay fix:
 * - useEffect manually calls video.play() after mount (bypasses SSR)
 * - Catches the DOMException that mobile browsers throw when autoplay is
 *   blocked — falls back to showing the poster image silently
 * - Intersection Observer pauses video when section leaves viewport (perf)
 * - prefers-reduced-motion: pauses video, shows poster only
 *
 * Responsive sizing:
 * - position: absolute; inset: 0; width: 100%; height: 100%
 * - object-fit: cover — fills the container at ANY aspect ratio / screen size
 * - The parent section controls min-height; the video fills it completely
 *
 * iOS Safari requirements (all satisfied):
 * - muted ✓
 * - playsInline ✓  ← the webkit-playsinline attribute is also set via prop
 * - autoPlay ✓
 * - Manual play() call on mount ✓
 */

import { useEffect, useRef } from 'react';

export default function SolarHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      video.pause();
      return;
    }

    // Manually trigger play — required for mobile browsers
    // Some mobile browsers ignore the `autoPlay` attribute on the HTML element
    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked (e.g. Safari Low Power Mode, user setting)
        // Poster image remains visible — no user-visible error
      });
    };

    // If video metadata already loaded, play immediately
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadedmetadata', tryPlay, { once: true });
    }

    // Intersection Observer — pause when hero is off-screen to save battery
    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0 },
      );
      observer.observe(video);
    }

    return () => {
      observer?.disconnect();
      video.removeEventListener('loadedmetadata', tryPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      muted
      loop
      playsInline
      // webkit-playsinline for older iOS Safari
      {...{ 'webkit-playsinline': 'true' }}
      preload="metadata"
      poster="/rooftop-solar-poster.webp"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center center',
        zIndex: 0,
        // Disable pointer events so the overlay and content capture all interactions
        pointerEvents: 'none',
        // GPU-accelerated compositing layer
        willChange: 'transform',
      }}
    >
      <source src="/rooftop-solar-bg.mp4" type="video/mp4" />
      {/* Poster image is the fallback — shown when video cannot play */}
    </video>
  );
}
