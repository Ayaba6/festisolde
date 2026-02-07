import { motion } from 'framer-motion'
import { Heart, ShieldCheck, Zap, Store, Users, Star } from 'lucide-react'

export default function About() {
  const stats = [
    { label: "Boutiques Partenaires", value: "50+", icon: <Store className="text-rose-500" /> },
    { label: "Cadeaux Livrés", value: "2k+", icon: <Heart className="text-rose-500" /> },
    { label: "Clients Heureux", value: "99%", icon: <Users className="text-rose-500" /> },
  ]

  const values = [
    {
      title: "Rapidité Éclair",
      desc: "Parce que l'amour n'attend pas, nous optimisons chaque étape de la commande.",
      icon: <Zap size={30} className="text-amber-500" />
    },
    {
      title: "Confiance Totale",
      desc: "Nous sélectionnons rigoureusement nos vendeurs pour garantir la qualité de vos cadeaux.",
      icon: <ShieldCheck size={30} className="text-emerald-500" />
    },
    {
      title: "Expérience Unique",
      desc: "Une interface pensée pour que le plaisir d'offrir commence dès la navigation.",
      icon: <Star size={30} className="text-rose-500" />
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HERO SECTION */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Notre Mission</span>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter italic uppercase mb-8">
              Rendre chaque <span className="text-rose-600">instant</span> inoubliable.
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed italic">
              DASHBOARDPRO est né d'une idée simple : connecter les meilleurs créateurs et vendeurs de cadeaux avec ceux qui souhaitent exprimer leurs sentiments de la plus belle des manières.
            </p>
          </motion.div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-rose-50 rounded-full blur-3xl opacity-50" />
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-xl">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black italic">{stat.value}</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Pourquoi nous faire <span className="text-rose-600">confiance ?</span></h2>
              <div className="grid gap-8">
                {values.map((v, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex gap-6 p-6 rounded-[2rem] border border-slate-50 hover:border-rose-100 hover:bg-rose-50/30 transition-all"
                  >
                    <div className="shrink-0">{v.icon}</div>
                    <div>
                      <h3 className="font-black uppercase text-sm mb-1 italic">{v.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop" 
                  alt="Love and Gifts" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-rose-600 rounded-[3rem] -rotate-3 scale-95 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-rose-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-rose-200">
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-8">Prêt à propulser votre business ?</h2>
              <p className="text-rose-100 mb-10 max-w-xl mx-auto font-medium italic">
                Rejoignez des dizaines de vendeurs passionnés et commencez à vendre vos produits en moins de 5 minutes.
              </p>
              <button className="bg-white text-rose-600 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 shadow-xl">
                Ouvrir ma boutique
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-900/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  )
}