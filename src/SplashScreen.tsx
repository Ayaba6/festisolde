import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    // Détection du sous-domaine
    const hostname = window.location.hostname;
    setIsVendor(hostname.startsWith('vendeur.'));

    // 1. On lance l'animation de sortie après 2.5s
    const fadeTimer = setTimeout(() => setIsVisible(false), 2500);
    // 2. On retire le composant du DOM après la fin de la transition (0.7s plus tard)
    const removeTimer = setTimeout(() => setShouldRender(false), 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  // Choix du logo et de la couleur selon le mode
  const logoSrc = isVendor ? "/studio-pwa-192x192.png" : "/logo-festisolde.png";
  const brandColor = isVendor ? "#F97316" : "#FF5A5A"; // Orange pour Studio, Corail pour Festisolde

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Halo lumineux dynamique */}
        <div 
          className="absolute inset-0 rounded-full blur-[60px] opacity-10 animate-pulse"
          style={{ backgroundColor: brandColor }}
        ></div>

        {/* LOGO DYNAMIQUE */}
        <div className="relative animate-bounce-slow">
           <img 
             src={logoSrc} 
             alt={isVendor ? "Festi Studio Logo" : "Festisolde Logo"} 
             className="w-32 h-32 md:w-40 md:h-40 object-contain"
             style={{ filter: `drop-shadow(0 0 20px ${brandColor}66)` }}
           />
        </div>

        {/* Barre de chargement dynamique */}
        <div className="mt-12 w-40 h-[1.5px] bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full animate-loading-bar"
            style={{ backgroundColor: brandColor }}
          ></div>
        </div>

        {/* Texte dynamique */}
        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.5em] text-white/30 italic">
          {isVendor ? "Festi Studio" : "Festisolde"}
        </p>
      </div>
    </div>
  );
}