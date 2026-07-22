'use client';

/**
 * AboutMarquee — continuously scrolling horizontal ticker strip.
 * Items: brand principles / domains / keywords.
 * Pauses on hover. Respects prefers-reduced-motion (static display).
 */

const ITEMS = [
  'Solar Energy',
  'Engineering Excellence',
  'Digital Infrastructure',
  'Renewable Future',
  'Indian Innovation',
  'Responsible Technology',
  'Clean Energy',
  'Systems Thinking',
  'Long-term Trust',
  'Tribhuban Concepts',
];

export default function AboutMarquee() {
  // Duplicate items for seamless loop
  const all = [...ITEMS, ...ITEMS];

  return (
    <div className="about-marquee" aria-hidden="true">
      <div className="about-marquee__track">
        {all.map((item, i) => (
          <span key={i} className="about-marquee__item">
            <span className="about-marquee__dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
