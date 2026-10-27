/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0610',
          soft: '#08040c',
          card: '#120a1a',
          elevated: '#1a1026',
        },
        border: {
          DEFAULT: 'rgba(168, 85, 247, 0.16)',
          soft: 'rgba(168, 85, 247, 0.08)',
          strong: 'rgba(168, 85, 247, 0.32)',
        },
        brand: {
          DEFAULT: '#a855f7',
          soft: '#c084fc',
          deep: '#7e22ce',
        },
        accent: {
          DEFAULT: '#c084fc',
          soft: '#d8b4fe',
          deep: '#9333ea',
        },
        muted: '#a095b0',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(168, 85, 247, 0.55)',
        'glow-accent': '0 0 40px -8px rgba(192, 132, 252, 0.55)',
        'glow-purple': '0 0 48px -6px rgba(168, 85, 247, 0.8)',
        card: '0 4px 24px -8px rgba(0, 0, 0, 0.9)',
        soft: '0 2px 12px -4px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
        'gradient-brand-soft':
          'linear-gradient(135deg, rgba(107,33,168,0.25) 0%, rgba(168,85,247,0.25) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        float: 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        drift: 'drift 12s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        drift: {
          '0%': { transform: 'translateY(0)', opacity: 0 },
          '15%': { opacity: 0.8 },
          '100%': { transform: 'translateY(-700px)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
 