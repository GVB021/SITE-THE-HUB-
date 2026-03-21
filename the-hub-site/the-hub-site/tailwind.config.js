/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hub: {
          background: '#F4F4F5',
          card: '#FFFFFF',
          text: '#09090B',
          muted: '#71717A',
          border: 'rgba(228,228,231,0.5)',
          accent: '#2563EB',
          accentDark: '#1D4ED8',
          gold: '#C9A84C',
        },
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

