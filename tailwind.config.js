/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Georgian"', 'system-ui', 'sans-serif'],
        display: ['"BPG Banner Caps"', '"Noto Sans Georgian"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#05070D',
          900: '#0A0E1A',
          800: '#0F1422',
          700: '#161B2E',
          600: '#1F2538',
          500: '#2A3044',
        },
        cream: {
          50: '#F8F8F5',
          100: '#F2EFE6',
          200: '#E8E3D5',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#7C8DF2',
          500: '#4F6BE5',
          600: '#3B5BDB',
          700: '#2F49B8',
          800: '#283D99',
          900: '#1E2E73',
        },
      },
      maxWidth: {
        container: '1440px',
        wide: '1680px',
        full: '1820px',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,91,219,0.14), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(79,107,229,0.08), transparent 70%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,20,34,0.04), 0 8px 24px rgba(15,20,34,0.06)',
        cardHover: '0 1px 2px rgba(15,20,34,0.06), 0 16px 40px rgba(15,20,34,0.10)',
        float: '0 10px 30px rgba(15,20,34,0.10), 0 4px 10px rgba(15,20,34,0.06)',
      },
    },
  },
  plugins: [],
}
