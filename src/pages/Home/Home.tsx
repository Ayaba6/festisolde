import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

// Importation de tes composants stylisés
import Header from './components/Header';
import FeaturedSection from './components/FeaturedSection';
import Footer from './components/Footer';

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
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      
      {/* 1. Header (Navigation & Recherche harmonisée) */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 2. Featured (Le Slider et les zones d'impact) */}
      <FeaturedSection />

      {/* 3. Section Boutique - Style Editorial */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        
        {/* En-tête de section raffiné */}
        <div className="flex items-center justify-between mb-16 border-b border-gray-100 pb-8">
          <div>
            <h2 className="text-2xl font-light tracking-[0.2em] uppercase text-gray-400">
              Nouveaux <span className="text-gray-900 font-medium">Arrivages</span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/products" 
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors"
            >
              Explorer le catalogue 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Grille de produits "Minimalist Chic" */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-gray-50 rounded-sm" />
                <div className="h-2 w-1/2 bg-gray-50" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
            {products.map((product) => (
              <Link to={`/produit/${product.id}`} key={product.id} className="group">
                
                {/* Conteneur Image avec survol fluide */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-6 border border-gray-50 transition-all duration-500 group-hover:shadow-sm">
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                    alt={product.name} 
                  />
                  
                  {/* Badge boutique discret */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[9px] font-bold tracking-widest text-white uppercase bg-black/40 backdrop-blur-md px-3 py-1.5">
                      {product.stores?.name}
                    </span>
                  </div>

                  {/* Bouton Plus (Quick View) */}
                  <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-colors">
                       <Plus size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Détails du produit épurés */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-sm font-medium tracking-tight text-gray-900">
                      {product.sale_price?.toLocaleString()} CFA
                    </p>
                    {product.regular_price && (
                      <span className="text-[10px] text-gray-300 line-through">
                        {product.regular_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bouton d'action secondaire */}
        <div className="mt-32 flex justify-center">
          <button className="px-12 py-4 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-black hover:text-white hover:border-black transition-all duration-500">
            Afficher plus d'offres
          </button>
        </div>
      </main>

      {/* 4. Footer (Le grand footer sombre et stylé) */}
      <Footer />

    </div>
  );
}