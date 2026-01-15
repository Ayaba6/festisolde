import { ShieldCheck, Zap, ShoppingBag, Truck, Headphones } from 'lucide-react'

const BENEFITS = [
  {
    title: "Vendeurs certifiés",
    desc: "Chaque boutique est auditée par nos experts pour garantir l'origine et la qualité des produits.",
    icon: <ShieldCheck size={28} />,
    bgColor: "bg-slate-50",
    textColor: "text-brand-dark"
  },
  {
    title: "Offres Flash",
    desc: "Des réductions exclusives négociées directement avec les meilleurs commerçants de Ouaga.",
    icon: <Zap size={28} />,
    bgColor: "bg-brand-primary/10",
    textColor: "text-brand-primary"
  },
  {
    title: "Paiement Sécurisé",
    desc: "Achetez en toute sérénité via Orange Money, Moov Money ou par carte bancaire.",
    icon: <ShoppingBag size={28} />,
    bgColor: "bg-slate-50",
    textColor: "text-brand-dark"
  }
]

export default function PromoBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-20">
      <div className="bg-white rounded-2xl lg:rounded-[3rem] p-8 lg:p-16 border border-slate-100 shadow-sm">
        
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-20">
          <h2 className="text-festi-h1 mb-4">
            L'expérience shopping <br />
            <span className="text-brand-primary italic">sans compromis</span>
          </h2>
          <p className="text-p">
            FestiSolde combine la flexibilité du marché local avec les standards de sécurité internationaux.
          </p>
        </div>

        {/* Grille des avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BENEFITS.map((benefit, index) => (
            <div 
              key={index} 
              className="group p-6 lg:p-8 rounded-2xl transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100"
            >
              <div className={`w-14 h-14 mb-6 flex items-center justify-center rounded-xl ${benefit.bgColor} ${benefit.textColor} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                {benefit.icon}
              </div>
              
              <h3 className="text-lg font-bold text-brand-dark mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pied de section : Badges bas de page */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-slate-50 flex flex-wrap justify-center gap-6 lg:gap-12">
           <div className="flex items-center gap-2 text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">
              <Truck size={16} className="text-brand-primary" /> Livraison Express 24h/48h
           </div>
           <div className="flex items-center gap-2 text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">
              <Headphones size={16} className="text-brand-primary" /> Support local à Ouaga
           </div>
        </div>
      </div>
    </section>
  )
}