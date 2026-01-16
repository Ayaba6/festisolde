import { ArrowRight, Zap, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroSlider from './HeroSlider'

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className="relative bg-brand-dark text-white overflow-hidden min-h-screen lg:min-h-[90vh] flex items-center border-b border-white/5 pt-20 lg:pt-0">
      
      {/* BACKGROUND DÉCORATIF */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/4 -left-20 w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-brand-primary/10 rounded-full blur-[100px] lg:blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* CÔTÉ GAUCHE : TEXTE */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Badge Flash Pro - Plus petit sur mobile */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-gradient-to-r from-brand-primary/20 to-transparent border border-brand-primary/30 mb-6 lg:mb-8">
              <div className="relative">
                <Zap size={12} className="text-brand-primary animate-pulse" fill="currentColor" />
              </div>
              <span className="text-[9px] lg:text-[11px] font-black tracking-[0.2em] uppercase text-brand-primary text-center">
                Offre Limitée : -70% Immédiat
              </span>
            </motion.div>

            {/* Titre - Taille adaptée mobile/desktop */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-black !leading-[1.1] mb-6 tracking-tighter italic uppercase">
              L'exceptionnel <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_auto] animate-gradient-x">
                  à portée de main
                </span>
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-1 lg:bottom-2 left-0 h-1 bg-brand-primary/30 -z-10"
                />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-lg mx-auto lg:mx-0 text-gray-400 text-base lg:text-lg leading-relaxed mb-8">
              Plongez dans un univers de précision et de style. Notre collection exclusive combine artisanat traditionnel et design contemporain.
            </motion.p>

            {/* BOUTONS - Empilés sur mobile, côte à côte sur tablette+ */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                to="/products" 
                className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-brand-primary text-white rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,90,90,0.4)] text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-wide">
                  Profiter de l'offre
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                to="/products" 
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-center"
              >
                <ShoppingBag size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                <span>Boutique</span>
              </Link>
            </motion.div>

            {/* STATS - Grille mieux gérée sur mobile */}
            <motion.div variants={itemVariants} className="mt-12 lg:mt-16 grid grid-cols-3 gap-4 lg:gap-8 border-t border-white/5 pt-8 max-w-md mx-auto lg:mx-0">
              {[
                { label: 'Réduction', value: '70%' },
                { label: 'Modèles', value: '500+' },
                { label: 'Livraison', value: '24h' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-xl lg:text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[9px] text-brand-primary font-bold uppercase tracking-tighter opacity-80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* CÔTÉ DROIT : SLIDER - Affiché en premier sur mobile si besoin, ou réduit */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full relative order-1 lg:order-2"
          >
            <div className="absolute -inset-4 bg-brand-primary/5 rounded-[2.5rem] blur-2xl" />
            <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-auto">
                <HeroSlider />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}