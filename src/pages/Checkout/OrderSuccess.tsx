import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, MessageCircle, ShoppingBag, ExternalLink, Sparkles } from 'lucide-react'
import { useEffect } from 'react'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  
  // Redirection si accès direct sans commande
  useEffect(() => {
    if (!state) {
      navigate('/')
    }
    window.scrollTo(0, 0)
  }, [state, navigate])

  // --- CONFIGURATION MISE À JOUR ---
  const VENDOR_WHATSAPP = "22670000000" // Ton numéro Burkina
  const TOTAL = state?.total?.toLocaleString() || "0"
  
  // On récupère la méthode (FedaPay par défaut maintenant)
  const METHOD = state?.method || "FedaPay (Mobile Money)"
  
  // On récupère l'ID de commande Supabase
  const ORDER_ID = state?.orderId?.toString().slice(0, 8).toUpperCase() || "COMMANDE"

  // Message WhatsApp mis à jour : plus besoin de demander la capture de force, 
  // on dit juste qu'on a payé via FedaPay.
  const message = `Bonjour FestiSolde ! 👋\n\nJe viens de finaliser ma commande sur le site.\n\n📝 Détails :\n- Référence : #${ORDER_ID}\n- Montant : ${TOTAL} F\n- Statut : Payé via FedaPay\n\nMerci de me confirmer la prise en charge pour la livraison !`
  const whatsappUrl = `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(message)}`

  return (
    <div className="min-h-screen bg-white py-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Décoration de fond */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-50 rounded-full blur-[100px] opacity-50" />

      {/* Icône de succès animée */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-emerald-100 rounded-[2.5rem] scale-[1.8] animate-pulse opacity-40" />
        <div className="relative w-28 h-28 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 -rotate-6 animate-in zoom-in duration-500">
          <CheckCircle2 size={56} strokeWidth={2.5} />
        </div>
        <div className="absolute -top-2 -right-2 bg-white p-2 rounded-xl shadow-lg animate-bounce">
          <Sparkles size={20} className="text-amber-400" />
        </div>
      </div>
      
      <div className="text-center max-w-sm mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter italic">
          Succès !
        </h1>
        <p className="text-gray-500 text-sm font-bold leading-relaxed px-4">
          Votre commande <span className="text-gray-900 font-black">#{ORDER_ID}</span> a été reçue. Notre équipe prépare déjà vos articles !
        </p>
      </div>

      {/* Carte Ticket */}
      <div className="w-full max-w-sm bg-white rounded-[3rem] border border-gray-100 p-8 mb-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group">
        <div className="relative z-10 text-center">
          <div className="inline-block bg-emerald-50 px-4 py-1.5 rounded-full mb-4 border border-emerald-100">
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Paiement Confirmé</p>
          </div>
          
          <div className="flex flex-col items-center mb-10">
            <p className="text-6xl font-black text-gray-900 tracking-tighter">
              {TOTAL} <span className="text-xl font-bold text-gray-400">F</span>
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
               Transaction via {METHOD}
            </p>
          </div>
          
          <div className="space-y-4">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#1eb957] active:scale-95 transition-all shadow-xl shadow-green-200"
            >
              <MessageCircle size={22} fill="currentColor" />
              Suivre sur WhatsApp
            </a>
            
            <Link 
              to="/" 
              className="w-full bg-white text-gray-400 py-5 rounded-[1.8rem] border border-gray-100 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              <ShoppingBag size={16} />
              Continuer le shopping
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-10 -left-10 opacity-[0.03] text-gray-900 rotate-12">
            <ExternalLink size={200} />
        </div>
      </div>

      {/* Statut de livraison */}
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm">
           <div className="relative flex">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
           </div>
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
             Commande en cours de traitement
           </span>
        </div>
        
        <p className="text-[10px] text-gray-400 font-bold max-w-[240px] text-center uppercase leading-relaxed tracking-tighter">
          Vous recevrez un appel de notre service logistique pour confirmer l'heure de livraison.
        </p>
      </div>
    </div>
  )
}