import { useEffect } from 'react'

// --- COMPOSANTS EXTERNES ---
import HeroSection from './components/HeroSection' 
import TrustSection from './components/TrustSection'
import FlashDeals from './components/FlashDeals'
import CategoryShowcase from './components/CategoryShowcase'
import FeaturedProducts from './components/FeaturedProducts'
import BenefitsSection from './components/BenefitsSection'
import NewsletterSection from './components/NewsletterSection'
import PartnersBanner from './components/PartnersBanner' // Import de la nouvelle section

export default function Home() {

  useEffect(() => { 
    // SCRIPT AUTO-SAUVEGARDE DU PANIER (Instructions du 2026-01-13)
    const handleSaveCart = () => {
       const currentCart = localStorage.getItem('festi_cart'); // Mis à jour pour correspondre à ta clé principale
       if (currentCart) {
         localStorage.setItem('festi_cart_backup', currentCart);
       }
    };
    window.addEventListener('beforeunload', handleSaveCart);
    return () => window.removeEventListener('beforeunload', handleSaveCart);
  }, [])

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO & INTRODUCTION */}
      <HeroSection />
      
      {/* 2. RÉASSURANCE CLIENT RAPIDE */}
      <TrustSection />
      
      {/* 3. OFFRES TEMPORAIRES (Ventes Flash) */}
      <FlashDeals />

      {/* 4. EXPLORER PAR CATÉGORIE */}
      <CategoryShowcase />

      {/* 5. PRODUITS VEDETTES */}
      <FeaturedProducts />

      {/* 6. EXPÉRIENCE & ENGAGEMENT */}
      <BenefitsSection />

      {/* 7. NEWSLETTER & FIDÉLISATION */}
      <NewsletterSection />

      {/* 8. PARTENAIRES & BOUTIQUES DE CONFIANCE */}
      <PartnersBanner />
    </div>
  )
}