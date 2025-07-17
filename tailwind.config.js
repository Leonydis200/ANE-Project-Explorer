// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'cyber-green': '#39ff14',
        'background': '#000000',
        'panel-bg': '#111111',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
};
