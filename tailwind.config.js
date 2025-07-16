/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // example, customize as needed
        muted: '#f3f4f6',
        foreground: '#111827',
        'muted-foreground': '#6b7280',
        accent: '#e0f2fe',
      },
    },
  },
  plugins: [],
}
