import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

// Enregistre le Service Worker pour activer les fonctionnalités PWA (hors-ligne, installation)
registerSW({ 
  immediate: true,
  onRegistered(r) {
    console.log('PWA : Service Worker enregistré avec succès');
  },
  onRegisterError(error) {
    console.error('PWA : Erreur lors de l\'enregistrement du Service Worker', error);
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)