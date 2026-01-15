import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrustSection() {
  const features = [
    {
      icon: <Truck className="w-6 h-6 lg:w-8 lg:h-8 text-[#00AEEF]" />,
      title: "Livraison Express",
      desc: "Ouagadougou & Bobo en 24h",
      bgColor: "bg-[#00AEEF]/10"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 lg:w-8 lg:h-8 text-[#00D084]" />,
      title: "Paiement Sûr",
      desc: "Orange & Moov Money",
      bgColor: "bg-[#00D084]/10"
    },
    {
      icon: <RotateCcw className="w-6 h-6 lg:w-8 lg:h-8 text-[#9B51E0]" />,
      title: "Retour Facile",
      desc: "7 jours pour changer d'avis",
      bgColor: "bg-[#9B51E0]/10"
    },
    {
      icon: <Headphones className="w-6 h-6 lg:w-8 lg:h-8 text-[#FF7A00]" />,
      title: "Support 24/7",
      desc: "Une équipe via WhatsApp",
      bgColor: "bg-[#FF7A00]/10"
    }
  ]

  return (
    <section className="bg-white py-12 lg:py-20 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* GRID ADAPTATIF : 2 colonnes sur mobile, 4 sur PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icône utilisant l'arrondi global 'rounded-brand' */}
              <div className={`w-14 h-14 lg:w-20 lg:h-20 ${feature.bgColor} rounded-brand flex items-center justify-center mb-4 lg:mb-6 transition-transform group-hover:scale-105 duration-300`}>
                {feature.icon}
              </div>
              
              {/* Titre : utilise la taille 'small' ou 'body' selon l'écran */}
              <h3 className="text-small lg:text-lg font-black text-gray-900 mb-1 lg:mb-2 leading-tight">
                {feature.title}
              </h3>
              
              {/* Description : Utilise la classe globale 'festi-desc' mais plus petite */}
              <p className="text-[10px] lg:text-sm font-bold text-gray-400 leading-tight lg:leading-relaxed max-w-[140px] lg:max-w-[200px]">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}