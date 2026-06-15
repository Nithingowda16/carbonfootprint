/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f4fbf7',
          100: '#e8f7ee',
          200: '#c7eed5',
          300: '#a7e4bd',
          400: '#66d18c',
          500: '#26be5b',
          600: '#22ab52',
          700: '#1c8f44',
          800: '#166e35',
          900: '#125b2c',
          950: '#092d16',
        },
        darkbg: {
          50: '#1e293b',
          100: '#0f172a',
          200: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
