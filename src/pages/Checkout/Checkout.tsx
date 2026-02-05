import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, ArrowLeft, Truck, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Checkout({ cart, total, clearCart }: any) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })
  
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return toast.error("Votre panier est vide")
    setShowPaymentStep(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinalConfirm = async () => {
    setLoading(true)
    try {
      // Nettoyage du numéro de téléphone
      const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');

      // 1. Enregistrement de la commande principale
      const { data: createdOrders, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: cleanPhone,
          customer_address: formData.address,
          total_price: total,
          payment_method: 'Paiement à la livraison',
          status: 'En attente'
        }])
        .select()

      if (orderError) {
        console.error("Erreur Table Orders:", orderError);
        throw new Error("Impossible de créer la commande : " + orderError.message);
      }

      if (!createdOrders || createdOrders.length === 0) {
        throw new Error("La commande n'a pas été retournée après insertion.");
      }

      const order = createdOrders[0]

      // 2. Préparation des articles avec sécurité sur les données
      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        shop_id: item.shop_id || null, // Évite l'erreur si shop_id est manquant
        quantity: parseInt(item.quantity),
        price: parseFloat(item.promo_price || item.price),
        product_name: item.title || 'Produit sans nom'
      }))

      // 3. Insertion des articles
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error("Erreur Table Order_Items:", itemsError);
        // Optionnel : Supprimer la commande parente si les articles échouent
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error("Erreur articles : " + itemsError.message);
      }

      // 4. Succès et nettoyage
      clearCart();
      localStorage.removeItem('festi_cart');
      
      toast.success("Commande enregistrée avec succès !");
      
      // Redirection vers une page de succès (assure-toi que cette route existe)
      navigate('/order-success', { 
        state: { orderId: order.id, total, method: 'Livraison' } 
      });

    } catch (err: any) {
      console.error("Erreur globale Checkout:", err);
      toast.error(err.message || "Une erreur est survenue lors de la confirmation");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* GAUCHE : FORMULAIRE */}
          <div className="flex-1 w-full">
            {!showPaymentStep ? (
              <div className="animate-in fade-in slide-in-from-left duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Livraison</h2>
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5">
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input required className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl font-bold transition-all outline-none" placeholder="Votre nom complet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input required type="tel" className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl font-bold transition-all outline-none" placeholder="WhatsApp (ex: 70000000)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-6 text-gray-400" size={20} />
                      <textarea required className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl font-bold min-h-[140px] outline-none" placeholder="Adresse précise (Quartier, Rue, Repères...)" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3">
                    Continuer vers le paiement <ArrowLeft className="rotate-180" size={20}/>
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <button onClick={() => setShowPaymentStep(false)} className="flex items-center gap-2 text-gray-400 font-bold text-xs mb-6 uppercase tracking-widest">
                  <ArrowLeft size={16} /> Retour aux infos
                </button>
                
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 italic uppercase">Paiement</h2>

                <div className="space-y-4 mb-8">
                  <div className="p-6 rounded-[2rem] border-2 border-rose-500 bg-rose-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-rose-500 text-white shadow-md"><Truck size={24} /></div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-sm">Paiement à la livraison</p>
                        <p className="text-xs text-gray-500 font-bold italic">Réglez en espèces lors de la réception</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-rose-500" />
                  </div>
                </div>

                <button 
                  onClick={handleFinalConfirm}
                  disabled={loading}
                  className="w-full py-6 rounded-3xl font-black uppercase tracking-widest bg-rose-600 text-white shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Traitement de la commande..." : `Confirmer & Commander`}
                </button>
              </div>
            )}
          </div>

          {/* DROITE : RÉSUMÉ */}
          <div className="w-full lg:w-[400px] sticky top-12">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 uppercase mb-6 italic tracking-tight">Résumé Panier</h3>
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      <img src={Array.isArray(item.images) ? item.images[0] : (item.images || item.image_url)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-[11px] line-clamp-1 uppercase leading-none mb-1">{item.title}</h4>
                      <p className="font-black text-rose-500 text-[10px] tracking-tight">{item.quantity} × {(item.promo_price || item.price).toLocaleString()} F</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString()} F</span>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase mb-1">
                        <span>Frais de Livraison</span>
                        <span className="text-rose-600 italic">À calculer</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold leading-tight">
                        * Le livreur vous communiquera le montant selon votre position exacte.
                    </p>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <span className="text-sm font-black uppercase text-gray-900 italic">Total Final</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{total.toLocaleString()} F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}