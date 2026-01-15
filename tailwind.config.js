/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF5A5A",
          dark: "#0F1115",
          slate: {
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
        'brand': '0.75rem', // Arrondi plus fin (12px) au lieu de 20px+
      }
    },
  },
  plugins: [],
}