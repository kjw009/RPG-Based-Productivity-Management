/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Super Earth / Helldivers 2 tactical color system
        // These map to the same class names so no component changes are needed
        rpg: {
          bg:          '#070a0d',   // deep space black
          surface:     '#0d1318',   // tactical dark
          panel:       '#0f1c26',   // steel panel
          border:      '#1a3040',   // steel edge
          borderlite:  '#2d5a7a',   // bright steel highlight
          gold:        '#FFE710',   // Super Earth yellow (primary accent)
          'gold-dark': '#c4a800',   // muted warning yellow
          hp:          '#FF3344',   // critical damage red
          'hp-dark':   '#8b1a2a',   // dark danger
          mana:        '#7DF9FF',   // energy / stims cyan
          'mana-dark': '#4ab8c8',   // dim cyan
          green:       '#4fc24e',   // allied / success
          purple:      '#41639C',   // Super Earth authority blue
          text:        '#c8d8e4',   // primary tactical readout text
          muted:       '#4a6878',   // dim tactical text
          crimson:     '#FF3344',   // critical alert
          navy:        '#040a10',   // deep navy
          amber:       '#FF9D45',   // warning orange
          xp:          '#c3c6e1',   // Helldivers 2 XP blue-steel
        },
        // Tactical panel colors — same key names as old grimoire palette
        grimoire: {
          parchment:        '#c8d8e4',  // light text
          'parchment-dark': '#8a9aaa',  // mid-tone text
          ink:              '#0a1218',  // very dark (inverted from old ink)
          'ink-light':      '#1a2a3a',  // slightly lighter dark
          leather:          '#0d1620',  // tactical steel panel
          'leather-light':  '#1a2d3a',  // lighter panel
          spine:            '#050c12',  // near-black divider
          clasp:            '#FFE710',  // yellow accent (was gold clasp)
          ribbon:           '#FF3344',  // red alert (was crimson ribbon)
          rune:             '#7DF9FF',  // cyan energy (was gold rune)
          'page-edge':      '#2d4f6a',  // panel edge highlight
        },
      },
      fontFamily: {
        // Military sci-fi fonts — same class names, different fonts
        pixel:    ['"Orbitron"',         'monospace'],  // was Press Start 2P
        body:     ['"Share Tech Mono"',  'monospace'],  // was VT323
        grimoire: ['"Barlow Condensed"', 'sans-serif'], // was MedievalSharp
        fraktur:  ['"Orbitron"',         'monospace'],  // was UnifrakturMaguntia (bold display)
      },
      fontSize: {
        'pixel-xs':       ['8px',  { lineHeight: '1.6' }],
        'pixel-sm':       ['10px', { lineHeight: '1.6' }],
        'pixel-base':     ['11px', { lineHeight: '1.6' }],
        'pixel-lg':       ['13px', { lineHeight: '1.6' }],
        'pixel-xl':       ['15px', { lineHeight: '1.5' }],
        'pixel-2xl':      ['18px', { lineHeight: '1.4' }],
        'body-sm':        ['14px', { lineHeight: '1.4' }],
        'body-base':      ['15px', { lineHeight: '1.4' }],
        'body-lg':        ['17px', { lineHeight: '1.4' }],
        'body-xl':        ['22px', { lineHeight: '1.3' }],
        'grimoire-sm':    ['13px', { lineHeight: '1.4' }],
        'grimoire-base':  ['15px', { lineHeight: '1.4' }],
        'grimoire-lg':    ['20px', { lineHeight: '1.3' }],
        'grimoire-xl':    ['28px', { lineHeight: '1.2' }],
      },
      boxShadow: {
        pixel:        '2px 2px 0px rgba(0,0,0,0.8)',
        'pixel-sm':   '1px 1px 0px rgba(0,0,0,0.8)',
        'pixel-panel': 'inset 0 0 0 1px rgba(255,231,16,0.05), 0 0 0 1px #1a3040, 0 4px 20px rgba(0,0,0,0.6)',
        'pixel-btn':  '0 2px 0px rgba(0,0,0,0.8)',
        'pixel-inset':'inset 0 2px 4px rgba(0,0,0,0.6)',
        'grimoire-page':  '0 0 30px rgba(0,0,0,0.5)',
        'grimoire-inset': 'inset 0 1px 3px rgba(0,0,0,0.5)',
      },
      animation: {
        'ko-flash':      'koFlash 0.4s steps(1) infinite',
        'blink':         'blink 1s steps(1) infinite',
        'breathe':       'breathe 3s ease-in-out infinite',
        'idle-bob':      'idleBob 2s ease-in-out infinite',
        'flame-flicker': 'flameFlicker 0.3s ease-in-out infinite alternate',
        'rune-glow':     'runeGlow 2s ease-in-out infinite',
        'scan-line':     'scanLine 8s linear infinite',
        'status-pulse':  'statusPulse 2s ease-in-out infinite',
      },
      keyframes: {
        koFlash: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.02)' },
        },
        idleBob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-2px)' },
        },
        flameFlicker: {
          '0%':   { opacity: '0.8', transform: 'scaleY(1)' },
          '100%': { opacity: '1',   transform: 'scaleY(1.1)' },
        },
        runeGlow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 3px rgba(125,249,255,0.3))' },
          '50%':      { filter: 'brightness(1.4) drop-shadow(0 0 8px rgba(125,249,255,0.7))' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 4px rgba(255,231,16,0.6)' },
          '50%':      { opacity: '0.6', boxShadow: '0 0 1px rgba(255,231,16,0.2)' },
        },
      },
    },
  },
  plugins: [],
}
