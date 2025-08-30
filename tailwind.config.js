/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
            boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'
          },
          '100%': { 
            textShadow: '0 0 15px #00ffff, 0 0 25px #00ffff, 0 0 35px #00ffff',
            boxShadow: '0 0 15px #00ffff, 0 0 25px #00ffff, 0 0 35px #00ffff'
          },
        }
      },
      colors: {
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff6b6b',
        'neon-green': '#4ecdc4',
        'neon-blue': '#45b7d1',
        'neon-yellow': '#feca57',
        'neon-purple': '#ff9ff3',
        'dark-bg': '#0c0c0c',
        'dark-blue': '#1a1a2e',
        'dark-purple': '#16213e',
      }
    },
  },
  plugins: [],
}
