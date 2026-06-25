import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sea: '#0A4D8C',
        turquoise: '#2CBCCB',
        white: '#FFFFFF',
        gold: '#C9A227',
        sand: '#E8D8B5',
        graphite: '#3C3C3C',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(10, 77, 140, 0.14)',
        premium: '0 24px 70px rgba(60, 60, 60, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
