import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

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
            src: 'pwa-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /* --- AJOUT DE LA SECTION BUILD POUR FIXER L'ERREUR VERCEL --- */
  build: {
    chunkSizeWarningLimit: 1000, // Augmente la limite à 1000ko
    rollupOptions: {
      output: {
        // Cette fonction sépare les grosses bibliothèques (vendor) du code de ton app
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@supabase')) return 'database';
            return 'vendor';
          }
        },
      },
    },
  },
})