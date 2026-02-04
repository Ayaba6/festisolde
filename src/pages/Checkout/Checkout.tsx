import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, Send, ShoppingBag, ArrowLeft, Wallet, ShieldCheck, Zap } from 'lucide-react'
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
      const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');

      // 1. Enregistrement sécurisé
      const { data: createdOrders, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: cleanPhone,
          customer_address: formData.address,
          total_price: total,
          payment_method: 'FedaPay',
          status: 'En attente'
        }])
        .select()

      if (orderError) throw orderError
      const order = createdOrders[0]

      if (!(window as any).FedaPay) throw new Error("Service de paiement temporairement indisponible");

      const oldBtn = document.getElementById('feda-btn');
      if (oldBtn) oldBtn.remove();

      const btn = document.createElement('button');
      btn.id = 'feda-btn';
      btn.className = 'fedapay-checkout-button';
      btn.style.display = 'none';
      
      Object.assign(btn.dataset, {
        publicKey: 'pk_sandbox_K0SBpfkoQIjLdAPePY4avu6Y',
        transactionAmount: total.toString(),
        transactionCurrency: 'XOF',
        transactionDescription: `Commande Festisolde #${order.id.slice(0, 8)}`,
        customerFirstname: formData.name.split(' ')[0],
        customerEmail: `${cleanPhone}@festisolde.bf`,
        customerPhoneNumber: cleanPhone,
        customerCountry: 'bf'
      });

      document.body.appendChild(btn);
      (window as any).FedaPay.init('#feda-btn');

      // Observateur de fermeture amélioré
      const checkWidgetClosed = setInterval(() => {
        const widget = document.querySelector('.fedapay-container');
        if (loading && !widget && document.getElementById('feda-btn')) {
           setTimeout(() => {
             clearInterval(checkWidgetClosed);
             clearCart();
             localStorage.removeItem('festi-cart');
             navigate('/order-success', { state: { orderId: order.id, total, method: 'FedaPay' } });
           }, 1000);
        }
      }, 1000);

      setTimeout(() => btn.click(), 600);

    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  if (showPaymentStep) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in duration-500">
        {/* Badge Sécurité */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full mb-8 border border-emerald-100 shadow-sm">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Paiement 100% Sécurisé</span>
        </div>

        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter text-center">Finaliser</h2>
        <p className="text-gray-400 text-sm mb-10 text-center font-medium max-w-[250px]">
          Choisissez votre réseau <span className="text-orange-500">Orange</span> ou <span className="text-blue-600">Moov</span> Burkina.
        </p>
        
        {/* Carte de Paiement Look "Apple Pay" */}
        <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
             <Zap size={80} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Montant à payer</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter">{total.toLocaleString()}</span>
              <span className="text-xl font-bold text-white/50">F CFA</span>
            </div>
            
            <div className="mt-12 flex justify-between items-end">
              <div>
                <p className="text-white/30 text-[8px] font-bold uppercase mb-1">Client</p>
                <p className="text-white font-bold text-sm truncate max-w-[150px]">{formData.name || "Client"}</p>
              </div>
              <Wallet className="text-white/20" size={32} />
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={handleFinalConfirm} 
            disabled={loading}
            className="w-full bg-brand-primary text-white py-6 rounded-2xl font-black uppercase shadow-xl hover:shadow-brand-primary/40 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Ouvrir le portail <Send size={18} /></>
            )}
          </button>

          <button 
            onClick={() => setShowPaymentStep(false)} 
            className="w-full py-4 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={16} /> Modifier mes informations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Caisse</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Étape 1 sur 2</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleInitialSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="group relative bg-gray-50 rounded-3xl p-2 border border-transparent focus-within:border-brand-primary/20 focus-within:bg-white transition-all">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors">
              <User size={20} />
            </div>
            <input required className="w-full pl-14 pr-6 py-6 bg-transparent border-none focus:ring-0 font-bold text-gray-900 text-lg" placeholder="Nom complet" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="group relative bg-gray-50 rounded-3xl p-2 border border-transparent focus-within:border-brand-primary/20 focus-within:bg-white transition-all">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors">
              <Phone size={20} />
            </div>
            <input required type="tel" className="w-full pl-14 pr-6 py-6 bg-transparent border-none focus:ring-0 font-bold text-gray-900 text-lg" placeholder="Numéro WhatsApp" onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="group relative bg-gray-50 rounded-3xl p-2 border border-transparent focus-within:border-brand-primary/20 focus-within:bg-white transition-all">
            <div className="absolute left-6 top-8 text-gray-400 group-focus-within:text-brand-primary transition-colors">
              <MapPin size={20} />
            </div>
            <textarea required className="w-full pl-14 pr-6 py-6 bg-transparent border-none focus:ring-0 font-bold text-gray-900 text-lg min-h-[150px] resize-none" placeholder="Adresse complète (Ville, Quartier, Rue...)" onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </div>

        <button className="w-full bg-gray-900 text-white py-7 rounded-[2.5rem] font-black uppercase text-lg flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all group">
          Suivant: Paiement 
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform">
            <Send size={14} />
          </div>
        </button>
      </form>
    </div>
  )
}