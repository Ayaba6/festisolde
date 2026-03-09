import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { ProductCard } from './ProductCard';
import { 
  Share2, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowLeft, 
  LayoutGrid, 
  ShieldCheck,
  Instagram,
  Phone
} from 'lucide-react';

export default function PublicStore() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const { cart } = useCart();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyMsg, setCopyMsg] = useState(false);

  const cartItemsCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    if (storeSlug) {
      fetchStoreData();
    }
  }, [storeSlug]);

  async function fetchStoreData() {
    setLoading(true);
    try {
      // 1. Essayer de trouver la boutique par SLUG exact
      let { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', storeSlug)
        .maybeSingle();

      // 2. Fallback si slug introuvable (tentative par nom formaté)
      if (!storeData) {
        const decodedName = decodeURIComponent(storeSlug).replace(/-/g, ' ');
        const { data: fallbackData } = await supabase
          .from('stores')
          .select('*')
          .ilike('name', decodedName)
          .maybeSingle();
        storeData = fallbackData;
      }

      if (storeData) {
        setStore(storeData);
        
        // --- CORRECTION MAJEURE ICI ---
        // On demande à Supabase d'inclure les infos de la boutique pour chaque produit
        const { data: productsData } = await supabase
          .from('products')
          .select('*, stores(name, slug)') 
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

  const handleShare = async () => {
    const shareData = {
      title: store.name,
      text: `Découvrez ma boutique ${store.name} sur Festisolde !`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Erreur partage");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopyMsg(true);
      setTimeout(() => setCopyMsg(false), 2000);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-8 h-8 border-2 border-gray-100 border-t-orange-600 rounded-full animate-spin" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold italic">Festisolde...</p>
    </div>
  );

  if (!store) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Cette vitrine n'est pas encore disponible</p>
      <button onClick={() => navigate('/')} className="text-[11px] font-black border-b-2 border-orange-600 pb-1 uppercase italic">Explorer Festisolde</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white antialiased">
      
      {/* --- BANNIÈRE --- */}
      <div className="relative w-full flex justify-center">
        <div className="relative h-[180px] md:h-[300px] w-full max-w-7xl md:mx-6 md:mt-4 overflow-hidden md:rounded-[2.5rem] bg-gray-100 shadow-sm">
          {store.banner_url ? (
            <img src={store.banner_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <span className="text-[10px] text-white/10 font-black tracking-[0.5em] uppercase italic text-center px-10">Vitrine Officielle Festisolde</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all">
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* --- INFOS BOUTIQUE --- */}
        <div className="relative flex flex-col items-center md:items-end md:flex-row gap-4 md:gap-6 pb-8 border-b border-gray-50">
          {/* LOGO */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] p-1.5 shadow-2xl -mt-12 md:-mt-16 z-10 border border-gray-100">
            <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-gray-50 flex items-center justify-center">
              {store.logo_url ? (
                <img src={store.logo_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-3xl font-black text-gray-200 italic uppercase">{store.name?.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase italic leading-none">{store.name}</h1>
                <CheckCircle2 size={18} className="text-orange-600 fill-orange-50" />
              </div>
              <p className="text-[11px] md:text-xs text-gray-500 max-w-md font-bold italic leading-tight px-4 md:px-0">
                {store.description || "Boutique certifiée • Nouveautés chaque semaine."}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <button 
                onClick={handleShare}
                className="flex-1 md:flex-none px-8 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                {copyMsg ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                {copyMsg ? "COPIÉ !" : "PARTAGER"}
              </button>
            </div>
          </div>
        </div>

        {/* --- GRILLE PRODUITS --- */}
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-orange-600" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 italic">Arrivages</h2>
            </div>
            <span className="text-[9px] font-black text-gray-300 uppercase">{products.length} Articles</span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
               <ShieldCheck size={40} className="mx-auto text-gray-100 mb-4" />
               <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black italic">Collection en cours de mise à jour...</p>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-20 py-12 bg-black rounded-t-[3rem] md:rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-8">
          <div className="flex gap-4">
            {store.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number}`} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-green-600 transition-all border border-white/10">
                <Phone size={18} />
              </a>
            )}
            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-orange-600 transition-all border border-white/10">
              <Instagram size={18} />
            </a>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 opacity-30">
              <div className="h-px w-8 bg-white"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">Festisolde Studio</span>
              <div className="h-px w-8 bg-white"></div>
            </div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
              © {new Date().getFullYear()} {store.name} <br/>
              Propulsé par Festisolde - Marketplace Mode Burkina
            </p>
          </div>
        </div>
      </footer>
      
      {/* --- PANIER FLOTTANT --- */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[340px] px-6">
          <button 
            onClick={() => navigate('/panier')}
            className="w-full bg-orange-600 text-white py-4 rounded-3xl shadow-[0_20px_50px_rgba(234,88,12,0.4)] flex items-center justify-between px-6 hover:bg-black transition-all active:scale-95 border border-white/20"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart size={20} strokeWidth={2.5} />
                <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-orange-600">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Voir ma commande</span>
            </div>
            <span className="text-xl font-light">→</span>
          </button>
        </div>
      )}
    </div>
  );
}