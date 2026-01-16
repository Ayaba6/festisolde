import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path' // 1. On importe path pour gérer les chemins

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FestiSolde',
        short_name: 'FestiSolde',
        description: 'La meilleure boutique de deals premium',
        theme_color: '#FF5A5A',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'festisolde-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'festisolde-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'festisolde-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  // 2. AJOUTER CETTE SECTION RESOLVE
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})