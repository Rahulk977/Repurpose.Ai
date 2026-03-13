/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette: Ink + Amber/Gold accent
        ink: {
          950: '#0A0A0B',
          900: '#111113',
          800: '#1A1A1E',
          700: '#242428',
          600: '#2E2E34',
          500: '#3D3D45',
          400: '#5A5A65',
          300: '#7A7A88',
          200: '#A0A0B0',
          100: '#C8C8D4',
          50:  '#EEEEF4',
        },
        amber: {
          DEFAULT: '#F59E0B',
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        accent: {
          DEFAULT: '#F59E0B',
          muted: '#92400E',
          glow: 'rgba(245,158,11,0.15)',
        },
        surface: {
          DEFAULT: '#1A1A1E',
          raised: '#242428',
          overlay: '#2E2E34',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'amber-glow': '0 0 30px rgba(245,158,11,0.2), 0 0 60px rgba(245,158,11,0.05)',
        'amber-sm': '0 0 12px rgba(245,158,11,0.15)',
        'surface': '0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4)',
        'lifted': '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'slide-in': 'slideIn 0.4s ease both',
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseAmber: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245,158,11,0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
