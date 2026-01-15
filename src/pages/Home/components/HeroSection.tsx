import { ArrowRight, ShoppingBag, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative bg-[#0F1115] text-white overflow-hidden min-h-[100vh] lg:min-h-[90vh] flex items-center border-b border-white/5">
      {/* 1. BACKGROUND DÉCORATIF */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px] lg:bg-[size:40px_40px]" />
        {/* Glows plus petits sur mobile pour éviter les lags */}
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[#FF5A5A]/10 rounded-full blur-[80px] lg:blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* CÔTÉ GAUCHE : TEXTE */}
          <div className="text-center lg:text-left pt-10 lg:pt-0">
            {/* Badge - Plus compact sur mobile */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl bg-[#FF5A5A]/10 border border-[#FF5A5A]/20 mb-6 lg:mb-8"
            >
              <Zap size={14} className="text-[#FF5A5A]" fill="#FF5A5A" />
              <span className="text-[10px] lg:text-xs font-black tracking-widest uppercase text-[#FF5A5A]">
                Soldes Flash - Jusqu'à -70%
              </span>
            </motion.div>

            {/* Titre : TAILLE ADAPTATIVE (text-5xl -> text-8xl) */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] lg:leading-[0.95]"
            >
              Les <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5A] to-[#FF8A5A] relative inline-block">
                meilleures
                <svg className="absolute -bottom-1 lg:-bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M1 10C60 2 240 2 299 10" stroke="#FF5A5A" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span> <br />
              offres du <br />
              moment
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 lg:mt-10 max-w-lg mx-auto lg:mx-0 text-base lg:text-lg text-gray-400 font-medium leading-relaxed"
            >
              Découvrez des réductions exceptionnelles sur une sélection exclusive. Qualité premium, prix imbattables.
            </motion.p>

            {/* Boutons - Stack vertical sur mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                to="/products"
                className="group w-full sm:w-auto px-8 py-4 lg:px-10 lg:py-5 bg-[#FF5A5A] text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(255,90,90,0.3)] active:scale-95"
              >
                Profiter de l'offre
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-4 lg:px-10 lg:py-5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-black flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
              >
                Boutique
              </Link>
            </motion.div>

            {/* Stats - Grid 3 colonnes sur mobile */}
            <div className="mt-12 lg:mt-16 grid grid-cols-3 gap-4 lg:flex lg:items-center lg:gap-12 border-t border-white/5 pt-8 lg:pt-10">
              <div className="text-center lg:text-left">
                <div className="text-xl lg:text-3xl font-black text-[#FF5A5A]">70%</div>
                <div className="text-[8px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Réduction</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl lg:text-3xl font-black">500+</div>
                <div className="text-[8px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Produits</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl lg:text-3xl font-black">24h</div>
                <div className="text-[8px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Livraison</div>
              </div>
            </div>
          </div>

          {/* CÔTÉ DROIT : VISUEL PRODUIT - Masqué sur petit mobile, visible dès 'lg' */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* Badge flottant */}
            <div className="absolute -top-10 left-10 z-20 bg-[#1F2228] border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-slow">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                <ShoppingBag className="text-black" size={24} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-tight">Écouteurs Pro</div>
                <div className="text-[10px] text-[#FF5A5A] font-bold tracking-widest">-50% OFF</div>
              </div>
            </div>

            {/* Image avec cadre arrondi moderne */}
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl transform rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000" 
                alt="Produit" 
                className="w-full h-auto object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Smartwatch Elite</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white">19.900 F</span>
                    <span className="text-sm text-gray-500 line-through font-bold">35.000 F</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}