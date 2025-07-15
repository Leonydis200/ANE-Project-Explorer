// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00ffcc',
        accent: '#ff1eff',
        dark: '#0a0f1a',
        light: '#e0eaff',
        'cyber-green': '#00ffcc',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px #ff1eff',
      },
      animation: {
        blink: 'blink 1.5s step-end infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
