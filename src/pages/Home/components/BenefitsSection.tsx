import { ShieldCheck, Zap, ShoppingBag, Truck, Headphones } from 'lucide-react'

const BENEFITS = [
  {
    title: "Vendeurs certifiés",
    desc: "Chaque boutique est auditée pour garantir l'origine et la qualité des produits.",
    icon: <ShieldCheck size={32} />,
    color: "indigo",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  },
  {
    title: "Offres Flash",
    desc: "Des réductions imbattables mises à jour quotidiennement sur vos marques préférées.",
    icon: <Zap size={32} />,
    color: "amber",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600"
  },
  {
    title: "Service Premium",
    desc: "Paiement sécurisé via Orange Money ou Moov et support client réactif 7j/7.",
    icon: <ShoppingBag size={32} />,
    color: "emerald",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  }
]

export default function BenefitsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
        
        {/* Décoration de fond subtile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">
            L'excellence du e-commerce <br />
            <span className="text-indigo-600">à portée de clic</span>
          </h2>
          <p className="text-gray-500 font-medium">
            FestiSolde redéfinit la vente en ligne au Burkina Faso avec des standards de qualité internationaux.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {BENEFITS.map((benefit, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200"
            >
              <div className={`w-20 h-20 mb-6 flex items-center justify-center rounded-2xl ${benefit.bgColor} ${benefit.textColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                {benefit.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                {benefit.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {benefit.desc}
              </p>

              {/* Petit indicateur de lien (optionnel) */}
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                En savoir plus 
                <span className="text-lg">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Barre de badges rapide en bas (facultatif) */}
        <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-60">
           <div className="flex items-center gap-2 text-sm font-semibold">
              <Truck size={18} /> Livraison 24h
           </div>
           <div className="flex items-center gap-2 text-sm font-semibold">
              <Headphones size={18} /> Support Ouaga
           </div>
        </div>
      </div>
    </section>
  )
}