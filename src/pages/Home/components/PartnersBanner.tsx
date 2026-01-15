import { Store } from 'lucide-react'

const PARTNERS = [
  { name: 'Safi Mode', logo: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=100&h=100&fit=crop&q=80' },
  { name: 'ElectroPlus', logo: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop&q=80' },
  { name: 'Ouaga Market', logo: 'https://images.unsplash.com/photo-1534452286302-2f5630b40c9e?w=100&h=100&fit=crop&q=80' },
  { name: 'Boutique Zen', logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=100&h=100&fit=crop&q=80' },
  { name: 'Elite Tech', logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&q=80' },
  { name: 'Faso Shop', logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop&q=80' },
]

export default function PartnersBanner() {
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="py-20 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* EN-TÊTE DE SECTION CORRIGÉ (PLUS VISIBLE) */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-6 w-full max-w-4xl">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-gray-200"></div>
            
            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.5em] text-gray-900 text-center whitespace-nowrap">
              Ils nous font <span className="text-brand-primary">confiance</span>
            </h2>
            
            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-gray-200"></div>
          </div>
          <p className="mt-4 text-gray-500 text-xs font-medium tracking-wide">
            Rejoignez les meilleures enseignes de la capitale
          </p>
        </div>

        {/* ZONE DU CARROUSEL */}
        <div className="relative group">
          {/* Masques de dégradés sur les côtés */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused]">
            {duplicatedPartners.map((partner, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center px-10 md:px-16 group/item"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center p-5 shadow-sm border border-gray-100 transition-all duration-500 group-hover/item:shadow-xl group-hover/item:shadow-brand-primary/10 group-hover/item:bg-white group-hover/item:-translate-y-2">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                
                <span className="mt-5 text-[10px] font-black text-gray-800 uppercase tracking-widest transition-colors duration-300 group-hover/item:text-brand-primary">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-infinite-scroll {
          animation: scroll-left 25s linear infinite;
        }
      `}</style>
    </section>
  )
}