'use client';

/**
 * LeadershipCylinder — Interactive 3D carousel for leadership cards.
 *
 * Arranges leader cards in a 3D cylinder using CSS transforms.
 * The selected card rotates to the front and scales up.
 * Fully accessible with keyboard navigation and respects reduced motion.
 *
 * Usage:
 *   <LeadershipCylinder leaders={leaders} />
 */

import { useState, useCallback } from 'react';
import { useReducedMotion } from '@/lib/utils/motion';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Leader {
  initials: string;
  name: string;
  role: string;
  bio: string;
}

interface LeadershipCylinderProps {
  leaders: readonly Leader[];
  className?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const CYLINDER_RADIUS = 260; // px — distance from center to card
const TRANSITION_DURATION = '0.8s';
const TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const CARD_SCALE_ACTIVE = 1.1;

// ── Component ───────────────────────────────────────────────────────────────

export default function LeadershipCylinder({
  leaders,
  className = '',
}: LeadershipCylinderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  // Number of leaders determines the angle between cards
  const totalCards = leaders.length;
  const anglePerCard = 360 / totalCards;

  // Calculate cylinder rotation to bring selected card to front (0°)
  const cylinderRotation = -selectedIndex * anglePerCard;

  // Handle card selection
  const handleCardClick = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedIndex(index);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalCards) % totalCards);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalCards);
      }
    },
    [totalCards]
  );

  // If reduced motion is preferred, use a simpler flat layout
  if (reducedMotion) {
    return (
      <div className={`leadership-cylinder--reduced ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {leaders.map((leader, index) => (
            <LeaderCard
              key={leader.role}
              leader={leader}
              index={index}
              isSelected={index === selectedIndex}
              onClick={() => handleCardClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              reducedMotion
            />
          ))}
        </div>
        <NavigationDots
          total={totalCards}
          selected={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </div>
    );
  }

  return (
    <div className={`leadership-cylinder ${className}`}>
      {/* 3D Cylinder container */}
      <div
        className="leadership-cylinder__scene"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          className="leadership-cylinder__cylinder"
          style={{
            transform: `rotateY(${cylinderRotation}deg)`,
            transition: `transform ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
            transformStyle: 'preserve-3d',
          }}
        >
          {leaders.map((leader, index) => {
            const cardAngle = index * anglePerCard;
            const isSelected = index === selectedIndex;

            return (
              <LeaderCard
                key={leader.role}
                leader={leader}
                index={index}
                isSelected={isSelected}
                onClick={() => handleCardClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                angle={cardAngle}
                radius={CYLINDER_RADIUS}
              />
            );
          })}
        </div>
      </div>

      {/* Navigation dots */}
      <NavigationDots
        total={totalCards}
        selected={selectedIndex}
        onSelect={setSelectedIndex}
      />
    </div>
  );
}

// ── LeaderCard Subcomponent ─────────────────────────────────────────────────

interface LeaderCardProps {
  leader: Leader;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  angle?: number;
  radius?: number;
  reducedMotion?: boolean;
}

function LeaderCard({
  leader,
  index: _index,
  isSelected,
  onClick,
  onKeyDown,
  angle = 0,
  radius = 0,
  reducedMotion = false,
}: LeaderCardProps) {
  // Calculate 3D position for cylinder layout
  const transform = reducedMotion
    ? undefined
    : `rotateY(${angle}deg) translateZ(${radius}px)`;

  // Scale up selected card in 3D mode
  const scale = !reducedMotion && isSelected ? CARD_SCALE_ACTIVE : 1;

  return (
    <article
      className={`leadership-cylinder__card ${isSelected ? 'leadership-cylinder__card--active' : ''}`}
      style={{
        transform: transform
          ? `${transform} scale(${scale})`
          : undefined,
        transition: `transform ${TRANSITION_DURATION} ${TRANSITION_EASING}, background-color 0.3s ease`,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${leader.name}, ${leader.role}. ${isSelected ? 'Currently selected' : 'Click to select'}`}
      aria-pressed={isSelected}
    >
      {/* Avatar placeholder */}
      <div
        aria-hidden="true"
        className="leadership-cylinder__avatar"
      >
        <span className="text-sm font-bold text-[var(--accent)]">
          {leader.initials}
        </span>
      </div>

      <div className="leadership-cylinder__content">
        <h3 className="font-display text-lg font-semibold text-[var(--fg)]">
          {leader.name}
        </h3>
        <p className="text-sm text-[var(--accent)] font-medium mt-0.5">
          {leader.role}
        </p>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-3">
          {leader.bio}
        </p>
      </div>
    </article>
  );
}

// ── NavigationDots Subcomponent ─────────────────────────────────────────────

interface NavigationDotsProps {
  total: number;
  selected: number;
  onSelect: (index: number) => void;
}

function NavigationDots({ total, selected, onSelect }: NavigationDotsProps) {
  return (
    <div
      className="leadership-cylinder__dots"
      role="tablist"
      aria-label="Leadership carousel navigation"
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          className={`leadership-cylinder__dot ${index === selected ? 'leadership-cylinder__dot--active' : ''}`}
          onClick={() => onSelect(index)}
          role="tab"
          aria-selected={index === selected}
          aria-label={`View leader ${index + 1} of ${total}`}
          type="button"
        />
      ))}
    </div>
  );
}
