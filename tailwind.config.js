/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0b1a2b',
          800: '#10233a',
          700: '#1a3658',
        },
        sea: {
          500: '#2f7fa5',
          400: '#5ba7c5',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -20px rgba(11, 26, 43, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out both',
      },
    },
  },
  plugins: [],
}
