import { useEffect } from 'react'

// --- COMPOSANTS EXTERNES ---
import HeroSection from './components/HeroSection' 
import FlashDeals from './components/FlashDeals'
import PackeoSection from './components/PackeoSection'
import QuickCategoryNav from './components/QuickCategoryNav' // Remplacement fait ici
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
      {/* 1. HERO & RECHERCHE */}
      <HeroSection />
      
      {/* 2. NAVIGATION VISUELLE : Accès direct aux rayons */}
      <QuickCategoryNav />

      {/* 3. OFFRES TEMPORAIRES (Ventes Flash) */}
      <FlashDeals />

      {/* 4. SECTION PACKEO (L'Atelier) */}
      <PackeoSection />

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