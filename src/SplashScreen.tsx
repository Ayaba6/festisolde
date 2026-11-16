import { useEffect, useState } from 'react';

// Écran de démarrage : uniquement à l'ouverture de l'application installée (PWA),
// une fois par session et brièvement. Dans le navigateur, le site s'affiche tout de suite.
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
    const fade = setTimeout(() => setVisible(false), 900);
    const remove = setTimeout(() => setRender(false), 1300);
    return () => { clearTimeout(fade); clearTimeout(remove); };
  }, [render]);

  if (!render) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-400 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-hidden="true"
    >
      <img src="/logo-festisolde.png" alt="" className="h-16 w-auto md:h-20" />
      {isVendor && <span className="mt-4 rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-white">Espace vendeur</span>}
      <div className="relative mt-10 h-1 w-32 overflow-hidden rounded-full bg-stone-100">
        <div className="absolute inset-y-0 left-0 w-1/2 animate-[splash_1s_ease-in-out_infinite] rounded-full bg-orange-600" />
      </div>
      <style>{'@keyframes splash{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}'}</style>
    </div>
  );
}
