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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      // Service worker écrit à la main (src/sw.js) pour gérer les notifications push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // Les gros morceaux réservés aux vendeurs (export PDF…) ne sont pas
        // pré-téléchargés chez tous les visiteurs : ils restent chargés à la demande.
        globIgnores: ['**/InvoiceDownload-*.js', '**/InvoicePDF-*.js', 'festisolde-logo.png', 'og-default.jpg', 'festival/**'],
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
        // Seul le socle commun est regroupé ; les grosses bibliothèques (PDF,
        // détourage d'images, animations…) restent dans le morceau de la page
        // qui les utilise et ne sont téléchargées que si besoin.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react';
          if (id.includes('@supabase')) return 'database';
        },
      },
    },
  },
})