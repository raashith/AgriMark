/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        brand: {
          emerald: '#1B4D3E',
          harvestGreen: '#3E7B54',
          harvestGold: '#E5A93C',
          cotton: '#F7F5EE',
          loam: '#07110D',
          deepForest: '#04100B',
          mistGreen: '#9BC7A2',
          electricTeal: '#2DD4BF',
          goldLight: '#FCE196'
        },
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
        },
        agri: {
          primary: '#1B4D3E',
          'primary-hover': '#143B30',
          accent: '#D97706',
          canvas: '#FBF9F2',
          surface: '#FFFFFF',
          'surface-low': '#F6F4ED',
          border: '#E7E5DC',
          dark: '#1C1917',
          muted: '#78716C',
          danger: '#DC2626',
          success: '#16A34A',
        }
      },
      boxShadow: {
        'gold-glow': '0 0 35px -5px rgba(229, 169, 60, 0.35)',
        'emerald-glow': '0 0 40px -5px rgba(27, 77, 62, 0.55)',
        'holo-card': '0 25px 60px -10px rgba(0, 0, 0, 0.75), 0 0 1px 1px rgba(229, 169, 60, 0.25)',
        'neon-edge': 'inset 0 0 15px rgba(45, 212, 191, 0.15), 0 0 20px rgba(229, 169, 60, 0.2)'
      }
    },
  },
  plugins: [],
};

