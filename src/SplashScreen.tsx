import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsVendor(hostname.startsWith('vendeur.'));

    // On réduit un peu le temps (2s c'est souvent le "sweet spot" pour ne pas agacer l'utilisateur)
    const fadeTimer = setTimeout(() => setIsVisible(false), 2000);
    const removeTimer = setTimeout(() => setShouldRender(false), 2700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  const logoSrc = isVendor ? "/studio-pwa-192x192.png" : "/logo-festisolde.png";
  // On utilise l'orange de la marque ou un gris ardoise élégant
  const brandColor = isVendor ? "#F97316" : "#0F172A"; 

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#FDFDFD] transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Halo lumineux très subtil (plus doux sur fond clair) */}
        <div 
          className="absolute inset-0 w-64 h-64 -translate-x-1/4 -translate-y-1/4 rounded-full blur-[80px] opacity-20 animate-pulse"
          style={{ backgroundColor: brandColor }}
        ></div>

        {/* LOGO avec une animation d'échelle douce plutôt qu'un bounce (plus premium) */}
        <div className="relative animate-subtle-zoom">
           <img 
             src={logoSrc} 
             alt="Logo" 
             className="w-24 h-24 md:w-32 md:h-32 object-contain"
           />
        </div>

        {/* Barre de chargement plus fine et élégante */}
        <div className="mt-10 w-32 h-[2px] bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full animate-loading-bar origin-left"
            style={{ backgroundColor: brandColor }}
          ></div>
        </div>

        {/* Texte en Slate-400 pour le minimalisme */}
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
          {isVendor ? "Studio Pro" : "Festisolde"}
        </p>
      </div>
    </div>
  );
}