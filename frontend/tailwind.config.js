/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        client: { DEFAULT: '#6366f1', light: '#eef2ff', dark: '#4f46e5' },
        worker: { DEFAULT: '#f59e0b', light: '#fffbeb', dark: '#d97706' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
