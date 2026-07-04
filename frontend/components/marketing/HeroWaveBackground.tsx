'use client';

/**
 * HeroWaveBackground
 *
 * Canvas-based interactive dotted-wave background.
 * Mobile-first: touch events use passive listeners so scroll is never blocked.
 * On mobile (<768px) animation complexity is halved for 60fps on mid-range devices.
 * On desktop, mouse interaction ripples the dots.
 * Respects prefers-reduced-motion — freezes animation when active.
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

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Mobile: coarser grid + no touch interaction (never block scroll)
    const isMobile = window.innerWidth < 768;

    // ── Constants — tuned per device class ───────────────────────────────────
    const DOT_COLOR_BASE = { r: 180, g: 150, b: 110 };
    const BASE_DOT_RADIUS = isMobile ? 1.6 : 1.8;
    const MAX_EXTRA_RADIUS = isMobile ? 2.0 : 3.2;
    const DOT_SPACING = isMobile ? 28 : 22;        // wider grid on mobile → fewer dots → faster
    const BASE_AMPLITUDE = isMobile ? 12 : 18;
    const INTERACTIVE_AMPLITUDE_BOOST = 22;
    const WAVE_SPEED = reducedMotion ? 0 : (isMobile ? 0.018 : 0.025);
    const INTERACTION_RADIUS = 160;
    // Skip every-other frame on mobile to halve GPU load
    const FRAME_SKIP = isMobile ? 2 : 1;

    let time = 0;
    let frameCount = 0;
    let width = 0;
    let height = 0;
    let mouseX: number | null = null;
    let mouseY: number | null = null;
    let targetMouseX: number | null = null;
    let targetMouseY: number | null = null;

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width;
      canvas!.height = height;
    }

    function updateTarget(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      targetMouseX = Math.max(0, Math.min(clientX - rect.left, width));
      targetMouseY = Math.max(0, Math.min(clientY - rect.top, height));
    }

    function smoothMouse() {
      if (targetMouseX !== null && targetMouseY !== null) {
        if (mouseX === null || mouseY === null) {
          mouseX = targetMouseX;
          mouseY = targetMouseY;
        } else {
          mouseX += (targetMouseX - mouseX) * 0.12;
          mouseY += (targetMouseY - mouseY) * 0.12;
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

    function getWaveOffset(gridX: number, gridY: number, t: number, ampMul: number): number {
      const wave1 = Math.sin(gridX * 0.15 + t * 0.7) * Math.cos(gridY * 0.12 + t * 0.5);
      const wave2 = Math.cos(gridX * 0.2 - t * 0.55) * Math.sin(gridY * 0.18 + t * 0.65);
      const wave3 = Math.sin((gridX + gridY) * 0.1 + t * 0.9) * 0.7;
      const baseOffset = (wave1 * 0.7 + wave2 * 0.7 + wave3 * 0.5) * BASE_AMPLITUDE * ampMul;

      let boost = 0;
      if (!isMobile && mouseX !== null && mouseY !== null) {
        const cols = Math.floor(width / DOT_SPACING);
        const rows = Math.floor(height / DOT_SPACING);
        const marginX = (width - cols * DOT_SPACING) / 2 + DOT_SPACING / 2;
        const marginY = (height - rows * DOT_SPACING) / 2 + DOT_SPACING / 2;
        const px = marginX + gridX * DOT_SPACING;
        const py = marginY + gridY * DOT_SPACING;
        const dist = Math.hypot(px - mouseX, py - mouseY);
        if (dist < INTERACTION_RADIUS) {
          const t2 = 1 - dist / INTERACTION_RADIUS;
          const smooth = t2 * t2 * (3 - 2 * t2);
          boost = Math.sin(dist * 0.25 + t * 2.5) * smooth * INTERACTIVE_AMPLITUDE_BOOST;
        }
      }
      return baseOffset + boost;
    }

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
          const horizShift = isMobile ? 0 : getWaveOffset(col + 0.5, row + 0.3, time * 0.9, 0.4) * 0.25;

          const finalX = baseX + horizShift;
          const finalY = baseY + vertShift;

          const intensity = Math.min(1, Math.abs(vertShift) / (BASE_AMPLITUDE + INTERACTIVE_AMPLITUDE_BOOST * 0.7 + 0.1));
          const radius = BASE_DOT_RADIUS + intensity * MAX_EXTRA_RADIUS;
          const alpha = Math.min(0.8, 0.45 + intensity * 0.25);

          let r = DOT_COLOR_BASE.r;
          let g = DOT_COLOR_BASE.g;
          let b = DOT_COLOR_BASE.b;
          let a = alpha;

          if (!isMobile && mouseX !== null && mouseY !== null) {
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

          if (!isMobile && intensity > 0.45 && radius > 2.2) {
            ctx.beginPath();
            ctx.arc(finalX - 0.4, finalY - 0.5, radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,248,235,0.45)';
            ctx.fill();
          }
        }
      }
    }

    function animate() {
      frameCount++;
      time += WAVE_SPEED;
      if (frameCount % FRAME_SKIP === 0) {
        smoothMouse();
        draw();
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();

    // Desktop only: mouse interaction on the hero section
    if (!isMobile) {
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', onMouseLeave);
    }

    // Mobile: NO touch listeners on canvas — scroll must never be blocked
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
      window.removeEventListener('resize', resize);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      // pointer-events-none on mobile — canvas never captures touch events
      className={`absolute inset-0 overflow-hidden pointer-events-none md:pointer-events-auto ${className ?? ''}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
