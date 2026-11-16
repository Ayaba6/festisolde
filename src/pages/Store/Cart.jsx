import { useCart, unitPrice } from '../../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ChevronLeft, Plus, Minus, MessageCircle, MapPin, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { buildOrderWhatsappUrl, cleanPhone } from '../../lib/whatsapp';

export default function Cart() {
  const { cart, removeFromCart, getCartTotal, addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ligdicash'); // 'ligdicash' | 'livraison'
  const [loading, setLoading] = useState(false);
  const [locationLink, setLocationLink] = useState(null); // Stocke le lien Maps

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    city: ''
  });

  // Fonction pour récupérer la position GPS
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          setLocationLink(mapsUrl);
        },
        (error) => {
          console.error("Erreur GPS:", error);
          alert("Impossible d'accéder à votre position. Vérifiez vos réglages GPS.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const handleConfirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert("⚠️ Veuillez remplir votre nom et votre numéro de téléphone.");
      return;
    }

    setLoading(true);

    try {
      const storeId = cart[0]?.store_id;
      if (!storeId) throw new Error("Panier invalide : boutique inconnue. Videz le panier et réessayez.");

      // Paiement à la livraison : la commande part sur WhatsApp, le vendeur doit avoir un numéro.
      if (paymentMethod === 'livraison') {
        const { data: store } = await supabase.from('stores').select('whatsapp_number').eq('id', storeId).maybeSingle();
        if (!cleanPhone(store?.whatsapp_number)) {
          throw new Error("Cette boutique n'accepte pas encore les commandes WhatsApp. Choisissez le paiement en ligne.");
        }
      }

      // 1. Création de la commande côté serveur (prix, stock et ventes calculés en base)
      const { data: order, error: orderError } = await supabase.rpc('place_order', {
        p_store_id: storeId,
        p_customer_name: customerInfo.name,
        p_customer_phone: customerInfo.phone,
        p_customer_city: customerInfo.city || null,
        p_customer_location: locationLink,
        p_items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.selectedSize || null,
          color: item.selectedColor || null,
        })),
      });

      if (orderError) throw new Error(orderError.message);

      const customer = { ...customerInfo, location: locationLink };

      // 2a. Paiement en ligne : facture LigdiCash puis redirection vers la page de paiement.
      //     Le panier n'est vidé qu'au retour, une fois le paiement confirmé.
      if (paymentMethod === 'ligdicash') {
        try {
          sessionStorage.setItem('festi_pending_payment', JSON.stringify({ customer }));
        } catch { /* stockage indisponible : le message WhatsApp sera plus court */ }

        const { data: pay, error: payError } = await supabase.functions.invoke('ligdicash-create', {
          body: { order_id: order.order_id },
        });
        if (payError || !pay?.payment_url) {
          let msg = "Le paiement en ligne est momentanément indisponible.";
          try { msg = (await payError?.context?.json())?.error || msg; } catch { /* réponse non JSON */ }
          throw new Error(msg);
        }
        window.location.assign(pay.payment_url);
        return;
      }

      // 2b. Paiement à la livraison : message WhatsApp au vendeur (prix confirmés par le serveur)
      const whatsappUrl = buildOrderWhatsappUrl({ order, customer });

      clearCart();

      navigate('/confirmation', {
        state: {
          customerName: customerInfo.name,
          whatsappUrl: whatsappUrl,
          storeSlug: order.store_slug
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
                <div key={item.cartKey || `${item.id}-${index}`} className="bg-white p-4 rounded-[2rem] flex gap-4 items-center border border-gray-100 shadow-sm transition-all group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F9F9F9] rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                    <img src={item.image_url || item.images?.[0]} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] md:text-sm font-black uppercase tracking-tight truncate text-gray-900 leading-tight">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.selectedSize && <span className="text-[8px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md uppercase">Taille: {item.selectedSize}</span>}
                        {item.selectedColor && <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase">Couleur: {item.selectedColor}</span>}
                    </div>
                    <p className="font-black text-orange-600 mt-1.5 text-sm italic">{unitPrice(item).toLocaleString()} <span className="text-[9px] not-italic ml-0.5">CFA</span></p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                        <button onClick={() => item.quantity > 1 && addToCart(item, -1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-600 transition-colors"><Minus size={12} /></button>
                        <span className="text-xs font-black w-6 text-center italic">{item.quantity}</span>
                        <button onClick={() => addToCart(item, 1)} className="w-8 h-8 flex items-center justify-center hover:text-orange-600 transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartKey)} className="p-3 text-gray-200 hover:text-red-500 transition-all">
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
                <button onClick={() => setIsOrdering(true)} className="w-full py-5 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group">
                  Passer à la caisse <ArrowRight size={14} />
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <input required type="text" placeholder="TON NOM COMPLET" className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-600 transition-all" onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    <input required type="tel" placeholder="NUMÉRO WHATSAPP" className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-600 transition-all" onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    <input type="text" placeholder="VILLE & QUARTIER" className="w-full p-4 bg-[#FBFBFB] border border-gray-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-600 transition-all" onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})} />
                  </div>

                  {/* MODE DE PAIEMENT */}
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mode de paiement">
                    {[
                      { id: 'ligdicash', label: 'Payer maintenant', hint: 'Orange · Moov · Carte' },
                      { id: 'livraison', label: 'À la livraison', hint: 'Espèces via WhatsApp' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={paymentMethod === m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${paymentMethod === m.id ? 'border-orange-600 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                      >
                        <span className={`block text-[10px] font-black uppercase tracking-wide ${paymentMethod === m.id ? 'text-orange-600' : 'text-gray-900'}`}>{m.label}</span>
                        <span className="block text-[9px] font-bold text-gray-400 mt-0.5">{m.hint}</span>
                      </button>
                    ))}
                  </div>

                  {/* BOUTON GPS */}
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    className={`w-full py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${locationLink ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-600 hover:text-orange-600'}`}
                  >
                    <MapPin size={14} />
                    {locationLink ? "Position enregistrée ✓" : "Ajouter ma position GPS"}
                  </button>

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 disabled:bg-gray-200"
                    onClick={handleConfirmOrder}
                  >
                    {paymentMethod === 'ligdicash' ? <CreditCard size={18} /> : <MessageCircle size={18} />}
                    {loading
                      ? "Traitement..."
                      : paymentMethod === 'ligdicash'
                        ? `Payer ${getCartTotal().toLocaleString()} CFA`
                        : "Confirmer sur WhatsApp"}
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