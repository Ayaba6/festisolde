import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { ProductCard } from './ProductCard'; // Assure-toi que le chemin est correct
import { 
  Share2, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowLeft, 
  LayoutGrid, 
  ShieldCheck 
} from 'lucide-react';

export default function PublicStore() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const { cart } = useCart();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartItemsCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    if (storeSlug) {
      fetchStoreData();
    }
  }, [storeSlug]);

  async function fetchStoreData() {
    setLoading(true);
    try {
      let { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', storeSlug)
        .maybeSingle();

      if (!storeData) {
        const decodedName = decodeURIComponent(storeSlug);
        const { data: fallbackData } = await supabase
          .from('stores')
          .select('*')
          .eq('name', decodedName)
          .maybeSingle();
        storeData = fallbackData;
      }

      if (storeData) {
        setStore(storeData);
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error("Erreur de chargement:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-8 h-8 border-2 border-gray-100 border-t-orange-600 rounded-full animate-spin" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold italic">Festisolde...</p>
    </div>
  );

  if (!store) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Boutique introuvable</p>
      <button onClick={() => navigate('/')} className="text-[10px] font-bold border-b border-black pb-1">Retour</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 antialiased">
      
      {/* --- BANNIÈRE --- */}
      <div className="relative w-full flex justify-center">
        <div className="relative h-[200px] md:h-[300px] w-full max-w-7xl md:mx-6 md:mt-4 overflow-hidden md:rounded-[2.5rem] bg-gray-100 shadow-sm">
          {store.banner_url ? (
            <img src={store.banner_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
               <span className="text-[10px] text-white/10 font-black tracking-[0.5em] uppercase italic">Festisolde Premium</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/10" />
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all">
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* --- INFOS BOUTIQUE --- */}
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 pb-8 border-b border-gray-50">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-1 shadow-lg -mt-10 md:-mt-12 z-10 border border-gray-100">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {store.logo_url ? (
                <img src={store.logo_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-2xl font-black text-gray-200 italic uppercase">{store.name?.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 uppercase italic">{store.name}</h1>
                <CheckCircle2 size={16} className="text-orange-600" />
              </div>
              <p className="text-[10px] md:text-[11px] text-gray-400 max-w-md font-bold italic leading-tight">
                {store.description || "Boutique officielle certifiée par Festisolde."}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                S'abonner
              </button>
              <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* --- GRILLE PRODUITS HARMONISÉE --- */}
        <div className="py-10">
          <div className="flex items-center gap-2 mb-8">
            <LayoutGrid size={14} className="text-orange-600" />
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-900 italic">Collection</h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
               <ShieldCheck size={32} className="mx-auto text-gray-100 mb-2" />
               <p className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-black italic">Boutique vide.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* --- PANIER FLOTTANT --- */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[300px] px-6">
          <button 
            onClick={() => navigate('/panier')}
            className="w-full bg-black text-white py-2 rounded-full shadow-2xl flex items-center justify-between hover:bg-orange-600 transition-all group border border-white/10"
          >
            <div className="flex items-center gap-3 pl-2">
              <div className="relative w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                <ShoppingCart size={14} />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-black">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Voir Panier</span>
            </div>
            <div className="pr-4 opacity-50 group-hover:translate-x-1 transition-all text-xs">→</div>
          </button>
        </div>
      )}
    </div>
  );
}