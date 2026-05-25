/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Cores do tema — controladas via CSS vars (CMS pode customizar)
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        'primary-dark': 'rgb(var(--c-primary-dark) / <alpha-value>)',
        'primary-soft': 'rgb(var(--c-primary-soft) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',
        'ink-faint': 'rgb(var(--c-ink-faint) / <alpha-value>)',
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        nav: 'rgb(var(--c-nav) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Type scale 1.250 (major third) — editorial
        'xs':   ['0.75rem',  { lineHeight: '1.5' }],
        'sm':   ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1.0625rem',{ lineHeight: '1.7' }],
        'lg':   ['1.25rem',  { lineHeight: '1.55' }],
        'xl':   ['1.5rem',   { lineHeight: '1.4' }],
        '2xl':  ['1.875rem', { lineHeight: '1.3' }],
        '3xl':  ['2.25rem',  { lineHeight: '1.2' }],
        '4xl':  ['3rem',     { lineHeight: '1.1' }],
        '5xl':  ['3.75rem',  { lineHeight: '1.05' }],
        '6xl':  ['4.5rem',   { lineHeight: '1' }],
      },
      spacing: {
        'gutter': '1.5rem',
        'gutter-lg': '2.5rem',
      },
      maxWidth: {
        'container': '1200px',
        'prose-lg': '720px',
      },
      borderRadius: {
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out backwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
