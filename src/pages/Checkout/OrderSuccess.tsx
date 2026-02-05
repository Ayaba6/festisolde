import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, MessageCircle, Sparkles, MapPin, Calendar, Truck, Heart } from 'lucide-react'
import { useEffect } from 'react'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    // Si quelqu'un essaie d'accéder à /order-success sans données de commande
    if (!state) {
      const timer = setTimeout(() => navigate('/'), 3000)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [state, navigate])

  const VENDOR_WHATSAPP = "22670189912" // Ton numéro corrigé
  const TOTAL = state?.total?.toLocaleString() || "0"
  const ORDER_ID = state?.orderId?.toString().slice(0, 8).toUpperCase() || "SOLDE"
  const METHOD = state?.method || 'FedaPay' // Récupère la méthode choisie (FedaPay ou Livraison)
  const DATE = new Date().toLocaleDateString('fr-FR')

  // --- LOGIQUE DU MESSAGE WHATSAPP ---
  const getWhatsAppMessage = () => {
    const isCOD = METHOD === 'Livraison'; // COD = Cash on Delivery
    
    let text = `Bonjour FestiSolde ! 👋\n\n`;
    text += isCOD ? `🎁 NOUVELLE COMMANDE (À LIVRER)\n` : `✅ NOUVELLE COMMANDE PAYÉE\n`;
    text += `--------------------------\n`;
    text += `🆔 Référence : #${ORDER_ID}\n`;
    text += `💰 Montant : ${TOTAL} F CFA\n`;
    text += `📅 Date : ${DATE}\n`;
    text += `📍 Méthode : ${isCOD ? 'Paiement à la livraison' : 'Payé par Mobile Money'}\n`;
    text += `--------------------------\n`;
    text += isCOD ? `Merci de me contacter pour la livraison !` : `Mon paiement est validé, merci de confirmer !`;
    
    return text;
  }

  const whatsappUrl = `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(getWhatsAppMessage())}`

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Validation en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] py-16 px-6 flex flex-col items-center">
      {/* Animation de succès */}
      <div className="mb-10 relative">
        <div className="w-28 h-28 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-in zoom-in duration-500">
          <CheckCircle2 size={56} strokeWidth={2.5} />
        </div>
        <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={32} />
        <Heart className="absolute -bottom-2 -left-6 text-rose-400 animate-bounce" size={24} fill="currentColor" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter italic">
          {METHOD === 'Livraison' ? 'Commande Reçue !' : 'Paiement Réussi !'}
        </h1>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
          Votre cadeau de Saint-Valentin arrive bientôt 🌹
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50">
        {/* Header Reçu */}
        <div className="bg-slate-900 p-7 text-white flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Référence Commande</span>
            <span className="text-lg font-black tracking-tighter">#{ORDER_ID}</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Validé</span>
          </div>
        </div>
        
        {/* Détails du reçu */}
        <div className="p-8">
          <div className="space-y-5 mb-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Calendar size={14} /></div>
                <span className="text-xs font-black uppercase tracking-tighter">Date</span>
              </div>
              <span className="text-sm font-black text-gray-900">{DATE}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><MapPin size={14} /></div>
                <span className="text-xs font-black uppercase tracking-tighter">Mode</span>
              </div>
              <span className="text-sm font-black text-rose-500 italic">
                {METHOD === 'Livraison' ? 'Livraison Express' : 'Paiement Mobile'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Truck size={14} /></div>
                <span className="text-xs font-black uppercase tracking-tighter">Status</span>
              </div>
              <span className="text-xs font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">
                Prêt
              </span>
            </div>
          </div>

          {/* Séparateur pointillé */}
          <div className="border-t-2 border-dashed border-gray-100 pt-8 flex flex-col items-center">
            <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] mb-2">Montant Total</span>
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{TOTAL}<span className="text-xl ml-1 italic text-gray-400">F</span></span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-8 pt-0 flex flex-col gap-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" 
             className="w-full bg-[#25D366] text-white py-6 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <MessageCircle size={22} fill="currentColor" />
            Confirmer sur WhatsApp
          </a>
          
          <Link to="/" className="w-full py-4 text-gray-400 font-black text-[10px] uppercase text-center hover:text-rose-500 transition-colors tracking-widest">
            Continuer mes achats
          </Link>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">FestiSolde Marketplace</p>
    </div>
  )
}