import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, Send, ShoppingBag, ArrowLeft, Wallet, ShieldCheck, CreditCard } from 'lucide-react'
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

      // 1. Enregistrement Supabase
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

      // --- 2. CONFIGURATION FEDAPAY EMBED ---
      if (!(window as any).FedaPay) throw new Error("Service de paiement indisponible");

      const oldBtn = document.getElementById('feda-btn');
      if (oldBtn) oldBtn.remove();

      const btn = document.createElement('button');
      btn.id = 'feda-btn';
      btn.className = 'fedapay-checkout-button';
      btn.style.display = 'none';
      
      Object.assign(btn.dataset, {
        publicKey: 'pk_sandbox_szE7te3pd3XpstTKpoZUub4Y',
        transactionAmount: total.toString(),
        transactionCurrency: 'XOF',
        transactionDescription: `Commande #${order.id.slice(0, 8)}`,
        customerEmail: `${cleanPhone}@festisolde.bf`,
        customerPhoneNumber: cleanPhone,
        // FORCE LE BURKINA ICI
  customerCountry: 'bf', 
  
  // CETTE LIGNE EST LA PLUS IMPORTANTE : 
  // Elle retire tout ce qui n'est pas Orange ou Moov Burkina
  paymentMethods: 'orange_money_bf, moov_money_bf' 
});

      document.body.appendChild(btn);
      
      // Initialisation
      (window as any).FedaPay.init('#feda-btn');

      // Observateur de fermeture / succès
      const checkStatus = setInterval(() => {
        const widget = document.querySelector('.fedapay-container');
        // Si le widget disparaît après avoir été affiché
        if (loading && !widget && document.getElementById('feda-btn')) {
           setTimeout(() => {
             clearInterval(checkStatus);
             clearCart();
             localStorage.removeItem('festi-cart');
             navigate('/order-success', { state: { orderId: order.id, total, method: 'FedaPay' } });
           }, 1000);
        }
      }, 1500);

      // Déclenchement automatique de l'affichage
      setTimeout(() => btn.click(), 500);

    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  // Étape 2 : Écran de paiement intégré
  if (showPaymentStep) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full mb-4 border border-emerald-100">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Paiement Sécurisé</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Finalisation</h2>
        </div>

        {/* Détails Commande Style Ticket */}
        <div className="bg-gray-50 rounded-[2rem] p-6 mb-6 border border-dashed border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs font-bold uppercase">Total à payer</span>
            <span className="text-xl font-black text-gray-900">{total.toLocaleString()} F CFA</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-medium">Client</span>
            <span className="text-gray-900 font-bold truncate ml-4">{formData.name}</span>
          </div>
        </div>

        {/* CONTENEUR EMBED FEDAPAY */}
        <div className="relative min-h-[450px] bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-2xl overflow-hidden transition-all">
          {!loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-xl font-black mb-2">Prêt pour le paiement ?</h3>
                <p className="text-gray-400 text-sm mb-8">Cliquez sur le bouton ci-dessous pour charger les options Orange et Moov Burkina.</p>
                <button 
                  onClick={handleFinalConfirm}
                  className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
                >
                  Afficher les options
                </button>
             </div>
          ) : (
            <div id="fedapay-embed-container" className="w-full h-full animate-in fade-in duration-1000">
              {/* Le formulaire FedaPay va s'injecter ici */}
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chargement sécurisé...</p>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowPaymentStep(false)}
          className="w-full mt-8 py-4 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux informations
        </button>
      </div>
    )
  }

  // Étape 1 : Formulaire de livraison (Ton code précédent optimisé)
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-brand-primary text-white rounded-2xl shadow-lg">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Livraison</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Burkina Faso</p>
        </div>
      </div>

      <form onSubmit={handleInitialSubmit} className="space-y-4">
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <div className="relative">
              <User className="absolute left-6 top-6 text-gray-400" size={18} />
              <input required className="w-full pl-16 pr-8 py-6 bg-gray-50/50 rounded-2xl border-none font-bold text-gray-900" placeholder="Nom et Prénom" onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="relative">
              <Phone className="absolute left-6 top-6 text-gray-400" size={18} />
              <input required type="tel" className="w-full pl-16 pr-8 py-6 bg-gray-50/50 rounded-2xl border-none font-bold text-gray-900" placeholder="WhatsApp (70...)" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="relative">
              <MapPin className="absolute left-6 top-6 text-gray-400" size={18} />
              <textarea required className="w-full pl-16 pr-8 py-6 bg-gray-50/50 rounded-2xl border-none font-bold text-gray-900 min-h-[120px] resize-none" placeholder="Adresse précise (Ville, Quartier, Rue...)" onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
        </div>
        <button className="w-full bg-brand-primary text-white py-6 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-primary/90 transition-all">
          Étape suivante <Send size={20}/>
        </button>
      </form>
    </div>
  )
}