import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrustSection() {
  const features = [
    {
      icon: <Truck size={32} className="text-[#00AEEF]" />, // Bleu clair
      title: "Livraison gratuite",
      desc: "Dès 50€ d'achat en France",
      bgColor: "bg-[#00AEEF]/10"
    },
    {
      icon: <ShieldCheck size={32} className="text-[#00D084]" />, // Vert
      title: "Paiement sécurisé",
      desc: "Transactions 100% protégées",
      bgColor: "bg-[#00D084]/10"
    },
    {
      icon: <RotateCcw size={32} className="text-[#9B51E0]" />, // Violet
      title: "Retour facile",
      desc: "30 jours pour changer d'avis",
      bgColor: "bg-[#9B51E0]/10"
    },
    {
      icon: <Headphones size={32} className="text-[#FF7A00]" />, // Orange
      title: "Support 24/7",
      desc: "Une équipe à votre écoute",
      bgColor: "bg-[#FF7A00]/10"
    }
  ]

  return (
    <section className="bg-white py-20 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icône avec fond coloré doux */}
              <div className={`w-20 h-20 ${feature.bgColor} rounded-[2rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                {feature.icon}
              </div>
              
              {/* Textes */}
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm font-bold text-gray-400 leading-relaxed max-w-[200px]">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}