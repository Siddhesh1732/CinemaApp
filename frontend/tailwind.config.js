/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#08080F',
          surface: '#10101A',
          card: '#16162     0',
          border: '#1E1E2E',
          amber: '#F59E0B',
          amberHover: '#D97706',
          blue: '#3B82F6',
          text: '#E2E8F0',
          muted: '#64748B',
          subtle: '#94A3B8',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
