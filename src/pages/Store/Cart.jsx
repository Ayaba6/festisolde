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

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('whatsapp_number, slug')
        .eq('id', storeId)
        .single();

      if (storeError) throw new Error("Impossible de trouver les infos de la boutique.");
      
      const sellerPhone = storeData?.whatsapp_number || "22600000000"; 
      const storeSlug = storeData?.slug;

      // 1. Enregistrement en base de données
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

      // 2. Mise à jour des ventes
      await Promise.all(cart.map(async (item) => {
        await supabase.rpc('increment_sales', { 
          row_id: item.id, 
          qty: item.quantity 
        });
      }));

      // 3. PRÉPARATION DU MESSAGE WHATSAPP AMÉLIORÉ
      // On inclut l'URL de l'image pour que WhatsApp puisse générer un aperçu
      const productList = cart.map(item => {
        const imageLink = item.image_url || item.images?.[0] || '';
        return `• *${item.name}*\n` +
               `${item.selectedSize ? `  Taille: ${item.selectedSize}\n` : ''}` +
               `${item.selectedColor ? `  Couleur: ${item.selectedColor}\n` : ''}` +
               `  Qté: ${item.quantity} x ${item.sale_price.toLocaleString()} CFA\n` +
               `  📷 Photo: ${imageLink}\n`; // Le lien de l'image ici
      }).join('\n');

      const message = `*NOUVELLE COMMANDE FESTISOLDE* 🛍️\n\n` +
        `👤 *Client :* ${customerInfo.name.toUpperCase()}\n` + 
        `📞 *WhatsApp :* ${customerInfo.phone}\n` +
        `📍 *Ville :* ${customerInfo.city || 'Non précisée'}\n\n` +
        `--------------------------\n` +
        `🛒 *ARTICLES :*\n\n${productList}\n` +
        `--------------------------\n` +
        `💰 *TOTAL À PAYER : ${total.toLocaleString()} FCFA*\n\n` +
        `🔗 *Lien boutique :* https://festisolde.com/${storeSlug}`;

      const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
      
      // 4. Finalisation
      clearCart();
      
      navigate('/confirmation', { 
        state: { 
          customerName: customerInfo.name,
          whatsappUrl: whatsappUrl,
          storeSlug: storeSlug
        } 
      });

    } catch (error) {
      console.error("Erreur commande:", error);
      alert(error.message || "Erreur lors de l'enregistrement de la commande.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Ton panier est vide</h2>
      <button onClick={() => navigate('/')} className="mt-10 px-10 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
        Découvrir
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFB] pb-32 antialiased text-gray-900">
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 bg-white px-5 py-3 rounded-full border border-gray-100 shadow-sm active:scale-95 transition-all">
          <ChevronLeft size={14} /> Retour
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter flex items-baseline gap-3">
              Panier <span className="text-xs not-italic font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{cart.length}</span>
            </h1>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-[2rem] flex gap-4 items-center border border-gray-100 shadow-sm transition-all group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F9F9F9] rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                    <img 
                      src={item.image_url || item.images?.[0]} 
                      className="w-full h-full object-cover" 
                      alt={item.name} 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] md:text-sm font-black uppercase tracking-tight truncate text-gray-900 leading-tight">{item.name}</h3>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.selectedSize && (
                            <span className="text-[8px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md uppercase">Taille: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                            <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase">Couleur: {item.selectedColor}</span>
                        )}
                    </div>

                    <p className="font-black text-orange-600 mt-1.5 text-sm italic">
                      {item.sale_price.toLocaleString()} <span className="text-[9px] not-italic ml-0.5">CFA</span>
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                        <button onClick={() => item.quantity > 1 && addToCart(item, -1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-600 transition-colors"><Minus size={12} /></button>
                        <span className="text-xs font-black w-6 text-center italic">{item.quantity}</span>
                        <button onClick={() => addToCart(item, 1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-600 transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-200 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-[380px]">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-gray-300">Mon Résumé</h2>
              
              <div className="space-y-3 mb-8 pb-8 border-b border-gray-50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Articles ({cart.length})</span>
                  <span className="text-gray-900">{getCartTotal().toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest mb-1 italic">Total</span>
                  <span className="text-3xl font-black italic tracking-tighter text-orange-600 leading-none">
                    {getCartTotal().toLocaleString()} <span className="text-[10px] not-italic text-gray-400">CFA</span>
                  </span>
                </div>
              </div>

              {!isOrdering ? (
                <button 
                  onClick={() => setIsOrdering(true)}
                  className="w-full py-5 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Passer à la caisse <ArrowRight size={14} />
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <input 
                      required
                      type="text" 
                      placeholder="TON NOM COMPLET" 
                      className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-600 transition-all"
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                    <input 
                      required
                      type="tel" 
                      placeholder="NUMÉRO WHATSAPP" 
                      className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-600 transition-all"
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="VILLE & QUARTIER" 
                      className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-600 transition-all"
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 disabled:bg-gray-200"
                    onClick={handleConfirmOrder}
                  >
                    <MessageCircle size={18} />
                    {loading ? "Traitement..." : "Confirmer sur WhatsApp"}
                  </button>
                  <button onClick={() => setIsOrdering(false)} className="w-full py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    ← Retour au panier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}