import { useLocation, Link } from 'react-router-dom'
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react'

export default function OrderSuccess() {
  const { state } = useLocation()
  
  // Configuration du vendeur (À dynamiser plus tard avec la DB)
  const VENDOR_WHATSAPP = "22670000000" // Format international sans le +
  const TOTAL = state?.total?.toLocaleString() || "0"
  const METHOD = state?.method || "Mobile Money"
  
  // Message pré-rempli pour le client
  const message = `Bonjour, je viens de passer une commande de ${TOTAL} F par ${METHOD}. Voici ma preuve de paiement. (Commande #${state?.orderId?.slice(0, 8)})`
  const whatsappUrl = `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(message)}`

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 size={48} />
      </div>
      
      <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Commande Reçue !</h1>
      <p className="text-gray-500 font-medium mb-10 px-4">
        Votre commande a été enregistrée. Pour qu'elle soit préparée, veuillez confirmer votre paiement.
      </p>

      {/* Instructions de paiement */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant à transférer</p>
        <p className="text-4xl font-black text-indigo-600 mb-6">{TOTAL} F</p>
        
        <div className="space-y-3">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#20ba5a] transition-all shadow-lg shadow-green-100"
          >
            <MessageCircle size={22} />
            Envoyer la preuve (WhatsApp)
          </a>
          
          <Link 
            to="/" 
            className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400 font-bold px-8 leading-relaxed">
        Une fois le message WhatsApp envoyé, notre équipe validera votre commande dans les plus brefs délais.
      </p>
    </div>
  )
}