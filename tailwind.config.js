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
        pastel: {
          sky: '#4A90E2',
          skyLight: '#F0F7FF',
          skyDark: '#2C5282',
          lavender: '#8A70D6',
          lavenderLight: '#F5F3FF',
          mint: '#10B981',
          mintLight: '#ECFDF5',
          peach: '#F97316',
          peachLight: '#FFF7ED',
          rose: '#F43F5E',
          roseLight: '#FFF1F2',
          calmBg: '#F8FAFC',
          cardBg: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        pastel: '0 10px 25px -5px rgba(74, 144, 226, 0.08), 0 8px 10px -6px rgba(138, 112, 214, 0.05)',
        pastelHover: '0 20px 30px -10px rgba(74, 144, 226, 0.15), 0 10px 15px -5px rgba(138, 112, 214, 0.1)',
        glow: '0 0 20px rgba(74, 144, 226, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breath': 'breath 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.35)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
