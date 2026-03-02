import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ChevronLeft, Plus, Minus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Assure-toi que l'import est correct

export default function Cart() {
  const { cart, removeFromCart, getCartTotal, addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [loading, setLoading] = useState(false); // Pour éviter les doubles clics

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
      const storeId = cart[0]?.store_id; // On récupère l'ID de la boutique

      // 1. Enregistrement dans la table 'orders' de Supabase
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            store_id: storeId,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_city: customerInfo.city,
            items: cart, // Sauvegarde la liste complète en JSON
            total_amount: total,
            status: 'nouveau'
          }
        ]);

      if (error) throw error;

      // 2. Préparation du message WhatsApp
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
      
      // 3. Finalisation
      clearCart(); // On vide le panier local
      window.open(whatsappUrl, '_blank'); // On ouvre WhatsApp
      navigate('/'); // On redirige vers l'accueil

    } catch (error) {
      console.error("Erreur commande:", error);
      alert("Désolé, une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={44} className="text-gray-400" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 leading-tight">Votre panier est vide</h2>
      <p className="text-gray-500 mt-2 max-w-xs">On dirait que vous n'avez pas encore trouvé votre bonheur !</p>
      <button 
        onClick={() => navigate('/')} 
        className="mt-8 px-10 py-4 bg-[#0866FF] text-white rounded-xl font-bold hover:bg-[#0556D8] transition-all shadow-lg active:scale-95"
      >
        Découvrir les produits
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 font-bold mb-8 group">
          <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à la boutique
        </button>

        <h1 className="text-3xl font-black mb-8 text-gray-900 tracking-tight">Mon Panier ({cart.length})</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center border border-white hover:border-gray-200 transition-all">
                <img 
                  src={item.image_url} 
                  className="w-24 h-24 object-cover rounded-xl bg-gray-50 flex-shrink-0" 
                  alt={item.name} 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="font-black text-[#0866FF] mt-1 text-lg">
                    {item.sale_price.toLocaleString()} FCFA
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-100 rounded-lg bg-gray-50 p-0.5">
                      <button onClick={() => item.quantity > 1 && addToCart(item, -1)} className="p-1.5 hover:text-[#0866FF] transition-colors"><Minus size={16} /></button>
                      <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(item, 1)} className="p-1.5 hover:text-[#0866FF] transition-colors"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all text-red-500"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>

          <div className="md:w-80 lg:w-96">
            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24 border border-white">
              <h2 className="font-black text-xl mb-6 text-gray-900 tracking-tight uppercase">Résumé</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Articles</span>
                  <span>{getCartTotal().toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium italic text-green-600">
                  <span>Livraison</span>
                  <span className="text-xs font-bold uppercase underline">Payée à l'arrivée</span>
                </div>
                <div className="flex justify-between font-black text-2xl border-t pt-5 text-gray-900">
                  <span>Total</span>
                  <span className="text-[#0866FF]">{getCartTotal().toLocaleString()} FCFA</span>
                </div>
              </div>

              {!isOrdering ? (
                <button 
                  onClick={() => setIsOrdering(true)}
                  className="w-full py-4 bg-[#0866FF] text-white rounded-xl font-bold hover:bg-[#0556D8] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  Valider ma commande <ArrowRight size={20} />
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Votre nom complet" 
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0866FF]/20 focus:bg-white transition-all"
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="Numéro WhatsApp" 
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0866FF]/20 focus:bg-white transition-all"
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Ville (ex: Ouaga)" 
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0866FF]/20 focus:bg-white transition-all"
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1ebd5e] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    onClick={handleConfirmOrder}
                  >
                    <MessageCircle size={22} />
                    {loading ? "Enregistrement..." : "Confirmer par WhatsApp"}
                  </button>
                  
                  <button onClick={() => setIsOrdering(false)} className="w-full py-2 text-gray-400 text-xs font-bold hover:text-gray-600">
                    ← Modifier mon panier
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