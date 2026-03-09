import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
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

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Halo lumineux Corail (Utilise ta couleur brand.primary) */}
        <div className="absolute inset-0 bg-[#FF5A5A] rounded-full blur-[60px] opacity-10 animate-pulse"></div>

        {/* LOGO : S'il est dans public/logo.png, le chemin est "/logo.png" */}
        <div className="relative animate-bounce-slow">
           <img 
             src="/logo-festisolde.png" // <--- REMPLACE PAR LE NOM EXACT DE TON FICHIER DANS PUBLIC
             alt="Festisolde Logo" 
             className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_20px_rgba(255,90,90,0.4)]"
           />
        </div>

        {/* Barre de chargement Corail */}
        <div className="mt-12 w-40 h-[1.5px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#FF5A5A] animate-loading-bar"></div>
        </div>

        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.5em] text-white/30 italic">
          Festisolde
        </p>
      </div>
    </div>
  );
}