import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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
            // Correction ici pour correspondre à votre fichier
            src: 'festisolde-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            // Correction ici pour correspondre à votre fichier
            src: 'festisolde-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            // Correction ici également
            src: 'festisolde-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})