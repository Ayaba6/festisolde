import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, Send, ShoppingBag, ArrowLeft, Wallet } from 'lucide-react'
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
    window.scrollTo(0, 0)
  }

  const handleFinalConfirm = async () => {
    setLoading(true)
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');

      // 1. Supabase
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

      // --- 2. INITIALISATION FEDAPAY (MÉTHODE BOUTON AUTO-CLICK) ---
      if (!(window as any).FedaPay) {
        throw new Error("FedaPay n'est pas chargé. Vérifiez votre index.html");
      }

      // Supprimer un ancien bouton s'il existe
      const oldBtn = document.getElementById('feda-btn');
      if (oldBtn) oldBtn.remove();

      // Création du bouton
      const btn = document.createElement('button');
      btn.id = 'feda-btn';
      btn.className = 'fedapay-checkout-button';
      btn.style.display = 'none';
      
      // Configuration via Dataset (Format attendu par init)
      Object.assign(btn.dataset, {
        publicKey: 'pk_sandbox_K0SBpfkoQIjLdAPePY4avu6Y',
        transactionAmount: total.toString(),
        transactionCurrency: 'XOF',
        transactionDescription: `Commande Festisolde #${order.id.slice(0, 8)}`,
        customerFirstname: formData.name.split(' ')[0] || 'Client',
        customerLastname: formData.name.split(' ')[1] || 'Festisolde',
        customerEmail: `${cleanPhone}@festisolde.bf`,
        customerPhoneNumber: cleanPhone,
        customerCountry: 'bf'
      });

      document.body.appendChild(btn);

      // Initialisation du script sur ce bouton
      // @ts-ignore
      (window as any).FedaPay.init('#feda-btn');

      // Attendre que FedaPay attache l'événement et cliquer
      setTimeout(() => {
        btn.click();
        setLoading(false);
        
        // Nettoyage et redirection
        clearCart();
        localStorage.removeItem('festi-cart');
        
        // On laisse la fenêtre s'ouvrir avant de partir
        setTimeout(() => {
          navigate('/order-success', { state: { orderId: order.id, total } });
        }, 2000);
      }, 800);

    } catch (err: any) {
      console.error("ERREUR:", err)
      toast.error(err.message)
      setLoading(false)
    }
  }

  // --- RENDU UI ---
  if (showPaymentStep) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center animate-in fade-in duration-500">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-[2rem] flex items-center justify-center border border-brand-primary/20 shadow-inner">
            <Wallet size={36} />
          </div>
        </div>
        <h2 className="text-3xl font-black mb-2 tracking-tight text-gray-900">Paiement</h2>
        <p className="text-gray-500 text-sm mb-10 font-medium italic">Orange Money ou Moov Money Burkina</p>
        
        <div className="bg-gray-900 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total à régler</p>
          <p className="text-4xl font-black text-white">{total.toLocaleString()} F CFA</p>
        </div>

        <button 
          onClick={handleFinalConfirm} 
          disabled={loading}
          className="w-full bg-brand-primary text-white py-6 rounded-2xl font-black uppercase shadow-xl disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Payer maintenant"}
        </button>

        <button onClick={() => setShowPaymentStep(false)} className="mt-6 text-gray-400 font-bold block w-full">Retour</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><ShoppingBag /> Livraison</h2>
      <form onSubmit={handleInitialSubmit} className="space-y-4">
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <input required className="w-full p-6 bg-gray-50/50 rounded-2xl border-none font-bold text-gray-900" placeholder="Nom complet" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="tel" className="w-full p-6 bg-gray-50/50 rounded-2xl border-none font-bold text-gray-900" placeholder="Numéro WhatsApp" onChange={e => setFormData({...formData, phone: e.target.value})} />
            <textarea required className="w-full p-6 bg-gray-50/50 rounded-2xl border-none font-bold text-gray-900 min-h-[120px]" placeholder="Adresse de livraison" onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>
        <button className="w-full bg-brand-primary text-white py-6 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-2xl transition-all">
          Continuer <Send size={20}/>
        </button>
      </form>
    </div>
  )
}