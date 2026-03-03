import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link, useSearchParams } from 'react-router-dom'; // Ajout de useSearchParams
import { Plus, Search, Filter, ArrowLeft } from 'lucide-react';

import Header from './Header';
import Footer from './Footer';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(["Tous"]); // Dynamique
  
  // Lecture de la catégorie depuis l'URL (ex: /products?category=Mode)
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || "Tous";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    // 1. Récupérer les produits
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('*, stores(name)')
      .order('created_at', { ascending: false });
    
    if (!prodError) {
      setProducts(prodData);
      
      // 2. Extraire les catégories uniques des produits reçus
      const uniqueCats = ["Tous", ...new Set(prodData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    }
    setLoading(false);
  }

  // Fonction pour changer de catégorie proprement
  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat });
  };

  // Filtrage combiné
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFromUrl === "Tous" || product.category === categoryFromUrl;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        
        {/* --- EN-TÊTE DE LA PAGE --- */}
        <div className="mb-16">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 mb-6 transition-colors">
            <ArrowLeft size={14} /> Accueil
          </Link>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Le <span className="text-orange-600">Catalogue</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mt-4">
            {filteredProducts.length} pépites disponibles {categoryFromUrl !== "Tous" && `en ${categoryFromUrl}`}
          </p>
        </div>

        {/* --- BARRE DE FILTRES --- */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 items-start md:items-center justify-between border-b border-gray-100 pb-10">
          
          {/* Sélecteur de Catégories Dynamique */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  categoryFromUrl === cat 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" 
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-orange-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text"
              placeholder="RECHERCHER UN ARTICLE..."
              className="w-full pl-12 pr-4 py-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-orange-600 transition-all shadow-sm focus:shadow-orange-600/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- GRILLE DE PRODUITS --- */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-gray-50 rounded-[2.5rem]" />
                <div className="h-3 w-1/2 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-20">
            {filteredProducts.map((product) => (
              <Link to={`/produit/${product.id}`} key={product.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9] rounded-[2.5rem] mb-6 border border-gray-100/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-orange-600/10 group-hover:-translate-y-2">
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                    alt={product.name} 
                  />
                  <div className="absolute top-5 left-5">
                    <span className="text-[9px] font-black tracking-widest text-white uppercase bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl group-hover:bg-orange-600 transition-colors">
                      {product.stores?.name}
                    </span>
                  </div>
                </div>

                <div className="px-2 space-y-2">
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-400 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black italic tracking-tighter text-gray-900 leading-none">
                      {product.sale_price?.toLocaleString()} <span className="text-[10px] not-italic font-bold ml-0.5 text-gray-400 uppercase">CFA</span>
                    </p>
                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                       <Plus size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-xl font-black uppercase italic text-gray-300">Aucun produit trouvé</h3>
            <button onClick={() => handleCategoryChange("Tous")} className="mt-6 text-[10px] font-black uppercase tracking-widest text-orange-600 underline">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}