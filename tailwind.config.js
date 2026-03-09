/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF5A5A", // Ton rouge corail
          dark: "#0F1115",
          slate: {
            400: "#94a3b8",
            500: "#64748b",
            900: "#0f172a",
          }
        }
      },
      fontSize: {
        'festi-h1': ['clamp(1.75rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'festi-h2': ['clamp(1.25rem, 4vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'festi-base': ['0.938rem', { lineHeight: '1.5' }], 
        'festi-sm': ['0.813rem', { lineHeight: '1.4' }],   
        'festi-xs': ['0.688rem', { lineHeight: '1.2' }],   
      },
      borderRadius: {
        'brand': '0.75rem', 
      },
      gridTemplateColumns: {
        'product-grid': 'repeat(auto-fill, minmax(200px, 1fr))',
        'product-grid-mobile': 'repeat(auto-fill, minmax(150px, 1fr))',
      },
      aspectRatio: {
        'fashion': '4 / 5',
        'tech': '1 / 1',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'loading-bar': 'loading-bar 2.5s ease-in-out forwards',
        'fade-out': 'fadeOut 0.7s ease-in-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-8%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        'loading-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}