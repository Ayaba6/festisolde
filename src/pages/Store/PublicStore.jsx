import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Share2, Star, CheckCircle2, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function PublicStore() {
  const { storeName } = useParams();
  const navigate = useNavigate();
  const { cart } = useCart();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetchStoreData();
  }, [storeName]);

  async function fetchStoreData() {
    setLoading(true);
    const { data: storeData } = await supabase.from('stores').select('*').eq('name', storeName).single();
    if (storeData) {
      setStore(storeData);
      const { data: productsData } = await supabase.from('products').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
      setProducts(productsData || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gray-400 font-light">Chargement de la galerie...</div>;
  if (!store) return <div className="p-20 text-center font-bold text-gray-400">Boutique introuvable</div>;

  return (
    <div className="min-h-screen bg-white pb-20 antialiased">
      
      {/* --- BANNIÈRE --- */}
      <div className="relative h-[200px] md:h-[300px] w-full bg-gray-100 overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} className="w-full h-full object-cover" alt="Bannière" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-100" />
        )}
        <div className="absolute inset-0 bg-black/5" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-all">
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* --- ENTÊTE : LOGO À GAUCHE / INFOS À DROITE --- */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-10 border-b border-gray-50">
          
          {/* Logo à gauche */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-1 shadow-xl -mt-16 md:-mt-20 z-10 flex-shrink-0">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-gray-50 flex items-center justify-center">
              {store.logo_url ? (
                <img src={store.logo_url} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <span className="text-4xl font-light text-gray-300 uppercase">{store.name?.charAt(0)}</span>
              )}
            </div>
          </div>

          {/* Infos et Boutons ajustés à droite */}
          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900">{store.name}</h1>
                <CheckCircle2 size={18} className="text-[#0866FF] fill-blue-50" />
              </div>
              <p className="text-[13px] text-gray-500 max-w-lg font-light leading-relaxed">
                {store.description || "Collection officielle • Marketplace Festisolde"}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 pt-1">
                <span>{products.length} articles</span>
                <span className="flex items-center gap-1 text-orange-400"><Star size={10} className="fill-orange-400" /> 4.9 avis</span>
              </div>
            </div>

            {/* Boutons d'action à l'extrémité droite */}
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-3 bg-[#0866FF] text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                S'abonner
              </button>
              <button className="p-3 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-100">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- CATALOGUE DÉZOOMÉ --- */}
        <div className="py-12 md:py-16">
          <div className="flex justify-between items-baseline mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Catalogue complet</h2>
          </div>

          {/* Utilisation de ta nouvelle classe product-grid */}
          <div className="grid grid-cols-product-grid-mobile md:grid-cols-product-grid gap-x-6 gap-y-12">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/produit/${product.id}`)}
                className="group cursor-pointer"
              >
                {/* Image Fashion Ratio */}
                <div className="aspect-fashion bg-gray-50 relative rounded-2xl overflow-hidden mb-4">
                  <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.name} />
                  
                  {product.sale_price < product.price && (
                    <div className="absolute top-3 left-3 bg-brand-primary text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm tracking-tighter">
                      -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                    </div>
                  )}

                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                    <div className="bg-white p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                      <ShoppingCart size={18} className="text-gray-900" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[13px] font-medium text-gray-800 line-clamp-1 group-hover:text-[#0866FF] transition-colors uppercase tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-gray-900">{product.sale_price.toLocaleString()} <span className="text-[9px]">FCFA</span></span>
                    {product.sale_price < product.price && (
                      <span className="text-[11px] text-gray-400 line-through font-light italic">{product.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-32 text-center text-[10px] uppercase tracking-widest text-gray-300 italic">
              Aucun article en rayon.
            </div>
          )}
        </div>
      </div>

      {/* --- PANIER FLOTTANT --- */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] px-4 pointer-events-none">
          <button 
            onClick={() => navigate('/panier')}
            className="pointer-events-auto w-full bg-gray-900 text-white py-4 rounded-full shadow-2xl flex items-center justify-between px-8 hover:bg-[#0866FF] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-3 -right-3 bg-brand-primary text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Votre Panier</span>
            </div>
            <span className="text-xs font-light opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </button>
        </div>
      )}
    </div>
  );
}