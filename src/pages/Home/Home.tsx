import { useEffect } from 'react'

// --- COMPOSANTS EXTERNES ---
import HeroSection from './components/HeroSection' 
import TrustSection from './components/TrustSection'
import FlashDeals from './components/FlashDeals'
import PackeoSection from './components/PackeoSection' // Nouvelle section ajoutée
import CategoryShowcase from './components/CategoryShowcase'
import FeaturedProducts from './components/FeaturedProducts'
import BenefitsSection from './components/BenefitsSection'
import NewsletterSection from './components/NewsletterSection'
import PartnersBanner from './components/PartnersBanner'

export default function Home() {

  useEffect(() => { 
    // SCRIPT AUTO-SAUVEGARDE DU PANIER
    const handleSaveCart = () => {
       const currentCart = localStorage.getItem('festi_cart');
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
      {/* On peut maintenant y mentionner l'arrivée des packs dans le texte du Hero */}
      <HeroSection />
      
      {/* 2. RÉASSURANCE CLIENT RAPIDE */}
      <TrustSection />
      
      {/* 3. OFFRES TEMPORAIRES (Ventes Flash) */}
      <FlashDeals />

      {/* 4. SECTION PACKEO (Ventes en lots : Chemise + Pantalon + etc.) */}
      {/* Placée ici pour créer une rupture visuelle avec son fond sombre */}
      <PackeoSection />

      {/* 5. EXPLORER PAR CATÉGORIE */}
      <CategoryShowcase />

      {/* 6. PRODUITS VEDETTES */}
      <FeaturedProducts />

      {/* 7. EXPÉRIENCE & ENGAGEMENT */}
      <BenefitsSection />

      {/* 8. NEWSLETTER & FIDÉLISATION */}
      <NewsletterSection />

      {/* 9. PARTENAIRES & BOUTIQUES DE CONFIANCE */}
      <PartnersBanner />
    </div>
  )
}