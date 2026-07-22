'use client';

/**
 * LeadershipCards — Premium leadership showcase.
 *
 * Layout (desktop): [Employee] [CEO — centre, larger] [Employee]
 * On click/keyboard:
 *   - Card flips with a 3D Y-axis flip (front → back shows detail)
 *   - Bio text is revealed word-by-word via CSS animation
 *   - Active card scales up slightly and glows
 *
 * Mobile: stacked vertically, CEO first.
 * Accessible: keyboard nav, role="button", aria-expanded, aria-label.
 * Respects prefers-reduced-motion (instant transitions).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/utils/motion';

export interface LeaderCard {
  initials: string;
  name: string;
  role: string;
  bio: string;
}

interface Props {
  leaders: readonly LeaderCard[];
}

/** Split bio string into words for staggered reveal */
function BioWords({ text, active, reduced }: { text: string; active: boolean; reduced: boolean }) {
  const words = text.split(' ');
  return (
    <p className="lc2-bio" aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`lc2-bio__word ${active ? 'lc2-bio__word--visible' : ''} ${reduced ? 'lc2-bio__word--reduced' : ''}`}
          style={{ transitionDelay: reduced ? '0ms' : `${i * 35}ms` }}
          aria-hidden="true"
        >
          {word}{' '}
        </span>
      ))}
      {/* Screen-reader-only full text */}
    </p>
  );
}

interface CardProps {
  leader: LeaderCard;
  index: number;
  isCeo: boolean;
  isFlipped: boolean;
  reduced: boolean;
  onFlip: () => void;
  onKey: (e: React.KeyboardEvent) => void;
}

function LeaderCardItem({ leader, isCeo, isFlipped, reduced, onFlip, onKey }: CardProps) {
  return (
    <div
      className={`lc2-scene ${isCeo ? 'lc2-scene--ceo' : ''}`}
    >
      <div
        className={`lc2-card ${isFlipped ? 'lc2-card--flipped' : ''} ${reduced ? 'lc2-card--reduced' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={`${leader.name}, ${leader.role}. ${isFlipped ? 'Click to close' : 'Click to read bio'}`}
        aria-expanded={isFlipped}
        onClick={onFlip}
        onKeyDown={onKey}
      >
        {/* ── Front face ── */}
        <div className="lc2-card__front">
          {isCeo && <span className="lc2-card__badge">Leadership</span>}
          <div className="lc2-card__avatar">
            <span className="lc2-card__initials">{leader.initials}</span>
          </div>
          <h3 className="lc2-card__name">{leader.name}</h3>
          <p className="lc2-card__role">{leader.role}</p>
          <span className="lc2-card__hint">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            View profile
          </span>
        </div>

        {/* ── Back face (bio + word reveal) ── */}
        <div className="lc2-card__back">
          <div className="lc2-card__back-top">
            <div className="lc2-card__avatar lc2-card__avatar--sm">
              <span className="lc2-card__initials lc2-card__initials--sm">{leader.initials}</span>
            </div>
            <div>
              <h3 className="lc2-card__name lc2-card__name--sm">{leader.name}</h3>
              <p className="lc2-card__role">{leader.role}</p>
            </div>
          </div>
          <BioWords text={leader.bio} active={isFlipped} reduced={reduced} />
          <button
            className="lc2-card__close"
            onClick={(e) => { e.stopPropagation(); onFlip(); }}
            tabIndex={isFlipped ? 0 : -1}
            aria-label="Close profile"
            type="button"
          >
            ✕ Close
          </button>
        </div>

        {/* Glow on active */}
        {isFlipped && <div className="lc2-card__glow" aria-hidden="true" />}
      </div>
    </div>
  );
}

export default function LeadershipCards({ leaders }: Props) {
  const [flipped, setFlipped] = useState<number | null>(null);
  const reduced = useReducedMotion();

  // Find the CEO index (role contains 'CEO')
  const ceoIndex = leaders.findIndex(l => l.role.toUpperCase().includes('CEO'));

  // Build display order: others before CEO, CEO in middle, others after
  const orderedIndices: number[] = [];
  const beforeCeo = leaders
    .map((_, i) => i)
    .filter(i => i !== ceoIndex && i < ceoIndex + Math.ceil((leaders.length - 1) / 2));
  const afterCeo = leaders
    .map((_, i) => i)
    .filter(i => i !== ceoIndex && !beforeCeo.includes(i));

  // Interleave: left side, CEO, right side
  const leftCount = Math.floor((leaders.length - 1) / 2);
  for (let i = 0; i < leftCount; i++) {
    if (i < leaders.length - 1) orderedIndices.push(beforeCeo[i] ?? afterCeo[i] ?? i);
  }
  orderedIndices.push(ceoIndex >= 0 ? ceoIndex : 0);
  for (let i = leftCount; i < leaders.length - 1; i++) {
    const src = afterCeo[i - leftCount] ?? beforeCeo[i - leftCount];
    if (src !== undefined) orderedIndices.push(src);
  }

  // Fallback: if ordering produced duplicates or gaps, just use [0, ceo, rest]
  const seen = new Set<number>();
  const safeOrder = orderedIndices.filter(i => {
    if (seen.has(i)) return false;
    seen.add(i);
    return true;
  });
  while (safeOrder.length < leaders.length) {
    for (let i = 0; i < leaders.length; i++) {
      if (!safeOrder.includes(i)) safeOrder.push(i);
    }
  }

  const handleFlip = useCallback((i: number) => {
    setFlipped(prev => (prev === i ? null : i));
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip(i); }
    if (e.key === 'Escape') setFlipped(null);
  }, [handleFlip]);

  return (
    <div className="lc2-wrap">
      <div className="lc2-grid">
        {safeOrder.map((leaderIndex) => {
          const leader = leaders[leaderIndex];
          const isCeo = leaderIndex === (ceoIndex >= 0 ? ceoIndex : -1);
          return (
            <LeaderCardItem
              key={leader.role}
              leader={leader}
              index={leaderIndex}
              isCeo={isCeo}
              isFlipped={flipped === leaderIndex}
              reduced={reduced ?? false}
              onFlip={() => handleFlip(leaderIndex)}
              onKey={(e) => handleKey(e, leaderIndex)}
            />
          );
        })}
      </div>
      <p className="lc2-hint" aria-hidden="true">Click any card to reveal their profile</p>
    </div>
  );
}
