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
}

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#0a0a12',
        'cyber-dark-accent': '#1a1a2e',
        'cyber-blue': '#00f0ff',
        'cyber-pink': '#ff2a6d',
        'cyber-purple': '#d300c5',
        'cyber-green': '#00ff9f',
        'cyber-text': '#e2e2e2',
      },
      fontFamily: {
        'tech': ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 3s linear infinite',
        'flicker': 'flicker 3s infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            'text-shadow': '0 0 5px #00ff9f, 0 0 10px #00ff9f, 0 0 20px #00ff9f'
          },
          '20%, 24%, 55%': { 
            'text-shadow': 'none' 
          },
        },
      },
    },
  },
  plugins: [],
}