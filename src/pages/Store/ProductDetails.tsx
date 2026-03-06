import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Share2, 
  Plus, 
  Minus,
  Eye,
  Zap,
  MessageCircle
} from 'lucide-react';

import { ProductCard } from './ProductCard';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [realtimeViews, setRealtimeViews] = useState(0); // État pour les vues en temps réel

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetchProductData();
    setupRealtimeSubscription(); // Activer l'écouteur temps réel
    
    setQuantity(1);
    setSelectedColor(null);
    setSelectedSize(null);
    window.scrollTo(0, 0);

    // Nettoyage de la souscription à la fermeture du composant
    return () => {
      supabase.channel(`product_views_${productId}`).unsubscribe();
    };
  }, [productId]);

  // FONCTION : Écouter les changements sur la table produits
  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`product_views_${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          // Mise à jour immédiate de l'état local quand la base de données change
          if (payload.new && payload.new.views !== undefined) {
            setRealtimeViews(payload.new.views);
          }
        }
      )
      .subscribe();
  }

  async function fetchProductData() {
    setLoading(true);
    
    // 1. Incrémenter la vue via la fonction RPC
    await supabase.rpc('increment_product_views', { row_id: productId });

    // 2. Récupérer les données initiales
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productData) {
      setProduct(productData);
      setRealtimeViews(productData.views || 0); // Initier le compteur
      const imgs = getImages(productData);
      setSelectedImage(imgs[0]);

      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', productData.store_id)
        .single();
      setStore(storeData);

      const { data: suggestions } = await supabase
        .from('products')
        .select('*, stores(name)')
        .eq('category', productData.category)
        .neq('id', productId)
        .limit(4);
      setSuggestedProducts(suggestions || []);
    }
    setLoading(false);
  }

  const getImages = (prod) => {
    if (!prod?.images) return [];
    if (Array.isArray(prod.images)) return prod.images;
    if (typeof prod.images === 'string' && prod.images.startsWith('{')) {
      return prod.images.replace('{', '').replace('}', '').split(',').map(url => url.trim());
    }
    return [prod.image_url || prod.images];
  };

  const handleAddToCart = () => {
    if (product.colors && !selectedColor) return alert("Veuillez choisir une couleur");
    if (product.sizes && !selectedSize) return alert("Veuillez choisir une taille");

    addToCart({ 
      ...product, 
      seller_phone: store?.phone,
      selectedColor,
      selectedSize 
    }, quantity);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = store?.whatsapp_number || store?.phone || "22600000000";
    const variantInfo = `${selectedColor ? `Couleur: ${selectedColor}` : ''} ${selectedSize ? `Taille: ${selectedSize}` : ''}`;
    const message = `Bonjour, je souhaite commander ${quantity} exemplaire(s) de : ${product.name}. ${variantInfo} Prix: ${product.sale_price} FCFA.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-3 border-gray-100 border-t-orange-600 rounded-full animate-spin" />
    </div>
  );
  
  if (!product) return <div className="p-20 text-center text-sm font-black uppercase tracking-widest text-gray-300 italic">Produit introuvable.</div>;

  const allImages = getImages(product);

  return (
    <div className="min-h-screen bg-white pb-32 antialiased text-gray-900 font-sans">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all">
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ChevronLeft size={18} />
            </div>
            <span className="hidden md:inline">Retour</span>
          </button>
          
          <div className="flex gap-4 items-center">
             <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors"><Share2 size={20} /></button>
             <div className="relative cursor-pointer w-12 h-12 bg-black rounded-full text-white shadow-2xl flex items-center justify-center" onClick={() => navigate('/panier')}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>
                )}
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto mt-8 px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* VISUELS */}
          <div className="lg:w-[50%] flex flex-col-reverse lg:flex-row gap-6">
            {allImages.length > 1 && (
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto scrollbar-hide lg:w-[90px] shrink-0">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`min-w-[70px] h-[70px] lg:min-w-full lg:h-[90px] rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-50 shrink-0 ${
                      selectedImage === img ? 'border-orange-600 ring-4 ring-orange-50' : 'border-transparent opacity-50'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 aspect-square lg:h-[600px] bg-gray-50 rounded-[3rem] overflow-hidden flex items-center justify-center border border-gray-100 group">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>
          </div>

          {/* INFOS */}
          <div className="lg:w-[50%] flex flex-col justify-center">
            <div className="flex items-center justify-between mb-6">
               {store && (
                <div 
                  className="flex items-center gap-3 cursor-pointer group bg-gray-50 pr-4 py-1.5 pl-1.5 rounded-full" 
                  onClick={() => navigate(`/boutique/${store.slug || store.name}`)}
                >
                  <img src={store.logo_url} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                    {store.name}
                  </span>
                </div>
               )}

               {/* COMPTEUR EN TEMPS RÉEL */}
               <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full animate-pulse">
                  <Eye size={14} className="text-orange-600" />
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                    {realtimeViews} vues
                  </span>
               </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] uppercase italic text-gray-900 mb-6">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-4xl font-black text-orange-600 italic tracking-tighter">
                {product.sale_price?.toLocaleString()} <span className="text-sm not-italic font-bold text-orange-600/50">F CFA</span>
              </span>
              {product.price > product.sale_price && (
                <span className="text-xl text-gray-200 line-through font-black italic">{product.price?.toLocaleString()}</span>
              )}
            </div>

            <div className="space-y-8 mb-10">
              <div className="space-y-3">
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-orange-600"></div> Description
                </h3>
                <p className="text-[15px] text-gray-500 leading-relaxed font-medium italic">
                  {product.description || "Édition limitée Festisolde sélectionnée pour son style unique."}
                </p>
              </div>

              {/* COULEURS */}
              {product.colors && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Couleurs disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.split(',').map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color.trim())}
                        className={`px-6 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedColor === color.trim() 
                          ? 'border-black bg-black text-white shadow-lg scale-105' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {color.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAILLES */}
              {product.sizes && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Tailles disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.split(',').map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size.trim())}
                        className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 text-xs font-black italic transition-all ${
                          selectedSize === size.trim() 
                          ? 'border-orange-600 bg-orange-600 text-white shadow-lg rotate-3' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {size.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-6">
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Quantité :</span>
                <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-orange-600 transition-all"><Minus size={16}/></button>
                  <span className="w-14 text-center font-black text-xl italic">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-orange-600 transition-all"><Plus size={16}/></button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <button onClick={handleAddToCart} className="group relative overflow-hidden py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-3">
                  <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <ShoppingCart size={20} className="relative z-10" /> 
                  <span className="relative z-10">Ajouter au panier</span>
                </button>
                
                <button onClick={handleWhatsAppOrder} className="py-6 border-2 border-gray-100 text-gray-900 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <MessageCircle size={20} className="text-green-500" /> WhatsApp Direct
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SUGGESTIONS */}
        {suggestedProducts.length > 0 && (
          <section className="mt-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <Zap size={18} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Complétez votre look</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                  Vous aimerez <br />
                  <span className="text-gray-100 uppercase">Aussi</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10">
              {suggestedProducts.map((suggested) => (
                <ProductCard key={suggested.id} product={suggested} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[400px] px-6">
          <div className="bg-black/90 backdrop-blur-xl text-white p-2 pl-6 rounded-full shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-10">
            <div className="flex flex-col">
              <span className="text-[11px] font-black italic uppercase text-orange-600">Article ajouté !</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Félicitations</span>
            </div>
            <button onClick={() => navigate('/panier')} className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-full hover:bg-orange-600 hover:text-white transition-all">Panier</button>
          </div>
        </div>
      )}
    </div>
  );
}