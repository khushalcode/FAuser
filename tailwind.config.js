/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#12B76A',
          dark: '#039855',
          light: '#D1FADF',
          50: '#ECFDF3',
          100: '#D1FADF',
          200: '#A6F4C5',
          300: '#6CE9A6',
          400: '#32D583',
          500: '#12B76A',
          600: '#039855',
          700: '#027A48',
          800: '#05603A',
          900: '#054F31'
        },
        food: '#F59E0B',
        foodLight: '#FEF3C7',
        grocery: '#12B76A',
        groceryLight: '#D1FADF',
        surface: '#F7F8FA',
        surfaceAlt: '#EEF0F3',
        ink: '#101828',
        textmain: '#101828',
        muted: '#667085',
        subtle: '#98A2B3',
        line: '#E4E7EC',
        lineLight: '#F2F4F7'
      },
      borderRadius: {
        'xl2': '1rem'
      },
      fontFamily: {
        sans: ['System']
      }
    }
  },
  plugins: []
};
