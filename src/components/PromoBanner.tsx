import { Zap } from 'lucide-react'

export default function PromoBanner() {
  return (
    <div className="bg-brand-dark text-white py-2.5 px-4 overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-center items-center gap-4 text-[10px] lg:text-xs font-black tracking-[0.15em] uppercase">
        <div className="flex items-center gap-2">
          {/* Icône animée pour attirer l'attention discrètement */}
          <Zap size={14} className="text-brand-primary fill-brand-primary animate-pulse" />
          
          <span className="flex gap-1">
            Livraison gratuite sur toutes les commandes 
            <span className="text-brand-primary font-black ml-1">
              {">"} 50.000 FCFA
            </span>
          </span>
        </div>
        
        {/* Séparateur visible uniquement sur desktop */}
        <span className="hidden md:block opacity-30">|</span>
        
        <span className="hidden md:block">
          Support Client 24/7 : <span className="text-brand-primary">+226 70 18 99 12</span>
        </span>
      </div>
    </div>
  )
}