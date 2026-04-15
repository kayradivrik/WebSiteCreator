import { tailwindBuilderSafelistForScan } from './src/lib/tailwindSafelistClasses.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/site-export.css',
    './src/lib/wbTheme.css',
    { raw: tailwindBuilderSafelistForScan, extension: 'html' },
  ],
  darkMode: 'class',
  safelist: [
    {
      pattern:
        /^(bg|text|border|from|to|via)-(slate|gray|zinc|blue|indigo|red|emerald|amber|white|black|transparent|current)(-(50|100|200|300|400|500|600|700|800|900|950))?$/,
      variants: ['hover', 'focus', 'dark', 'sm', 'md', 'lg'],
    },
    {
      pattern: /^(top|right|bottom|left)-(\d+|auto|full|px)$/,
      variants: ['sm', 'md', 'lg'],
    },
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [],
};
