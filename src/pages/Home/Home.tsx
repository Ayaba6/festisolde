import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores ( name )
        `)
        .eq('is_featured_home', true)
        .order('created_at', { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    }
    fetchFeaturedProducts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section simple */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
          🔥 Les pépites de <span className="text-orange-600 font-black italic">Festisolde</span>
        </h1>
        <p className="text-gray-500 text-lg">Les meilleures promotions près de chez vous, mises à jour en direct.</p>
      </div>

      {/* Grille de produits style E-commerce moderne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => {
          // Calcul du pourcentage de réduction
          const discount = Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);

          return (
            <div key={product.id} className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              
              {/* Image avec Badge de réduction */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-3 py-1 rounded-full text-sm shadow-lg">
                  -{discount}%
                </div>
              </div>

              {/* Infos Produit */}
              <div className="p-5">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                  📍 {product.stores?.name || "Boutique locale"}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                  {product.name}
                </h3>
                
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-black text-gray-900">
                    {product.sale_price}€
                  </span>
                  <span className="text-lg text-gray-400 line-through font-medium">
                    {product.original_price}€
                  </span>
                </div>

                <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-lg active:scale-95">
                  Récupérer l'offre
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-xl font-medium">Aucune promotion disponible pour le moment... ⏳</p>
        </div>
      )}
    </div>
  );
}