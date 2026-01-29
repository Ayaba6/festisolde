import { Zap, Phone, Truck, ShieldCheck } from 'lucide-react'

export default function PromoBanner() {
  const announcements = [
    { text: "Livraison gratuite sur Ouaga > 50.000 FCFA", icon: <Truck size={14} /> },
    { text: "Support Client 24/7 : +226 70 18 99 12", icon: <Phone size={14} /> },
    { text: "Paiement sécurisé à la livraison", icon: <ShieldCheck size={14} /> },
    { text: "Déstockage massif : jusqu'à -70%", icon: <Zap size={14} className="fill-brand-primary" /> },
  ]

  return (
    <div className="bg-brand-dark text-white py-2 overflow-hidden border-b border-white/5 relative flex items-center">
      {/* Conteneur de l'animation */}
      <div className="flex whitespace-nowrap animate-marquee">
        {/* On répète la liste deux fois pour un défilement infini sans coupure */}
        {[...announcements, ...announcements].map((item, index) => (
          <div key={index} className="flex items-center mx-10 gap-3">
            <span className="text-brand-primary">{item.icon}</span>
            <span className="text-[10px] lg:text-xs font-black tracking-[0.15em] uppercase">
              {item.text}
            </span>
            {/* Petit séparateur entre les messages */}
            <span className="ml-10 opacity-20 text-brand-primary">•</span>
          </div>
        ))}
      </div>

      {/* Ajout du CSS d'animation directement dans le composant */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}