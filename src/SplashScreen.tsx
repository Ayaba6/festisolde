import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    // Détection automatique du contexte (Vendeur vs Client)
    const hostname = window.location.hostname;
    const isVendeurMode = hostname.startsWith('vendeur.') || hostname.includes('vendeur');
    setIsVendor(isVendeurMode);

    // Chronologie de l'animation
    // 2s de présence + 0.8s de fondu de sortie
    const fadeTimer = setTimeout(() => setIsVisible(false), 2000);
    const removeTimer = setTimeout(() => setShouldRender(false), 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  // Configuration visuelle dynamique
  const logoSrc = isVendor ? "/pwa-192x192.png" : "/logo-festisolde.png";
  const brandColor = isVendor ? "#F97316" : "#0F172A"; // Orange pour Studio, Noir/Ardoise pour Festisolde

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#FAFAFA] transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
      }`}
    >
      {/* Animations CSS injectées pour une exécution instantanée */}
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes reveal-logo {
          from { opacity: 0; transform: translateY(10px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-loading-bar { 
          animation: loading-slide 2.5s cubic-bezier(0.85, 0, 0.15, 1) infinite; 
        }
        .animate-reveal { 
          animation: reveal-logo 0.8s ease-out forwards; 
        }
      `}</style>

      <div className="relative flex flex-col items-center">
        
        {/* Halo de marque en arrière-plan */}
        <div 
          className="absolute inset-0 w-72 h-72 -translate-x-1/4 -translate-y-1/4 rounded-full blur-[100px] opacity-[0.06] animate-pulse"
          style={{ backgroundColor: brandColor }}
        ></div>

        {/* LOGO */}
        <div className="relative animate-reveal">
           <img 
             src={logoSrc} 
             alt="Logo Festisolde" 
             className="w-28 h-28 md:w-36 md:h-36 object-contain"
             onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=FESTISOLDE"; }}
           />
        </div>

        {/* Barre de progression épurée */}
        <div className="mt-14 w-44 h-[2px] bg-slate-100 rounded-full overflow-hidden relative">
          <div 
            className="absolute inset-0 animate-loading-bar"
            style={{ backgroundColor: brandColor }}
          ></div>
        </div>

        {/* Texte contextuel */}
        <div className="mt-8 flex flex-col items-center gap-1.5 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-900 italic">
            {isVendor ? "Studio Pro" : "Festisolde"}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-3 bg-slate-200"></span>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {isVendor ? "Gestionnaire Vendeur" : "Le meilleur du solde"}
            </span>
            <span className="h-[1px] w-3 bg-slate-200"></span>
          </div>
        </div>
      </div>
    </div>
  );
}