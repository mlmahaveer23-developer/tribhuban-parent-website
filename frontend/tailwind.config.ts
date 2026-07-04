import type { Config } from 'tailwindcss';
import { tokens } from './styles/tokens';

const config: Config = {
  // Class-based dark mode using .dark class (also supports data-theme="dark")
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{js,ts}',
  ],
  theme: {
    // Custom breakpoints per design §6.3
    screens: {
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    extend: {
      // ── Colors from design tokens ──────────────────────────────────────────
      colors: {
        copper:  tokens.color.copper,
        gold:    tokens.color.gold,
        ivory:   tokens.color.ivory,
        stone:   tokens.color.stone,
        ink:     tokens.color.ink,
        // semantic / CSS-variable-backed
        bg:      tokens.color.bg,
        fg:      tokens.color.fg,
        muted:   tokens.color.muted,
        accent:  tokens.color.accent,
        ring:    tokens.color.ring,
        // status
        success: tokens.color.success,
        warning: tokens.color.warning,
        danger:  tokens.color.danger,
        info:    tokens.color.info,
      },

      // ── Border radius ──────────────────────────────────────────────────────
      borderRadius: {
        sm:   tokens.radius.sm,
        md:   tokens.radius.md,
        DEFAULT: tokens.radius.md,
        lg:   tokens.radius.lg,
        xl:   tokens.radius.xl,
        pill: tokens.radius.pill,
      },

      // ── Spacing (extend so Tailwind defaults remain) ───────────────────────
      spacing: {
        '1':  tokens.space[1],
        '2':  tokens.space[2],
        '3':  tokens.space[3],
        '4':  tokens.space[4],
        '6':  tokens.space[6],
        '8':  tokens.space[8],
        '12': tokens.space[12],
        '16': tokens.space[16],
        '24': tokens.space[24],
      },

      // ── Box shadow ─────────────────────────────────────────────────────────
      boxShadow: {
        sm: tokens.shadow.sm,
        md: tokens.shadow.md,
        lg: tokens.shadow.lg,
        DEFAULT: tokens.shadow.md,
      },

      // ── Z-index ────────────────────────────────────────────────────────────
      zIndex: {
        base:    String(tokens.z.base),
        sticky:  String(tokens.z.sticky),
        drawer:  String(tokens.z.drawer),
        modal:   String(tokens.z.modal),
        toast:   String(tokens.z.toast),
      },

      // ── Max width ──────────────────────────────────────────────────────────
      maxWidth: {
        content: '1280px',
        prose:   '68ch',
      },

      // ── Typography scale (fluid via clamp — set as fontSize entries) ───────
      fontSize: {
        'display': ['clamp(3rem,5vw,4.5rem)',   { lineHeight: '1.1' }],
        'h1':      ['clamp(2.25rem,4vw,3rem)',   { lineHeight: '1.15' }],
        'h2':      ['clamp(1.75rem,3vw,2.25rem)',{ lineHeight: '1.2' }],
        'h3':      ['clamp(1.375rem,2.5vw,1.75rem)',{ lineHeight: '1.3' }],
        'body-lg': ['clamp(1rem,1.5vw,1.125rem)',{ lineHeight: '1.5' }],
        'body':    ['1rem',                       { lineHeight: '1.5' }],
        'small':   ['0.875rem',                   { lineHeight: '1.5' }],
      },

      // ── Font families ──────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },

      // ── Grid ───────────────────────────────────────────────────────────────
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
