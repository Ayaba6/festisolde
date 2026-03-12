import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      /* Désactivation du manifest généré par le plugin 
         pour laisser place à notre logique dynamique dans index.html 
      */
      manifest: false, 
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Empêche les erreurs de cache si tu as beaucoup de fichiers
        maximumFileSizeToCacheInBytes: 3000000, 
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /* --- AJOUT DE LA CONFIGURATION SERVER POUR LES TESTS SOUS-DOMAINE --- */
  server: {
    host: true,
    allowedHosts: ['.festisolde.com', '.vercel.app']
  },
  /* --- CONFIGURATION BUILD (Optimisée pour Vercel) --- */
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
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