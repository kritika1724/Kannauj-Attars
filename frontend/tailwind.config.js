/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Heritage Royal (authentic + premium)
        ink: '#111B3A',
        muted: '#6E6E6E',
        sand: '#FFFFFF',
        clay: '#F6F7FB',
        ember: '#111B3A',
        emberDark: '#0B122B',
        midnight: '#070B18',
        ruby: '#5A3A1E',
        gold: '#C9A24A',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        soft: '0 24px 60px rgba(17, 27, 58, 0.20)',
      },
    },
  },
  plugins: [],
}
