import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ChevronLeft, Plus, Minus, MessageCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Cart() {
  const { cart, removeFromCart, getCartTotal, addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [loading, setLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    city: ''
  });

  const handleConfirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert("⚠️ Veuillez remplir votre nom et votre numéro de téléphone.");
      return;
    }

    setLoading(true);

    try {
      const total = getCartTotal();
      const storeId = cart[0]?.store_id;

      // 1. Enregistrement de la commande dans la table 'orders'
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            store_id: storeId,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_city: customerInfo.city,
            items: cart,
            total_amount: total,
            status: 'nouveau'
          }
        ]);

      if (orderError) throw orderError;

      // 2. MISE À JOUR SYNCHRONISÉE : Stock & Compteur de ventes
      // On utilise Promise.all pour exécuter les mises à jour de tous les articles en parallèle
      await Promise.all(cart.map(async (item) => {
        const { error: updateError } = await supabase.rpc('increment_sales', { 
          row_id: item.id, 
          qty: item.quantity 
        });
        
        if (updateError) {
            console.error(`Erreur de mise à jour pour le produit ${item.id}:`, updateError);
            // On peut décider de ne pas bloquer la commande si une mise à jour de stock échoue
        }
      }));

      // 3. Préparation du message WhatsApp
      const productList = cart.map(item => 
        `• ${item.name} (x${item.quantity}) - ${(item.sale_price * item.quantity).toLocaleString()} FCFA`
      ).join('\n');

      const message = `*NOUVELLE COMMANDE FESTISOLDE* 🛍️\n\n` +
        `👤 *Client :* ${customerInfo.name}\n` +
        `📞 *WhatsApp :* ${customerInfo.phone}\n` +
        `📍 *Ville :* ${customerInfo.city || 'Non précisée'}\n\n` +
        `🛒 *Articles :*\n${productList}\n\n` +
        `💰 *TOTAL : ${total.toLocaleString()} FCFA*`;

      const sellerPhone = cart[0]?.seller_phone || "22600000000"; 
      const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
      
      // 4. Finalisation
      clearCart();
      window.open(whatsappUrl, '_blank');
      navigate('/');

    } catch (error) {
      console.error("Erreur commande:", error);
      alert("Erreur lors de l'enregistrement de la commande. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Ton panier est vide</h2>
      <p className="text-gray-400 mt-2 text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
        Il est temps de dénicher tes pépites !
      </p>
      <button 
        onClick={() => navigate('/')} 
        className="mt-10 px-10 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all active:scale-95"
      >
        Découvrir
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFB] pb-24 antialiased text-gray-900">
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        
        {/* --- HEADER --- */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
          <ChevronLeft size={14} /> Retour
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- LISTE DES ARTICLES --- */}
          <div className="flex-1">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-baseline gap-3">
              Panier <span className="text-xs not-italic font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{cart.length}</span>
            </h1>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-[1.8rem] flex gap-5 items-center border border-gray-100/60 shadow-sm transition-all hover:shadow-md group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F9F9F9] rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                    <img 
                      src={item.image_url || item.images?.[0]} 
                      className="max-w-full max-h-full object-contain p-2" 
                      alt={item.name} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-tight truncate text-gray-900">{item.name}</h3>
                    <p className="font-black text-orange-600 mt-1 text-sm italic tracking-tight">
                      {item.sale_price.toLocaleString()} <span className="text-[10px] not-italic ml-0.5">CFA</span>
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                        <button onClick={() => item.quantity > 1 && addToCart(item, -1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-600 transition-colors"><Minus size={12} /></button>
                        <span className="text-xs font-black w-6 text-center italic">{item.quantity}</span>
                        <button onClick={() => addToCart(item, 1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-600 transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all mr-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* --- RÉSUMÉ & FORMULAIRE --- */}
          <div className="lg:w-[380px]">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 sticky top-24">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-gray-300">Mon Résumé</h2>
              
              <div className="space-y-4 mb-10 pb-10 border-b border-gray-50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Sous-total</span>
                  <span className="text-gray-900">{getCartTotal().toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-500 italic">
                  <span>Livraison</span>
                  <span className="bg-green-50 px-2 py-0.5 rounded-md">À régler au livreur</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[11px] font-black uppercase tracking-widest mb-1 italic">Total à payer</span>
                  <span className="text-3xl font-black italic tracking-tighter text-orange-600 leading-none">
                    {getCartTotal().toLocaleString()} <span className="text-[10px] not-italic ml-1 text-gray-400">CFA</span>
                  </span>
                </div>
              </div>

              {!isOrdering ? (
                <button 
                  onClick={() => setIsOrdering(true)}
                  className="w-full py-5 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Valider ma commande <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="VOTRE NOM" 
                      className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-orange-600 transition-all placeholder:text-gray-300"
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="WHATSAPP (EX: 70000000)" 
                      className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-orange-600 transition-all placeholder:text-gray-300"
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="VILLE & QUARTIER" 
                      className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-orange-600 transition-all placeholder:text-gray-300"
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    onClick={handleConfirmOrder}
                  >
                    <MessageCircle size={16} />
                    {loading ? "Chargement..." : "Confirmer via WhatsApp"}
                  </button>
                  
                  <button onClick={() => setIsOrdering(false)} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-orange-600 transition-colors">
                    ← Revenir au panier
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-4 opacity-20">
                <ShieldCheck size={14} />
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">FESTISOLDE SECURED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}