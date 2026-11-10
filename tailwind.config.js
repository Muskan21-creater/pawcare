const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: token('ink'), soft: token('ink-soft'), muted: token('ink-muted') },
        brand: { DEFAULT: token('brand'), deep: token('brand-deep'), tint: token('brand-tint') },
        surface: token('surface'),
        line: token('line'),
        sun: token('sun'),
        alert: { DEFAULT: token('alert'), tint: token('alert-tint') },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(14 27 44 / 0.04), 0 8px 24px -12px rgb(14 27 44 / 0.12)',
        lift: '0 2px 4px rgb(14 27 44 / 0.05), 0 18px 40px -16px rgb(14 27 44 / 0.22)',
      },
    },
  },
  plugins: [],
};
