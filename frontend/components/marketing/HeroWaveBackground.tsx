'use client';

/**
 * HeroWaveBackground
 *
 * Canvas-based interactive dotted-wave background ported from HeroBG.html.
 * Dots ripple in wave patterns and react to mouse/touch position.
 * Fully respects prefers-reduced-motion — disables animation when active.
 */

import { useEffect, useRef } from 'react';

interface HeroWaveBackgroundProps {
  className?: string;
}

export default function HeroWaveBackground({ className }: HeroWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Constants ────────────────────────────────────────────────────────────
    const DOT_COLOR_BASE = { r: 180, g: 150, b: 110 }; // warm copper tone
    const BASE_DOT_RADIUS = 1.8;
    const MAX_EXTRA_RADIUS = 3.2;
    const DOT_SPACING = 22;
    const BASE_AMPLITUDE = 18;
    const INTERACTIVE_AMPLITUDE_BOOST = 22;
    const WAVE_SPEED = reducedMotion ? 0 : 0.025;
    const INTERACTION_RADIUS = 160;

    let time = 0;
    let width = 0;
    let height = 0;
    let mouseX: number | null = null;
    let mouseY: number | null = null;
    let targetMouseX: number | null = null;
    let targetMouseY: number | null = null;

    // ── Resize ───────────────────────────────────────────────────────────────
    function resize() {
      const rect = container!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width;
      canvas!.height = height;
    }

    // ── Mouse / touch ────────────────────────────────────────────────────────
    function updateTarget(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      targetMouseX = Math.max(0, Math.min(clientX - rect.left, width));
      targetMouseY = Math.max(0, Math.min(clientY - rect.top, height));
    }

    function smoothMouse() {
      if (targetMouseX !== null && targetMouseY !== null) {
        const lerpFactor = 0.12;
        if (mouseX === null || mouseY === null) {
          mouseX = targetMouseX;
          mouseY = targetMouseY;
        } else {
          mouseX += (targetMouseX - mouseX) * lerpFactor;
          mouseY += (targetMouseY - mouseY) * lerpFactor;
        }
      } else if (mouseX !== null && mouseY !== null) {
        const cx = width / 2;
        const cy = height / 2;
        mouseX += (cx - mouseX) * 0.03;
        mouseY += (cy - mouseY) * 0.03;
        if (Math.abs(mouseX - cx) < 0.5 && Math.abs(mouseY - cy) < 0.5) {
          mouseX = null;
          mouseY = null;
        }
      }
    }

    const onMouseMove = (e: MouseEvent) => updateTarget(e.clientX, e.clientY);
    const onMouseLeave = () => { targetMouseX = null; targetMouseY = null; };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) updateTarget(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      targetMouseX = null;
      targetMouseY = null;
    };

    // ── Wave offset ──────────────────────────────────────────────────────────
    function getWaveOffset(gridX: number, gridY: number, t: number, ampMul: number): number {
      const wave1 = Math.sin(gridX * 0.15 + t * 0.7) * Math.cos(gridY * 0.12 + t * 0.5);
      const wave2 = Math.cos(gridX * 0.2 - t * 0.55) * Math.sin(gridY * 0.18 + t * 0.65);
      const wave3 = Math.sin((gridX + gridY) * 0.1 + t * 0.9) * 0.7;
      const baseOffset = (wave1 * 0.7 + wave2 * 0.7 + wave3 * 0.5) * BASE_AMPLITUDE * ampMul;

      let boost = 0;
      if (mouseX !== null && mouseY !== null) {
        const cols = Math.floor(width / DOT_SPACING);
        const rows = Math.floor(height / DOT_SPACING);
        const marginX = (width - cols * DOT_SPACING) / 2 + DOT_SPACING / 2;
        const marginY = (height - rows * DOT_SPACING) / 2 + DOT_SPACING / 2;
        const px = marginX + gridX * DOT_SPACING;
        const py = marginY + gridY * DOT_SPACING;
        const dist = Math.hypot(px - mouseX, py - mouseY);
        if (dist < INTERACTION_RADIUS) {
          const smooth = (1 - dist / INTERACTION_RADIUS) ** 2 * (3 - 2 * (1 - dist / INTERACTION_RADIUS));
          boost = Math.sin(dist * 0.25 + t * 2.5) * smooth * INTERACTIVE_AMPLITUDE_BOOST;
        }
      }
      return baseOffset + boost;
    }

    // ── Draw ─────────────────────────────────────────────────────────────────
    function draw() {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.floor(width / DOT_SPACING);
      const rows = Math.floor(height / DOT_SPACING);
      const marginX = (width - cols * DOT_SPACING) / 2 + DOT_SPACING / 2;
      const marginY = (height - rows * DOT_SPACING) / 2 + DOT_SPACING / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = marginX + col * DOT_SPACING;
          const baseY = marginY + row * DOT_SPACING;

          const vertShift = getWaveOffset(col, row, time, 1.0);
          const horizShift = getWaveOffset(col + 0.5, row + 0.3, time * 0.9, 0.4) * 0.25;

          const finalX = baseX + horizShift;
          const finalY = baseY + vertShift;

          const intensity = Math.min(1, Math.abs(vertShift) / (BASE_AMPLITUDE + INTERACTIVE_AMPLITUDE_BOOST * 0.7 + 0.1));
          const radius = BASE_DOT_RADIUS + intensity * MAX_EXTRA_RADIUS;
          const alpha = Math.min(0.8, 0.45 + intensity * 0.25);

          // Blend to slightly darker copper near mouse
          let r = DOT_COLOR_BASE.r;
          let g = DOT_COLOR_BASE.g;
          let b = DOT_COLOR_BASE.b;
          let a = alpha;

          if (mouseX !== null && mouseY !== null) {
            const dist = Math.hypot(finalX - mouseX, finalY - mouseY);
            if (dist < INTERACTION_RADIUS * 0.9) {
              const blend = Math.max(0, 1 - dist / (INTERACTION_RADIUS * 0.8));
              r = Math.round(r - blend * 20);
              g = Math.round(g - blend * 20);
              b = Math.round(b - blend * 15);
              a = Math.min(0.9, a + blend * 0.1);
            }
          }

          ctx.beginPath();
          ctx.arc(finalX, finalY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fill();

          // Subtle specular highlight on taller dots
          if (intensity > 0.45 && radius > 2.2) {
            ctx.beginPath();
            ctx.arc(finalX - 0.4, finalY - 0.5, radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,248,235,0.45)';
            ctx.fill();
          }
        }
      }
    }

    // ── Animation loop ───────────────────────────────────────────────────────
    function animate() {
      time += WAVE_SPEED;
      smoothMouse();
      draw();
      rafRef.current = requestAnimationFrame(animate);
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    resize();
    animate();

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('resize', resize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(container);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', resize);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-auto ${className ?? ''}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
