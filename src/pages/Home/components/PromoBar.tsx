import { ShieldCheck, Zap, ShoppingBag, Truck, Headphones } from 'lucide-react'

const BENEFITS = [
  {
    title: "Vendeurs certifiés",
    desc: "Chaque boutique est auditée par nos experts pour garantir l'origine et la qualité des produits.",
    icon: <ShieldCheck size={32} />,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  },
  {
    title: "Offres Flash",
    desc: "Des réductions exclusives négociées directement avec les meilleurs commerçants de Ouaga.",
    icon: <Zap size={32} />,
    bgColor: "bg-amber-50",
    textColor: "text-amber-600"
  },
  {
    title: "Paiement Sécurisé",
    desc: "Achetez en toute sérénité via Orange Money, Moov Money ou par carte bancaire.",
    icon: <ShoppingBag size={32} />,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  }
]

export default function BenefitsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-xl shadow-gray-200/50">
        
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">
            L'expérience shopping <br />
            <span className="text-indigo-600">sans compromis</span>
          </h2>
          <p className="text-gray-500 font-medium">
            FestiSolde combine la flexibilité du marché local avec les standards de sécurité internationaux.
          </p>
        </div>

        {/* Grille des avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {BENEFITS.map((benefit, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-100"
            >
              {/* Conteneur d'icône avec effet de rotation au survol */}
              <div className={`w-16 h-16 mb-6 flex items-center justify-center rounded-2xl ${benefit.bgColor} ${benefit.textColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                {benefit.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pied de section : Badges de service rapide */}
        <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
           <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Truck size={20} className="text-indigo-600" /> Livraison Express 24h/48h
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Headphones size={20} className="text-indigo-600" /> Support local à Ouagadougou
           </div>
        </div>
      </div>
    </section>
  )
}