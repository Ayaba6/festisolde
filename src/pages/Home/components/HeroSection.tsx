import { ArrowRight, Sparkles, ShoppingBag, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative bg-[#0f172a] text-white overflow-hidden min-h-[85vh] flex items-center">
      {/* Background Decoratifs - Effets de lumières */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge animé */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 mb-8 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs md:text-sm font-bold tracking-wide uppercase">
              La destination n°1 du déstockage au Burkina
            </span>
          </motion.div>

          {/* Titre Principal */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] max-w-4xl"
          >
            Achetez <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">mieux</span>,<br /> 
            vendez <span className="underline decoration-indigo-500/50 underline-offset-8">plus vite</span>.
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed"
          >
            Rejoignez la plus grande communauté de vente en ligne. Profitez de prix imbattables sur des produits vérifiés par nos experts.
          </motion.p>

          {/* Boutons d'action */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
          >
            <Link
              to="/products"
              className="group w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
            >
              <ShoppingBag size={20} />
              Découvrir les offres
            </Link>

            {/* MODIFIÉ : Dirige vers le dashboard (la sécurité gère le reste) */}
            <Link
              to="/vendor/dashboard"
              className="group w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all backdrop-blur-sm active:scale-95"
            >
              <Store size={20} className="text-indigo-400" />
              Ouvrir ma boutique
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats rapides */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 border-t border-white/5 pt-10 w-full"
          >
            <div className="text-center">
              <div className="text-2xl font-black">50k+</div>
              <div className="text-sm text-slate-500 font-medium">Articles vendus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black">1.2k+</div>
              <div className="text-sm text-slate-500 font-medium">Vendeurs certifiés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black">24h</div>
              <div className="text-sm text-slate-500 font-medium">Livraison express</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}