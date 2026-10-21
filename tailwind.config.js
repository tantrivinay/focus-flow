/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0D12',
          card: '#141821',
          elevated: '#1A1F2E',
        },
        accent: {
          lime: '#C8FF5D',
          violet: '#A78BFA',
          limeDim: '#9ECC3A',
        },
        text: {
          primary: '#F5F7FA',
          muted: '#9299A8',
          dim: '#5C6270',
        },
        border: {
          subtle: '#1E2535',
          bright: '#2A3245',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(200, 255, 93, 0.3)' },
          to: { boxShadow: '0 0 20px rgba(200, 255, 93, 0.6)' },
        },
      },
      boxShadow: {
        'lime': '0 0 20px rgba(200, 255, 93, 0.15)',
        'violet': '0 0 20px rgba(167, 139, 250, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
