import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';

import Header from './Header';
import Footer from './Footer';
import { ProductCard } from '../../Store/ProductCard';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(["Tous"]);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || "Tous";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // On récupère name, slug ET status de la boutique parente
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('*, stores(name, slug, status)') 
      .order('created_at', { ascending: false });
    
    if (!prodError) {
      setProducts(prodData);
      const uniqueCats = ["Tous", ...new Set(prodData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    } else {
      console.error("Erreur de chargement:", prodError);
    }
    setLoading(false);
  }

  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat });
  };

  // --- LOGIQUE DE FILTRAGE MISE À JOUR ---
  const filteredProducts = products.filter(product => {
    // 1. Recherche par nom
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filtrage par catégorie
    const matchesCategory = categoryFromUrl === "Tous" || product.category === categoryFromUrl;
    
    // 3. SÉCURITÉ : On vérifie si la boutique n'est pas masquée par l'admin
    // Si store.status est 'hidden', on ne garde pas le produit
    const isStoreVisible = product.stores?.status !== 'hidden';

    return matchesSearch && matchesCategory && isStoreVisible;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        
        {/* --- EN-TÊTE --- */}
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 mb-4 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Accueil
          </Link>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tight leading-[0.85]">
            Le <span className="text-orange-600">Catalogue</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mt-3 italic">
            {filteredProducts.length} ARTICLES DISPONIBLES
          </p>
        </div>

        {/* --- FILTRES --- */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 items-start lg:items-center justify-between border-y border-gray-50 py-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  categoryFromUrl === cat 
                  ? "bg-black text-white shadow-lg" 
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text"
              placeholder="RECHERCHER..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-orange-600/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- GRILLE DE PRODUITS --- */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-gray-50 rounded-[1.5rem]" />
                <div className="h-4 bg-gray-50 rounded w-2/3" />
                <div className="h-4 bg-gray-50 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-lg font-black uppercase italic text-gray-200">Aucun produit trouvé</h3>
            <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Essayez un autre filtre ou une autre recherche</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}