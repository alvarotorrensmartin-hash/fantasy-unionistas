/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        union: {
          black: '#111111',
          white: '#ffffff',
          gray:  '#e5e7eb',
          accent: '#d4af37', // dorado más profundo
        },
      },
    },
  },
  plugins: [],
};



