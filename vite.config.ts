import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ✅ Vite config for React + Tailwind + Cyber theme support
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

// 🧠 Extend this in tailwind.config.ts or tailwind.config.js
// ⚠️ Tailwind config must be separate from Vite config
// Create tailwind.config.ts:

/** @type {import('tailwindcss').Config} */
export const tailwindConfig = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00ffcc',
        accent: '#ff1eff',
        dark: '#0a0f1a',
        light: '#e0eaff',
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
