// styles/tokens.ts — single source of truth, consumed by Tailwind theme + CSS vars
export const tokens = {
  color: {
    // Indian premium palette: Copper / Gold / Ivory / Warm Stone
    copper:  { 50:'#FBF3EE', 300:'#D8A585', 500:'#B87333', 700:'#8A5322', 900:'#5C3616' },
    gold:    { 300:'#E7C989', 500:'#C9A227', 700:'#9C7C1E' },
    ivory:   { 50:'#FEFDFB', 100:'#F7F3EC', 200:'#EFE8DB' },
    stone:   { 300:'#C9BBA8', 500:'#8C7B66', 700:'#5A4E3F', 900:'#2E271F' },
    ink:     { 500:'#1C1815', 700:'#12100E' }, // near-black warm text
    // semantic — resolved at runtime via CSS variables (supports light/dark swap)
    bg:      'var(--bg)',
    fg:      'var(--fg)',
    muted:   'var(--muted)',
    accent:  'var(--accent)',
    ring:    'var(--ring)',
    // status
    success: '#2E7D5B',
    warning: '#B8860B',
    danger:  '#A83232',
    info:    '#3A6EA5',
  },
  radius: { sm:'6px', md:'10px', lg:'16px', xl:'24px', pill:'999px' },
  space:  {
    // 4 px base scale
    1:'4px', 2:'8px', 3:'12px', 4:'16px',
    6:'24px', 8:'32px', 12:'48px', 16:'64px', 24:'96px',
  },
  shadow: {
    // restrained, premium elevation (no glass overload)
    sm: '0 1px 2px rgba(46,39,31,.06)',
    md: '0 4px 12px rgba(46,39,31,.08)',
    lg: '0 12px 32px rgba(46,39,31,.10)',
  },
  z: { base:0, sticky:100, drawer:200, modal:300, toast:400 },
} as const;

export type Tokens = typeof tokens;
