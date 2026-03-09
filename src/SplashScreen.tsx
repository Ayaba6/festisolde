import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // On simule un temps de chargement (ex: 2.5 secondes)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative flex flex-col items-center">
        
        {/* L'effet de halo pulsant derrière le logo */}
        <div className="absolute inset-0 bg-orange-600 rounded-full blur-[60px] opacity-20 animate-pulse"></div>

        {/* Ton Logo (SVG ou Image) */}
        <div className="relative animate-bounce-slow">
           <img 
             src="/logo-festisolde.svg" 
             alt="Logo" 
             className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_25px_rgba(234,88,12,0.5)]"
           />
        </div>

        {/* Barre de progression minimaliste */}
        <div className="mt-8 w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-600 animate-loading-bar"></div>
        </div>

        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">
          Festisolde
        </p>
      </div>
    </div>
  );
}