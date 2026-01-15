import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, Send, CreditCard, ShoppingBag, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function Checkout({ cart, total, clearCart }: any) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    method: 'Orange Money'
  })

  const MERCHANT_NUMBERS = {
    'Orange Money': '70 00 00 00',
    'Moov Money': '60 00 00 00'
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return toast.error("Votre panier est vide")
    setShowPaymentStep(true)
    window.scrollTo(0, 0)
  }

  const handleFinalConfirm = async () => {
    setLoading(true)
    try {
      // 1. Création de la commande principale
      const { data: createdOrders, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          total_price: total,
          payment_method: formData.method,
          status: 'En attente'
        }])
        .select()

      if (orderError) throw orderError
      if (!createdOrders || createdOrders.length === 0) throw new Error("Échec de création")
      
      const order = createdOrders[0]

      // 2. Création des lignes de commande
      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.promo_price || item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Nettoyage et redirection
      toast.success('Commande enregistrée avec succès !')
      clearCart() 
      localStorage.removeItem('festi-cart') 
      
      navigate('/order-success', { 
        state: { orderId: order.id, method: formData.method, total } 
      })

    } catch (err: any) {
      console.error("ERREUR:", err)
      toast.error("Une erreur est survenue lors de la validation")
    } finally {
      setLoading(false)
    }
  }

  // ÉTAPE 2 : INSTRUCTIONS DE PAIEMENT
  if (showPaymentStep) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center border border-emerald-100 shadow-inner">
            <ShieldCheck size={36} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Dernière étape</h2>
        <p className="text-gray-500 text-sm font-medium mb-10">Envoyez le montant via {formData.method}</p>

        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 mb-8 shadow-sm">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Montant à transférer</p>
              <p className="text-5xl font-black text-gray-900 tracking-tighter">{total.toLocaleString()} <small className="text-lg">F</small></p>
            </div>
            
            <div className="bg-white py-6 px-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Numéro Marchand {formData.method}</p>
              <p className="text-3xl font-black text-brand-primary tracking-widest">
                {MERCHANT_NUMBERS[formData.method as keyof typeof MERCHANT_NUMBERS]}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleFinalConfirm} 
            disabled={loading} 
            className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Traitement..." : <>Confirmer mon paiement <CheckCircle size={20}/></>}
          </button>
          
          <button onClick={() => setShowPaymentStep(false)} className="w-full py-4 text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:text-gray-600 transition-colors">
            <ArrowLeft size={14} /> Retour aux informations
          </button>
        </div>
      </div>
    )
  }

  // ÉTAPE 1 : FORMULAIRE DE LIVRAISON
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-gray-900 text-white rounded-[1.5rem] shadow-xl">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Checkout</h2>
          <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">Finalisez votre commande</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* FORMULAIRE GAUCHE */}
        <form onSubmit={handleInitialSubmit} className="lg:col-span-7 space-y-10">
          
          {/* Section Coordonnées */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">📍 Détails de livraison</h3>
            <div className="bg-white p-3 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-3">
              <div className="relative group">
                <User className="absolute left-6 top-6 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  required 
                  className="w-full pl-16 pr-8 py-6 bg-gray-50/50 rounded-[1.8rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white focus:ring-0 font-bold text-gray-900 placeholder:text-gray-300 transition-all" 
                  placeholder="Votre nom complet" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="relative group">
                <Phone className="absolute left-6 top-6 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  required 
                  type="tel" 
                  className="w-full pl-16 pr-8 py-6 bg-gray-50/50 rounded-[1.8rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white focus:ring-0 font-bold text-gray-900 placeholder:text-gray-300 transition-all" 
                  placeholder="Téléphone (WhatsApp de préférence)" 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-6 top-6 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <textarea 
                  required 
                  rows={2} 
                  className="w-full pl-16 pr-8 py-6 bg-gray-50/50 rounded-[1.8rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white focus:ring-0 font-bold text-gray-900 placeholder:text-gray-300 transition-all resize-none" 
                  placeholder="Adresse précise (Quartier, Rue, Porte...)" 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Section Mode de Paiement */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">💳 Mode de paiement</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Orange Money', 'Moov Money'].map(m => (
                <button 
                  key={m} 
                  type="button" 
                  onClick={() => setFormData({...formData, method: m})} 
                  className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all duration-300 ${
                    formData.method === m 
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-lg shadow-brand-primary/10' 
                    : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="font-black text-[10px] uppercase tracking-widest">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-brand-primary text-white py-6 rounded-[2.2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
            Valider ma commande <Send size={20}/>
          </button>
        </form>

        {/* RÉCAPITULATIF DROITE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl sticky top-32">
            <h3 className="font-black text-xl mb-8 tracking-tighter">Récapitulatif</h3>
            
            <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
              {cart.map((item: any) => (
                <div key={item.id} className="flex items-center gap-5 group">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                    <img 
                      src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                      alt={item.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-white/90 truncate mb-1">{item.title}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-white/40 uppercase">{item.quantity} Pièce(s)</p>
                      <p className="text-sm font-black text-brand-primary">
                        {((item.promo_price || item.price) * item.quantity).toLocaleString()} F
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sous-total</span>
                <span className="font-bold">{total.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Livraison</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">Calculée après appel</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-white/10">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Total à payer</p>
                <p className="text-4xl font-black text-white tracking-tighter leading-none">{total.toLocaleString()} <small className="text-sm">F</small></p>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
             <ShieldCheck className="text-emerald-500" size={24} />
             <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-wider">
               Paiement 100% sécurisé via les passerelles mobiles locales.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}