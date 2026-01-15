import { ShieldCheck, Zap, ShoppingBag } from 'lucide-react'

const BENEFITS = [
  {
    title: "Vendeurs certifiés",
    desc: "Chaque boutique est auditée par nos experts pour garantir l'origine et la qualité de produits.",
    icon: <ShieldCheck size={48} strokeWidth={1.5} />,
    // Style bleu lavande de l'image
    cardBg: "bg-[#B8C6E8]", 
    textColor: "text-[#1A1C21]"
  },
  {
    title: "Offres Flash",
    desc: "Des réductions exclusives négociées directement avec le meilleurs commerçants de Ouaga.",
    icon: <Zap size={48} strokeWidth={1.5} />,
    // Style orange corail de l'image
    cardBg: "bg-[#F3834C]",
    textColor: "text-white"
  },
  {
    title: "Paiement Sécurisé",
    desc: "Achetez en toute sérénité via Orange Money, Moov Money ou par carte bancaire.",
    icon: <ShoppingBag size={48} strokeWidth={1.5} />,
    // Style beige crème de l'image
    cardBg: "bg-[#EFE9D9]",
    textColor: "text-[#1A1C21]"
  }
]

export default function BenefitsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
      {/* En-tête de section identique à l'image */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1C21] mb-4">
          Ils nous font confiance
        </h2>
        <p className="text-slate-500 font-medium text-base lg:text-lg">
          Plus de 50 000 clients satisfaits. Découvrez leurs avis.
        </p>
      </div>

      {/* Grille de cartes colorées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {BENEFITS.map((benefit, index) => (
          <div 
            key={index} 
            className={`${benefit.cardBg} rounded-[2rem] p-10 lg:p-12 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2 shadow-sm`}
          >
            {/* Icône entourée comme sur l'image */}
            <div className={`mb-8 p-4 rounded-full border-2 ${benefit.textColor === 'text-white' ? 'border-white/30' : 'border-black/10'}`}>
              <div className={benefit.textColor}>
                {benefit.icon}
              </div>
            </div>
            
            <h3 className={`text-2xl lg:text-3xl font-bold mb-6 ${benefit.textColor}`}>
              {benefit.title}
            </h3>
            
            <p className={`text-sm lg:text-base leading-relaxed font-medium opacity-90 ${benefit.textColor}`}>
              {benefit.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}