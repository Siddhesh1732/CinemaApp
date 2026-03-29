/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void:    '#050508',
        deep:    '#0B0F1A',
        surface: '#111827',
        glass:   'rgba(255,255,255,0.04)',
        cyan:    '#06B6D4',
        violet:  '#8B5CF6',
        amber:   '#F59E0B',
        rose:    '#F43F5E',
        muted:   '#64748B',
        subtle:  '#94A3B8',
        bright:  '#F1F5F9',
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body:    ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow':   'pulse 4s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spin 8s linear infinite',
        'border-spin':  'border-spin 4s linear infinite',
      },
      keyframes: {
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        glow:        { from: { boxShadow: '0 0 10px rgba(6,182,212,0.3)' }, to: { boxShadow: '0 0 30px rgba(6,182,212,0.7), 0 0 60px rgba(6,182,212,0.3)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'border-spin': { '100%': { transform: 'rotate(360deg)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
