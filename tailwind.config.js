/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rpg: {
          bg: '#0d0d0d',
          surface: '#1a1a2e',
          panel: '#16213e',
          border: '#2a2a5e',
          borderlite: '#3a3a7e',
          gold: '#fbbf24',
          'gold-dark': '#d97706',
          hp: '#dc2626',
          'hp-dark': '#991b1b',
          mana: '#2563eb',
          'mana-dark': '#1d4ed8',
          green: '#22c55e',
          purple: '#a855f7',
          text: '#e2e8f0',
          muted: '#64748b',
          crimson: '#be123c',
          navy: '#0f172a',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"VT323"', 'monospace'],
      },
      fontSize: {
        'pixel-xs': ['8px', { lineHeight: '1.8' }],
        'pixel-sm': ['10px', { lineHeight: '1.8' }],
        'pixel-base': ['12px', { lineHeight: '1.8' }],
        'pixel-lg': ['14px', { lineHeight: '1.8' }],
        'pixel-xl': ['16px', { lineHeight: '1.8' }],
        'pixel-2xl': ['20px', { lineHeight: '1.6' }],
        'body-sm': ['16px', { lineHeight: '1.4' }],
        'body-base': ['18px', { lineHeight: '1.4' }],
        'body-lg': ['22px', { lineHeight: '1.4' }],
        'body-xl': ['28px', { lineHeight: '1.3' }],
      },
      boxShadow: {
        pixel: '4px 4px 0px rgba(0,0,0,0.6)',
        'pixel-sm': '2px 2px 0px rgba(0,0,0,0.6)',
        'pixel-panel':
          'inset -3px -3px 0px #0a0a1a, inset 3px 3px 0px #3a3a7e, 0 0 0 3px #1a1a3e, 0 0 0 5px #0a0a1a',
        'pixel-btn': '4px 4px 0px rgba(0,0,0,0.7)',
        'pixel-inset': 'inset 2px 2px 0px rgba(0,0,0,0.5)',
      },
      animation: {
        'ko-flash': 'koFlash 0.4s steps(1) infinite',
        'blink': 'blink 1s steps(1) infinite',
      },
      keyframes: {
        koFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
