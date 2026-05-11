import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#030508',
          900: '#070B12',
          850: '#0B111A',
          800: '#101722',
          700: '#1A2230',
        },
        signal: {
          blue: '#1D6FFF',
          cyan: '#00AEEF',
          amber: '#F2B84B',
        },
        text: {
          primary: '#F4F7FA',
          secondary: '#9AA4B2',
          muted: '#6F7A89',
          metallic: '#B9C1CC',
        },
        border: {
          blue: 'rgba(80, 140, 255, 0.28)',
          subtle: 'rgba(154, 164, 178, 0.10)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Tightly controlled scale
        'micro': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.16em' }],
        'label': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.18em' }],
        'eyebrow': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.22em' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'lead': ['1.125rem', { lineHeight: '1.65' }],
        'h6': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'h5': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h4': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'h3': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h2': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'h1': ['4.25rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display': ['6rem', { lineHeight: '0.96', letterSpacing: '-0.035em' }],
      },
      letterSpacing: {
        widest: '0.22em',
      },
      maxWidth: {
        prose: '64ch',
        shell: '1440px',
      },
      boxShadow: {
        'panel': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(80,140,255,0.10), 0 30px 80px -40px rgba(0,0,0,0.8)',
        'glow-blue': '0 0 0 1px rgba(29,111,255,0.35), 0 0 40px -10px rgba(29,111,255,0.45)',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(to right, rgba(80,140,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(80,140,255,0.06) 1px, transparent 1px)',
        'grid-coarse':
          'linear-gradient(to right, rgba(80,140,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(80,140,255,0.10) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(ellipse at center, rgba(29,111,255,0.10), transparent 60%)',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseDim: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.9' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        sweep: 'sweep 6s linear infinite',
        'pulse-dim': 'pulseDim 2.4s ease-in-out infinite',
        scanline: 'scanline 4s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
