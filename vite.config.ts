import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default {
  theme: {
    extend: {
      colors: {
        primary: '#00ffcc',
        accent: '#ff1eff',
        dark: '#0a0f1a',
        light: '#e0eaff',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        neon: '0 0 10px #ff1eff'
      },
      animation: {
        blink: 'blink 1.5s step-end infinite'
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        }
      }
    }
  }

// Vite config for React + path alias
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
