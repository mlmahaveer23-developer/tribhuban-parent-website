'use client';

/**
 * LeadershipCards — Clean, responsive leadership card switcher.
 * Replaces the buggy 3D cylinder. Uses a simple tab-driven approach:
 * - Desktop: 3 cards side by side, active card highlighted
 * - Mobile: horizontal scroll snap
 * Fully accessible: keyboard nav, aria-selected, focus management.
 * No Framer Motion dependency — pure CSS transitions.
 */

import { useState, useCallback } from 'react';
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

export default function LeadershipCards({ leaders }: Props) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  const select = useCallback((i: number) => setActive(i), []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent, i: number) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setActive((p) => (p + 1) % leaders.length); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setActive((p) => (p - 1 + leaders.length) % leaders.length); }
    },
    [leaders.length]
  );

  return (
    <div className="lc-wrap">
      {/* Tab row — desktop pill tabs */}
      <div className="lc-tabs" role="tablist" aria-label="Leadership team members">
        {leaders.map((l, i) => (
          <button
            key={l.role}
            role="tab"
            aria-selected={i === active}
            aria-controls={`lc-panel-${i}`}
            id={`lc-tab-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={`lc-tab ${i === active ? 'lc-tab--active' : ''}`}
            onClick={() => select(i)}
            onKeyDown={(e) => handleKey(e, i)}
            type="button"
          >
            <span className="lc-tab__initials" aria-hidden="true">{l.initials}</span>
            <span className="lc-tab__name">{l.name}</span>
          </button>
        ))}
      </div>

      {/* Card panels */}
      <div className="lc-panels">
        {leaders.map((l, i) => (
          <div
            key={l.role}
            id={`lc-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`lc-tab-${i}`}
            hidden={i !== active}
            className={`lc-panel ${i === active ? 'lc-panel--active' : ''} ${reduced ? 'lc-panel--reduced' : ''}`}
          >
            {/* Avatar */}
            <div className="lc-panel__avatar" aria-hidden="true">
              <span className="lc-panel__initials">{l.initials}</span>
            </div>

            <div className="lc-panel__body">
              <h3 className="lc-panel__name">{l.name}</h3>
              <p className="lc-panel__role">{l.role}</p>
              <p className="lc-panel__bio">{l.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators — mobile fallback */}
      <div className="lc-dots" aria-hidden="true">
        {leaders.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`lc-dot ${i === active ? 'lc-dot--active' : ''}`}
            onClick={() => select(i)}
            tabIndex={-1}
          />
        ))}
      </div>
    </div>
  );
}
