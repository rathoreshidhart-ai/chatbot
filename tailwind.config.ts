import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#0a0a0c',
          sidebar: '#111114',
          input: '#09090b',
          surface: '#141418',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
        },
        text: {
          primary: '#e0e0e4',
          secondary: '#6b6b80',
          code: '#e879f9',
        },
        bubble: {
          user: '#14141e',
          ai: 'transparent',
        },
        status: {
          error: '#ef4444',
          warning: '#f59e0b',
          success: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Söhne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        chat: ['15px', '1.65'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease forwards',
        'slide-in': 'slideIn 300ms ease-in-out forwards',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
