'use client';

/**
 * AuthCard — shared visual shell for Login / Sign Up / Forgot Password.
 *
 * Layout: full-viewport split
 *   Left  (hidden on mobile): decorative brand panel with SVG mandala + tagline
 *   Right: white card with the form content (children)
 *
 * Uses the existing Tribhuban design tokens — no new colours introduced.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: React.ReactNode;
}

// Minimal inline SVG mandala (same motif family as HeroBG)
function BrandPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between h-full p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1C1815 0%, #2E1A0E 60%, #3D2208 100%)' }}
      aria-hidden="true"
    >
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(180,165,140,0.45) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative mandala SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 400 400"
          className="w-[480px] h-[480px] opacity-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[180, 150, 120, 90, 60, 30].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} stroke="#C9A227" strokeWidth="0.8" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            return (
              <line
                key={i}
                x1="200" y1="200"
                x2={200 + Math.cos(angle) * 190}
                y2={200 + Math.sin(angle) * 190}
                stroke="#C9A227" strokeWidth="0.5"
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8;
            const x = 200 + Math.cos(angle) * 100;
            const y = 200 + Math.sin(angle) * 100;
            return <circle key={i} cx={x} cy={y} r="6" fill="#C9A227" fillOpacity="0.4" />;
          })}
          <circle cx="200" cy="200" r="18" fill="#B45309" fillOpacity="0.3" />
          <circle cx="200" cy="200" r="8" fill="#C9A227" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10">
        <span className="font-display font-semibold text-xl text-white/90 hover:text-white transition-colors">
          Tribhuban Concepts
        </span>
      </Link>

      {/* Tagline */}
      <div className="relative z-10 space-y-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.25)' }}
        >
          <span>☀</span>
          Swarga · Martya · Patala
        </div>
        <h2 className="font-display text-3xl font-semibold text-white leading-tight">
          Technology That<br />
          <span style={{ color: '#C9A227' }}>Reaches Everywhere</span>
        </h2>
        <p className="text-sm text-white/60 leading-relaxed max-w-xs">
          Join thousands of homes and businesses transforming their energy future with Tribhuban Concepts.
        </p>
      </div>

      {/* Bottom trust signals */}
      <div className="relative z-10 flex items-center gap-6">
        {[
          { icon: '🔒', label: 'Secure & Private' },
          { icon: '⚡', label: 'Instant Access' },
          { icon: '🌿', label: 'Green Energy' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-sm">{item.icon}</span>
            <span className="text-xs text-white/50">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel (desktop only) */}
      <BrandPanel />

      {/* Right — form area */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-[var(--bg)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile logo (shown only when left panel is hidden) */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="font-display font-semibold text-xl text-[var(--fg)] hover:text-[var(--accent)] transition-colors">
              Tribhuban Concepts
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
