/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0DC',
          100: '#d4e8c8',
          200: '#c2e0b4',
          300: '#a8d492',
          400: '#8ec870',
          500: '#55883B',
          600: '#55883B',
          700: '#467234',
          800: '#375c2a',
          900: '#284620',
        },
        secondary: {
          50: '#f5ebe0',
          100: '#edd9c8',
          200: '#e5c7b0',
          300: '#d3a87d',
          400: '#c1894a',
          500: '#9A6735',
          600: '#9A6735',
          700: '#7f552b',
          800: '#654321',
          900: '#4a3117',
        },
        accent: {
          500: '#55883B',
          600: '#467234',
        },
        bgLight: '#E6F0DC'
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-nature': 'linear-gradient(135deg, #E6F0DC 0%, #d4e8c8 100%)',
      }
    },
  },
  plugins: [],
}
