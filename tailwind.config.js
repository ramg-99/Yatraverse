/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--bg)',
        surface: 'var(--surface)',
        parchment: 'var(--text)',
        saffron: 'var(--accent)',
        accent: 'var(--accent)',
        aurora: 'var(--aurora)',
        coral: 'var(--coral)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        card: 'var(--card)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px color-mix(in srgb, var(--accent) 25%, transparent)',
        glass: '0 8px 32px rgba(0,0,0,0.28)',
      },
      backgroundImage: {
        grain:
          'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'160\' height=\'160\' filter=\'url(%23n)\' opacity=\'.06\'/%3E%3C/svg%3E")',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        stamp: {
          '0%': { transform: 'scale(1.4) rotate(-12deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-6deg)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        stamp: 'stamp 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
