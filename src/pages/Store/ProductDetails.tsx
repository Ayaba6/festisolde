import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { ChevronLeft, ShoppingCart, ShieldCheck, Truck, MessageCircle, Share2, Plus, Minus } from 'lucide-react';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart(); // On récupère cart pour le badge
  
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false); // État pour la notification

  // Calcul du nombre total d'articles pour le badge
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  async function fetchProductData() {
    setLoading(true);
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productData) {
      setProduct(productData);
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
    // On ajoute le numéro du store à l'objet produit pour que le panier sache qui contacter
    addToCart({ ...product, seller_phone: store?.phone }, quantity);
    
    // Affichage de la notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = store?.phone || "22600000000";
    const message = `Bonjour, je souhaite commander ${quantity} exemplaire(s) de : ${product.name}. Prix: ${product.sale_price} FCFA.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;
  if (!product) return <div className="p-20 text-center font-bold">Produit introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      
      {/* --- BARRE DE RETOUR AVEC BADGE --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-bold text-sm bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={20} /> Retour
          </button>
          
          <div className="flex gap-4 items-center">
             <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-500">
                <Share2 size={20} />
             </button>
             
             {/* Icône Panier avec Badge Rouge */}
             <div className="relative cursor-pointer p-2 hover:bg-gray-50 rounded-full transition-colors" onClick={() => navigate('/panier')}>
                <ShoppingCart size={22} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-0 md:px-4">
        <div className="flex flex-col md:flex-row gap-8 bg-white md:rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          
          {/* SECTION IMAGE */}
          <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-12 border-r border-gray-50">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-auto max-h-[500px] object-contain rounded-2xl"
            />
          </div>

          {/* SECTION INFOS */}
          <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
            {store && (
              <div 
                className="flex items-center gap-2 mb-6 bg-blue-50 w-fit px-3 py-1.5 rounded-full cursor-pointer hover:bg-blue-100 transition-colors" 
                onClick={() => navigate(`/boutique/${store.name}`)}
              >
                <img src={store.logo_url} className="w-5 h-5 rounded-full object-cover" alt="Logo" />
                <span className="text-xs font-bold text-[#0866FF] uppercase tracking-wider">{store.name}</span>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="text-3xl font-black text-[#0866FF]">{product.sale_price?.toLocaleString()} FCFA</span>
              {product.sale_price < product.price && (
                <span className="text-xl text-gray-300 line-through font-bold">{product.price?.toLocaleString()} FCFA</span>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Description du produit</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Détails non spécifiés."}
              </p>
            </div>

            {/* Sélecteur de quantité */}
            <div className="mt-10">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantité à commander</label>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 px-5 hover:bg-gray-200 transition-colors font-black text-lg"><Minus size={18}/></button>
                  <span className="px-6 font-black text-xl text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 px-5 hover:bg-gray-200 transition-colors font-black text-lg"><Plus size={18}/></button>
                </div>
              </div>
            </div>

            {/* Actions d'achat */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleAddToCart}
                className="py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-gray-200"
              >
                <ShoppingCart size={22} /> Ajouter au panier
              </button>
              
              <button 
                onClick={handleWhatsAppOrder}
                className="py-4 bg-[#25D366] text-white rounded-2xl font-black hover:bg-[#1ebd5e] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-green-100"
              >
                <MessageCircle size={22} /> WhatsApp direct
              </button>
            </div>

            {/* Réassurance */}
            <div className="mt-12 flex flex-wrap gap-6 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                <ShieldCheck size={18} className="text-green-600" />
                Vendeur Vérifié
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                <Truck size={18} className="text-[#0866FF]" />
                Livraison Partout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NOTIFICATION TOAST --- */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 border border-gray-700">
          <div className="bg-green-500 rounded-full p-1">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
             <span className="text-sm font-black italic">Excellent choix !</span>
             <span className="text-[10px] text-gray-400 font-bold uppercase">Article ajouté au panier</span>
          </div>
        </div>
      )}
    </div>
  );
}