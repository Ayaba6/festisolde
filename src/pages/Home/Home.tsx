import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

// Importation de tes composants
import Header from './components/Header';
import FeaturedSection from './components/FeaturedSection';
import Footer from './components/Footer';
import PartnersMarquee from './components/PartnersMarquee'; 
import { ProductCard } from '../Store/ProductCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  async function fetchLatestProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, stores(name)')
      .order('created_at', { ascending: false })
      .limit(8); 
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      
      {/* 1. Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 2. Featured (Slider & Impact) */}
      <FeaturedSection />

      {/* 3. Section Boutique */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        
        {/* En-tête de section "Power" */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <Zap size={20} fill="currentColor" />
              <span className="text-[12px] font-black uppercase tracking-[0.4em] italic">Drop de la semaine</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85]">
              Nouveaux <br />
              <span className="text-gray-100 uppercase drop-shadow-sm">Arrivages</span>
            </h2>
          </div>
          
          <Link 
            to="/products" 
            className="group flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-all"
          >
            Explorer tout le catalogue 
            <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all duration-500">
              <ArrowRight size={18} />
            </div>
          </Link>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-gray-50 rounded-[1.8rem]" />
                <div className="h-4 w-2/3 bg-gray-50 rounded" />
                <div className="h-3 w-1/2 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* BOUTON REDIRECTION AFFINÉ (Version Mobile-friendly) */}
        <div className="mt-16 md:mt-24 flex justify-center">
          <Link 
            to="/products"
            className="group relative overflow-hidden px-8 py-4 md:px-12 md:py-5 bg-black text-white rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl"
          >
            <span className="relative z-10">Voir toutes les offres</span>
            <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </Link>
        </div>
      </main>

      {/* 4. Section Partenaires (Marquee) */}
      <PartnersMarquee />

      {/* 5. Footer */}
      <Footer />

    </div>
  );
}