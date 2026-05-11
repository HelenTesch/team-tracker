/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1117',
          secondary: '#1A1D27',
          tertiary: '#23273A',
        },
        accent: {
          blue: '#4F8EF7',
          teal: '#00C9B1',
          orange: '#FF8C42',
          petrol: '#0F6E7C',
        },
        stack: {
          backend: '#7C5CFC',
          frontend: '#4F8EF7',
          general: '#8B93B0',
        },
        textc: {
          primary: '#F0F2F8',
          secondary: '#8B93B0',
        },
        borderc: '#2E3248',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
