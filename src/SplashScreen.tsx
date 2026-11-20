import { useEffect, useState } from 'react';

// Écran de démarrage : uniquement à l'ouverture de l'application installée (PWA),
// une fois par session et brièvement. Dans le navigateur, le site s'affiche tout de suite.
// Ses couleurs reprennent celles du manifeste (background_color) : le passage entre
// l'écran du téléphone et celui de l'application se fait sans flash.
const shouldShow = () => {
  try {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    if (!standalone || sessionStorage.getItem('festi_splash')) return false;
    sessionStorage.setItem('festi_splash', '1');
    return true;
  } catch {
    return false;
  }
};

export default function SplashScreen() {
  const [render, setRender] = useState(shouldShow);
  const [visible, setVisible] = useState(true);
  const isVendor = window.location.hostname.startsWith('vendeur.');

  useEffect(() => {
    if (!render) return;
    const fade = setTimeout(() => setVisible(false), 1100);
    const remove = setTimeout(() => setRender(false), 1600);
    return () => { clearTimeout(fade); clearTimeout(remove); };
  }, [render]);

  if (!render) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVendor ? 'bg-white' : 'bg-[#e02424]'
      } ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes festi-pop { 0% { opacity: 0; transform: scale(.92) } 100% { opacity: 1; transform: scale(1) } }
        @keyframes festi-bar { 0% { transform: translateX(-100%) } 100% { transform: translateX(250%) } }
      `}</style>

      <div className="flex flex-1 flex-col items-center justify-center" style={{ animation: 'festi-pop .5s cubic-bezier(.2,.8,.2,1) both' }}>
        {isVendor ? (
          <>
            <img src="/studio-pwa-192x192.png" alt="" className="h-24 w-24 rounded-[28px] shadow-xl" />
            <p className="mt-5 text-xl font-extrabold tracking-tight text-ink">FestiSolde Studio</p>
            <p className="mt-1 text-sm font-semibold text-ink-muted">Espace vendeur</p>
          </>
        ) : (
          <img src="/logo-blanc.png" alt="" className="w-64 max-w-[70vw]" />
        )}
      </div>

      <div className="mb-14 flex flex-col items-center gap-3">
        <div className={`relative h-1 w-24 overflow-hidden rounded-full ${isVendor ? 'bg-stone-200' : 'bg-white/25'}`}>
          <div
            className={`absolute inset-y-0 left-0 w-2/5 rounded-full ${isVendor ? 'bg-orange-600' : 'bg-white'}`}
            style={{ animation: 'festi-bar 1s ease-in-out infinite' }}
          />
        </div>
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isVendor ? 'text-stone-400' : 'text-white/80'}`}>
          Burkina Faso
        </p>
      </div>
    </div>
  );
}
