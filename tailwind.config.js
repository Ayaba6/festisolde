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
            400: "#94a3b8", // <-- AJOUTÉ pour corriger l'erreur PostCSS
            500: "#64748b",
            900: "#0f172a",
          }
        }
      },
      fontSize: {
        // Tailles réduites pour plus d'élégance
        'festi-h1': ['clamp(1.75rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'festi-h2': ['clamp(1.25rem, 4vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'festi-base': ['0.938rem', { lineHeight: '1.5' }], // 15px
        'festi-sm': ['0.813rem', { lineHeight: '1.4' }],   // 13px
        'festi-xs': ['0.688rem', { lineHeight: '1.2' }],   // 11px
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
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}