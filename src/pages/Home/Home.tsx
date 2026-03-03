import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Zap } from 'lucide-react';

// Importation de tes composants
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
      .order('created_at', { ascending: false })
      .limit(8); // On limite à 8 pour la Home pour inciter à cliquer sur "Voir plus"
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      
      {/* 1. Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 2. Featured (Slider & Impact) */}
      <FeaturedSection />

      {/* 3. Section Boutique - Style Harmonisé (PublicStore) */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        
        {/* En-tête de section "Power" */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <Zap size={18} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Drop de la semaine</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
              Nouveaux <span className="text-gray-200 uppercase">Arrivages</span>
            </h2>
          </div>
          
          <Link 
            to="/products" 
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Explorer tout le catalogue 
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-gray-50 rounded-[2.5rem]" />
                <div className="h-3 w-1/2 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-20">
            {products.map((product) => (
              <Link to={`/produit/${product.id}`} key={product.id} className="group flex flex-col">
                
                {/* IMAGE CARD - Style PublicStore */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9] rounded-[2.5rem] mb-6 border border-gray-100/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/5 group-hover:-translate-y-1">
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                    alt={product.name} 
                  />
                  
                  {/* Badge Boutique */}
                  <div className="absolute top-5 left-5">
                    <span className="text-[9px] font-black tracking-widest text-white uppercase bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                      {product.stores?.name}
                    </span>
                  </div>

                  {/* Overlay Action */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                      <Plus size={24} className="text-black" />
                    </div>
                  </div>
                </div>

                {/* DÉTAILS - Style PublicStore */}
                <div className="px-1 space-y-1.5">
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-400 group-hover:text-black transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-black italic tracking-tighter text-gray-900 leading-none">
                      {product.sale_price?.toLocaleString()} <span className="text-[10px] not-italic font-bold ml-0.5 text-gray-400">CFA</span>
                    </p>
                    
                    {product.regular_price > product.sale_price && (
                      <span className="text-xs text-gray-300 line-through font-black italic tracking-tighter">
                        {product.regular_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Badge Promo si réduction */}
                  {product.regular_price > product.sale_price && (
                    <div className="pt-1">
                      <span className="text-[8px] font-black uppercase bg-orange-600 text-white px-2 py-1 rounded-lg italic tracking-widest">
                        Solde
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* BOUTON REDIRECTION : Transformé en Link vers /products */}
        <div className="mt-32 flex justify-center">
          <Link 
            to="/products"
            className="px-14 py-5 bg-orange-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all duration-500 shadow-xl shadow-orange-600/20 active:scale-95 inline-block text-center"
          >
            Afficher plus d'offres
          </Link>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

    </div>
  );
}