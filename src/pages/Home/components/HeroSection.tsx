import { ArrowRight, Sparkles, ShoppingBag, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative bg-[#0F1115] text-white overflow-hidden min-h-[90vh] flex items-center border-b border-white/5">
      {/* 1. BACKGROUND DÉCORATIF (Grille et Glows comme sur l'image) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Effet de grille en arrière-plan */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Glows colorés */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#FF5A5A]/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* CÔTÉ GAUCHE : TEXTE */}
          <div className="text-left">
            {/* Badge Soldes Flash (Inspiré de festi1.PNG) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5A5A]/10 border border-[#FF5A5A]/20 mb-8"
            >
              <Zap size={16} className="text-[#FF5A5A]" fill="#FF5A5A" />
              <span className="text-xs font-black tracking-widest uppercase text-[#FF5A5A]">
                Soldes Flash - Jusqu'à -70%
              </span>
            </motion.div>

            {/* Titre Principal (Style festi1.PNG) */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95]"
            >
              Les <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5A] to-[#FF8A5A] relative">
                meilleures
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
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
              className="mt-10 max-w-lg text-lg text-gray-400 font-medium leading-relaxed"
            >
              Découvrez des réductions exceptionnelles sur une sélection exclusive de produits. Qualité premium, prix imbattables.
            </motion.p>

            {/* Boutons d'action (Style Corail) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                to="/products"
                className="group w-full sm:w-auto px-10 py-5 bg-[#FF5A5A] hover:bg-[#ff4444] text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(255,90,90,0.3)] active:scale-95"
              >
                Découvrir l'offre
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/products"
                className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 rounded-2xl font-black flex items-center justify-center transition-all hover:bg-gray-100 active:scale-95"
              >
                Voir la boutique
              </Link>
            </motion.div>

            {/* Stats (Inspiré de festi2.PNG) */}
            <div className="mt-16 flex items-center gap-12 border-t border-white/5 pt-10">
              <div>
                <div className="text-3xl font-black">70%</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Réduction max</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-black">500+</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Articles soldés</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-black">24h</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Livraison express</div>
              </div>
            </div>
          </div>

          {/* CÔTÉ DROIT : VISUEL PRODUIT (Style festi1.PNG) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* Badge flottant produit */}
            <div className="absolute -top-10 left-10 z-20 bg-[#1F2228] border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-black" size={24} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-tight">Écouteurs Pro</div>
                <div className="text-[10px] text-[#FF5A5A] font-bold tracking-widest">-50% OFF</div>
              </div>
            </div>

            {/* Image Produit avec dégradé de fond */}
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000" 
                alt="Montre connectée" 
                className="w-full h-auto object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent opacity-60" />
              
              {/* Infos produit flottantes en bas */}
              <div className="absolute bottom-8 left-8">
                <p className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-widest">Montre connectée Elite</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-[#FF5A5A]">199 €</span>
                  <span className="text-xl text-gray-500 line-through font-bold">399 €</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}