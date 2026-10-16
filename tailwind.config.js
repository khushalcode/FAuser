/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A00',
          dark: '#E56700',
          light: '#FFE9D6',
          50: '#FFF5EB',
          100: '#FFE9D6',
          200: '#FFD1A8',
          300: '#FFB270',
          400: '#FF9340',
          500: '#FF7A00',
          600: '#E56700',
          700: '#C25400',
          800: '#8F3E00',
          900: '#662C00'
        },
        food: '#FF7A00',
        foodLight: '#FFE9D6',
        grocery: '#12B76A',
        groceryLight: '#D1FADF',
        surface: '#FAF7F4',
        surfaceAlt: '#F3EEE9',
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
