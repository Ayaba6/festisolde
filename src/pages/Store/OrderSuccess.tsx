import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // On récupère storeSlug depuis l'état envoyé par le panier
  const { customerName, whatsappUrl, storeSlug } = location.state || {};

  useEffect(() => {
    if (!whatsappUrl) {
      const timer = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timer);
    }
  }, [whatsappUrl, navigate]);

  if (!whatsappUrl) return null;

  // Déterminer le lien de retour (soit la boutique spécifique, soit l'accueil)
  const returnPath = storeSlug ? `/boutique/${storeSlug}` : '/';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 antialiased">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-green-100 rounded-[3rem] animate-ping opacity-20"></div>
        <div className="relative w-32 h-32 bg-green-50 rounded-[3.5rem] flex items-center justify-center text-green-500 shadow-2xl shadow-green-100 border-4 border-white">
          <CheckCircle2 size={64} strokeWidth={1.5} />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white animate-bounce shadow-lg">
          <Sparkles size={20} />
        </div>
      </div>

      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.85] text-gray-900">
          C'est <span className="text-orange-600">Validé</span> !
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 leading-relaxed">
          Merci <span className="text-black">{customerName}</span>, ta commande a été enregistrée.
        </p>
      </div>

      <div className="mt-14 w-full max-w-[340px] space-y-4">
        {/* BOUTON WHATSAPP */}
        <a 
          href={whatsappUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-6 bg-[#25D366] text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-2xl shadow-green-200 hover:scale-105 transition-all active:scale-95 group"
        >
          <MessageCircle size={20} fill="white" className="group-hover:rotate-12 transition-transform" /> 
          Finaliser sur WhatsApp
        </a>

        {/* BOUTON RETOUR BOUTIQUE DYNAMIQUE */}
        <button 
          onClick={() => navigate(returnPath)}
          className="w-full py-6 border-2 border-gray-900 text-gray-900 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all active:scale-95"
        >
          Retourner au shop <ArrowRight size={18} />
        </button>
      </div>

      <p className="mt-8 text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
        L'aventure continue sur Festisolde
      </p>
    </div>
  );
}