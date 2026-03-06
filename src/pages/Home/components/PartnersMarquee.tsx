import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface StorePartner {
  name: string;
  logo_url: string | null;
}

export default function PartnersMarquee() {
  const [stores, setStores] = useState<StorePartner[]>([]);
  const [loading, setLoading] = useState(true);

  // Palette de couleurs vives pour un look dynamique immédiat
  const colors = ['text-orange-600', 'text-blue-600', 'text-purple-600', 'text-emerald-600', 'text-pink-600', 'text-indigo-600'];

  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('name, logo_url')
          .order('created_at', { ascending: false })
          .limit(15);

        if (error) throw error;
        if (data && data.length > 0) setStores(data);
      } catch (err) {
        console.error("Erreur Marquee:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const displayList = stores.length > 0 ? stores : [
    { name: "FESTISOLDE", logo_url: null },
    { name: "STUDIO V2", logo_url: null },
    { name: "PRO", logo_url: null }
  ];

  if (loading) return <div className="h-24 bg-white" />;

  return (
    <section className="py-12 bg-white overflow-hidden border-y border-gray-100 group/marquee">
      {/* Label - Style Minimaliste Noir */}
      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center gap-4">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black italic">
          Notre reseau de <span className="text-orange-600">Partenaires</span>
        </span>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>

      <div className="relative flex items-center overflow-hidden">
        {/* Gradients de fondu sur les bords */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div className="flex animate-marquee-fast md:animate-marquee whitespace-nowrap gap-10 md:gap-20 items-center hover:[animation-play-state:paused]">
          {[...displayList, ...displayList, ...displayList, ...displayList].map((store, index) => {
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={index} className="flex items-center gap-4 cursor-default">
                
                {/* LOGO ou INITIALE - Affiché directement en couleur */}
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform duration-500 hover:scale-110">
                  {store.logo_url ? (
                    <img 
                      src={store.logo_url} 
                      alt={store.name} 
                      className="w-full h-full object-contain" // Plus de grayscale
                    />
                  ) : (
                    <div className={`w-full h-full rounded-lg bg-gray-50 flex items-center justify-center font-black ${colorClass} text-sm border-2 border-current shadow-sm`}>
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* NOM DE LA BOUTIQUE - Affiché en NOIR PUR directement */}
                <span className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-black">
                  {store.name}
                </span>

                {/* Point séparateur coloré - Plus visible */}
                <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')} mx-2 md:mx-4 shadow-sm`}></div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-fast {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
}