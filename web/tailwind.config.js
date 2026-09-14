/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        earth: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          800: '#854d0e',
        },
        dark: {
          bg: '#0a0f0d',
          card: '#121a16',
          border: '#1e2d26',
        }
      },
    },
  },
  plugins: [],
};
