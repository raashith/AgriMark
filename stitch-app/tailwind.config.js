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
        agri: {
          primary: '#1B4D3E',       // Chlorophyll Emerald
          'primary-hover': '#143B30',
          accent: '#D97706',        // Harvest Gold / Amber
          canvas: '#FBF9F2',        // Warm Cotton Cream
          surface: '#FFFFFF',       // Card Clean Surface
          'surface-low': '#F6F4ED', // Soft Subdued Surface
          border: '#E7E5DC',        // Subtle Sand Border
          dark: '#19201D',          // Loam Black
          emerald: '#1B4D3E',
          harvest: '#3E7B54',
          gold: '#E5A93C',
          cream: '#F7F5EE',
          loam: '#19201D',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
