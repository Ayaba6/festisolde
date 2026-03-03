import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { 
  ChevronLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Share2, 
  Plus, 
  Minus,
  LayoutGrid,
  Eye // Ajout de l'icône Eye
} from 'lucide-react';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const getImages = (prod) => {
    if (!prod?.images) return [];
    if (Array.isArray(prod.images)) return prod.images;
    if (typeof prod.images === 'string' && prod.images.startsWith('{')) {
      return prod.images.replace('{', '').replace('}', '').split(',').map(url => url.trim());
    }
    return [prod.image_url || prod.images];
  };

  async function fetchProductData() {
    setLoading(true);

    // --- 1. INC RÉMENTATION DES VUES ---
    // On appelle la fonction RPC créée dans Supabase
    await supabase.rpc('increment_product_views', { row_id: productId });

    // --- 2. RÉCUPÉRATION DES DONNÉES ---
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productData) {
      setProduct(productData);
      const imgs = getImages(productData);
      setSelectedImage(imgs[0]);

      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', productData.store_id)
        .single();
      setStore(storeData);
    }
    setLoading(false);
  }

  const handleAddToCart = () => {
    addToCart({ ...product, seller_phone: store?.phone }, quantity);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = store?.phone || "22600000000";
    const message = `Bonjour, je souhaite commander ${quantity} exemplaire(s) de : ${product.name}. Prix: ${product.sale_price} FCFA.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-7 h-7 border-2 border-gray-100 border-t-orange-600 rounded-full animate-spin" />
    </div>
  );
  
  if (!product) return <div className="p-20 text-center text-sm font-bold uppercase tracking-widest text-gray-400">Produit introuvable.</div>;

  const allImages = getImages(product);

  return (
    <div className="min-h-screen bg-white pb-32 antialiased text-gray-900">
      
      {/* --- HEADER --- */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100 transition-all">
            <ChevronLeft size={16} /> Retour
          </button>
          
          <div className="flex gap-3 items-center">
             <button className="p-2 text-gray-400 hover:text-black transition-colors"><Share2 size={20} /></button>
             <div className="relative cursor-pointer p-2 bg-black rounded-full text-white shadow-xl shadow-black/10" onClick={() => navigate('/panier')}>
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>
                )}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* --- SECTION VISUELS --- */}
          <div className="lg:w-[55%] flex flex-col-reverse lg:flex-row gap-4">
            {allImages.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-hide lg:w-[80px] shrink-0 lg:max-h-[450px]">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`min-w-[65px] h-[65px] lg:min-w-full lg:h-[75px] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-[#FBFBFB] shrink-0 ${
                      selectedImage === img ? 'border-orange-600 shadow-md scale-95' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} className="max-w-full max-h-full object-contain p-1" alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 h-[300px] md:h-[450px] bg-[#FBFBFB] rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-gray-50 shadow-inner">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain p-6 md:p-8"
              />
            </div>
          </div>

          {/* --- SECTION INFOS --- */}
          <div className="lg:w-[45%] flex flex-col pt-0">
            <div className="flex items-center justify-between mb-4">
               {store && (
                <div 
                  className="flex items-center gap-3 cursor-pointer group" 
                  onClick={() => navigate(`/boutique/${store.slug || store.name}`)}
                >
                  <img src={store.logo_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                    {store.name}
                  </span>
                </div>
               )}

               {/* COMPTEUR DE VUES */}
               <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full">
                  <Eye size={12} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    {product.views || 0} vues
                  </span>
               </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-[1.1] uppercase italic text-gray-900">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-black text-orange-600 italic">
                {product.sale_price?.toLocaleString()} <span className="text-sm not-italic ml-0.5 font-bold text-gray-400">FCFA</span>
              </span>
              {product.sale_price < product.price && (
                <span className="text-lg text-gray-300 line-through font-bold italic">{product.price?.toLocaleString()}</span>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid size={14} className="text-orange-600" /> Description
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                {product.description || "Article premium sélectionné par Festisolde pour sa qualité exceptionnelle."}
              </p>
            </div>

            <div className="mt-8">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Quantité</span>
              <div className="flex items-center mt-3 w-fit bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-600 transition-all"><Minus size={14}/></button>
                <span className="w-12 text-center font-black text-base italic">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-600 transition-all"><Plus size={14}/></button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button onClick={handleAddToCart} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-orange-600 transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-3">
                <ShoppingCart size={18} /> Ajouter au panier
              </button>
              <button onClick={handleWhatsAppOrder} className="w-full py-4 border-2 border-gray-900 text-gray-900 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
                <MessageCircle size={18} /> WhatsApp Direct
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 pt-8 border-t border-gray-50">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-gray-500">
                 <ShieldCheck size={16} className="text-green-600" /> Vendeur Vérifié
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-gray-600">
                 <Truck size={16} className="text-blue-600" /> Livraison Rapide
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TOAST --- */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[360px]">
          <div className="bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-5">
            <div className="flex flex-col">
              <span className="text-xs font-black italic uppercase">Ajouté !</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Article prêt au panier</span>
            </div>
            <button onClick={() => navigate('/panier')} className="text-[10px] font-black uppercase tracking-widest bg-orange-600 px-4 py-2 rounded-lg">Voir</button>
          </div>
        </div>
      )}
    </div>
  );
}