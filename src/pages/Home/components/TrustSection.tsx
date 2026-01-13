import { ShieldCheck, Zap, ShoppingBag, Star, CheckCircle } from 'lucide-react'

const TRUST_POINTS = [
  {
    title: "Transactions Sécurisées",
    description: "Protection totale de vos données. Paiements mobiles via Orange/Moov avec double authentification.",
    icon: <ShieldCheck size={32} />,
    colorClass: "bg-indigo-50 text-indigo-600",
    badge: "Cryptage SSL"
  },
  {
    title: "Vérification Garantie",
    description: "Chaque produit listé passe par un contrôle de qualité pour éviter les contrefaçons.",
    icon: <CheckCircle size={32} />,
    colorClass: "bg-blue-50 text-blue-600",
    badge: "Certifié Festi"
  },
  {
    title: "Support Réactif",
    description: "Une équipe locale basée à Ouagadougou disponible pour vous aider en cas de besoin.",
    icon: <ShoppingBag size={32} />,
    colorClass: "bg-emerald-50 text-emerald-600",
    badge: "Support 7j/7"
  }
]

export default function TrustSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="bg-gray-50 rounded-[3rem] p-10 md:p-20 border border-gray-100 shadow-inner relative overflow-hidden">
        
        {/* Header de confiance */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span className="text-sm font-bold text-gray-700">99% de satisfaction client</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
            Votre sérénité, <br />
            <span className="text-indigo-600">notre priorité absolue.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            FestiSolde n'est pas qu'une plateforme de vente, c'est un engagement de qualité et de sécurité pour chaque Burkinabè.
          </p>
        </div>

        {/* Grille des garanties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {TRUST_POINTS.map((point, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-6 ${point.colorClass} transition-transform group-hover:scale-110`}>
                {point.icon}
              </div>
              
              <div className="inline-block px-3 py-1 rounded-md bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border border-gray-100">
                {point.badge}
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-3 tracking-tight">
                {point.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Elément décoratif subtil */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.03),transparent)] pointer-events-none" />
      </div>
    </section>
  )
}