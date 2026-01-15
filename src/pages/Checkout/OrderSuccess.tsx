import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, MessageCircle, ShoppingBag, ExternalLink } from 'lucide-react'
import { useEffect } from 'react'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  
  // Redirection si accès direct sans commande
  useEffect(() => {
    if (!state) {
      navigate('/')
    }
    // On remonte en haut de page pour le succès
    window.scrollTo(0, 0)
  }, [state, navigate])

  // Configuration (Remplacez par votre vrai numéro Burkina)
  const VENDOR_WHATSAPP = "22670000000" 
  const TOTAL = state?.total?.toLocaleString() || "0"
  const METHOD = state?.method || "Mobile Money"
  const ORDER_ID = state?.orderId?.toString().slice(0, 8).toUpperCase() || "COMMANDE"

  // Message WhatsApp pré-rempli
  const message = `Bonjour FestiSolde ! 👋\n\nJe viens de valider ma commande.\n\n📝 Détails :\n- Référence : #${ORDER_ID}\n- Montant : ${TOTAL} F\n- Mode : ${METHOD}\n\nJe vous envoie la capture d'écran du paiement juste ici :`
  const whatsappUrl = `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(message)}`

  return (
    <div className="min-h-[90vh] bg-white py-12 px-6 flex flex-col items-center justify-center">
      
      {/* Animation de l'icône de succès */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-emerald-100 rounded-[2.5rem] scale-[1.8] animate-pulse opacity-40" />
        <div className="relative w-24 h-24 bg-emerald-500 text-white rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-3">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="text-center max-w-sm mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
          Commande reçue !
        </h1>
        <p className="text-gray-500 text-sm font-bold leading-relaxed px-4">
          Votre commande <span className="text-gray-900">#{ORDER_ID}</span> est bien enregistrée. Envoyez-nous la preuve pour une livraison immédiate.
        </p>
      </div>

      {/* Carte de Résumé stylisée */}
      <div className="w-full max-w-sm bg-white rounded-[3rem] border-2 border-gray-50 p-8 mb-10 shadow-2xl shadow-gray-100 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Montant payé</p>
          <p className="text-5xl font-black text-gray-900 mb-8 tracking-tighter">{TOTAL} <span className="text-lg">F</span></p>
          
          <div className="space-y-4">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-5 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-green-100"
            >
              <MessageCircle size={22} fill="currentColor" />
              Confirmer sur WhatsApp
            </a>
            
            <Link 
              to="/" 
              className="w-full bg-gray-50 text-gray-400 py-4 rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
            >
              <ShoppingBag size={18} />
              Continuer mes achats
            </Link>
          </div>
        </div>

        {/* Décoration de fond */}
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-gray-900">
           <ExternalLink size={120} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Support en ligne actif</span>
        </div>
        <p className="text-[11px] text-gray-400 font-bold max-w-[200px] text-center uppercase leading-tight">
          Une équipe vérifie votre paiement en moins de 10 min
        </p>
      </div>
    </div>
  )
}