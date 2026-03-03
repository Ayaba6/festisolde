import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
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

  // --- FONCTION DE RENDU DE LA GRILLE AVEC EFFET ZOOM ---
  const renderProductMedia = (product) => {
    let images = [];
    if (Array.isArray(product.images)) {
      images = product.images;
    } else if (typeof product.images === 'string' && product.images.startsWith('{')) {
      images = product.images.replace('{', '').replace('}', '').split(',').map(img => img.trim());
    }

    const isPack = product.product_type === 'pack' || 
                   product.category === 'Packs Promo' || 
                   product.name?.toLowerCase().includes('pack');

    // Classe de transition pour le zoom fluide
    const zoomClasses = "w-full h-full transition-transform duration-700 ease-out group-hover:scale-110";

    if (isPack && images.length >= 2) {
      return (
        <div className={zoomClasses}>
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-[1px] bg-white">
            <div className="relative h-full w-full overflow-hidden">
              <img src={images[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="relative h-full w-full overflow-hidden">
              <img src={images[1]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="relative h-full w-full overflow-hidden">
              {images[2] ? (
                <img src={images[2]} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="h-full w-full bg-orange-50 flex items-center justify-center">
                   <span className="text-[6px] font-black text-orange-300 uppercase italic">Festisolde</span>
                </div>
              )}
            </div>
            <div className="relative h-full w-full overflow-hidden">
              {images[3] ? (
                <img src={images[3]} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="h-full w-full bg-orange-600 flex items-center justify-center p-1 text-center">
                  <span className="text-[7px] font-bold text-white uppercase leading-none">
                    {product.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <img 
        src={product.image_url || images[0]} 
        className={zoomClasses + " object-cover"} 
        alt={product.name} 
      />
    );
  };

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
      <div className="relative h-[220px] md:h-[320px] w-full bg-gray-100 overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
             <span className="text-[10px] text-white/10 font-black tracking-[0.5em] uppercase italic">Festisolde Premium</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/10" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-3 bg-white/90 rounded-full shadow-xl">
          <ArrowLeft size={16} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* --- INFOS BOUTIQUE --- */}
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 pb-12 border-b border-gray-50">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2.5rem] p-1.5 shadow-2xl -mt-16 md:-mt-20 z-10">
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-50">
              {store.logo_url ? (
                <img src={store.logo_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-4xl font-black text-gray-200 italic uppercase">{store.name?.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase italic">{store.name}</h1>
                <CheckCircle2 size={18} className="text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 max-w-lg font-bold italic leading-relaxed">
                {store.description || "Boutique officielle certifiée par Festisolde."}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-3.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl">
                S'abonner
              </button>
              <button className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- GRILLE PRODUITS --- */}
        <div className="py-16">
          <div className="flex items-center gap-3 mb-12">
            <LayoutGrid size={16} className="text-orange-600" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-900 italic">Collection</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/produit/${product.id}`)}
                className="group cursor-pointer"
              >
                {/* CONTAINER IMAGE (FORCÉ EN 3/4) */}
                <div className="aspect-[3/4] w-full bg-gray-50 rounded-[2rem] overflow-hidden mb-4 relative border border-gray-100 shadow-sm">
                  {renderProductMedia(product)}
                  
                  {/* Badge promo */}
                  {product.sale_price < product.price && (
                    <div className="absolute top-3 left-3 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg italic z-10">
                      -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                    </div>
                  )}
                </div>

                <div className="space-y-1 px-1">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase truncate">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black italic">{product.sale_price?.toLocaleString()} <span className="text-[9px] not-italic">CFA</span></span>
                    {product.sale_price < product.price && (
                      <span className="text-[10px] text-gray-300 line-through font-bold">{product.price?.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-32 text-center">
               <ShieldCheck size={40} className="mx-auto text-gray-100 mb-4" />
               <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-black italic">Boutique en cours de mise en rayon.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* --- PANIER FLOTTANT --- */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[340px] px-6">
          <button 
            onClick={() => navigate('/panier')}
            className="w-full bg-black text-white p-2 rounded-full shadow-2xl flex items-center justify-between hover:bg-orange-600 transition-all group"
          >
            <div className="flex items-center gap-3 pl-2">
              <div className="relative w-11 h-11 bg-white/10 rounded-full flex items-center justify-center">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Voir Panier</span>
            </div>
            <div className="pr-6 opacity-50 group-hover:translate-x-1 transition-all">→</div>
          </button>
        </div>
      )}
    </div>
  );
}