import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative bg-brand-dark text-white overflow-hidden min-h-[85vh] flex items-center border-b border-white/5">
      {/* BACKGROUND DÉCORATIF */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute top-1/4 left-0 w-[250px] h-[250px] bg-brand-primary/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          
          {/* CÔTÉ GAUCHE : TEXTE */}
          <div className="text-center lg:text-left">
            {/* Badge Flash */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 mb-6"
            >
              <Zap size={14} className="text-brand-primary" fill="currentColor" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-primary">
                Soldes Flash - Jusqu'à -70%
              </span>
            </motion.div>

            {/* Titre : Utilise la classe globale 'festi-title' */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="festi-title"
            >
              Les <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">meilleures</span> <br />
              offres du moment
            </motion.h1>

            {/* Description : Utilise la classe globale 'festi-desc' */}
            <motion.p className="festi-desc mt-6 max-w-md mx-auto lg:mx-0">
              Découvrez des réductions exceptionnelles sur une sélection exclusive. Qualité premium, prix imbattables.
            </motion.p>

            {/* Boutons : Utilise les classes globales 'btn-festi' et 'btn-outline' */}
            <motion.div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/products" className="btn-festi w-full sm:w-auto">
                Profiter de l'offre
                <ArrowRight size={18} />
              </Link>
              
              <Link to="/products" className="btn-outline w-full sm:w-auto">
                Boutique
              </Link>
            </motion.div>

            {/* Stats : Couleurs centralisées */}
            <div className="mt-12 grid grid-cols-3 gap-2 lg:flex lg:gap-10 border-t border-white/5 pt-8">
              <div>
                <div className="text-xl lg:text-2xl font-black text-brand-primary">70%</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Réduction</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-black">500+</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Articles</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-black">24h</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Livraison</div>
              </div>
            </div>
          </div>

          {/* VISUEL DROITE */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-brand overflow-hidden border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000" 
                className="w-full h-[500px] object-cover" 
                alt="Produit vedette" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent opacity-60" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}