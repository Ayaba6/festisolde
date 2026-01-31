import { motion } from 'framer-motion'
import { 
  ArrowRight, CheckCircle2, Rocket, 
  ShieldCheck, Smartphone, TrendingUp, Sparkles 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function VendorLanding() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Smartphone className="text-brand-primary" size={32} />,
      title: "Paiements Simplifiés",
      desc: "Recevez vos fonds instantanément via Orange Money et Moov Money. Fini les soucis de monnaie."
    },
    {
      icon: <TrendingUp className="text-brand-primary" size={32} />,
      title: "Visibilité Maximale",
      desc: "Vos articles sont vus par des milliers de clients à Ouaga et Bobo dès la publication."
    },
    {
      icon: <ShieldCheck className="text-brand-primary" size={32} />,
      title: "Badge de Confiance",
      desc: "Devenez un 'Vendeur Certifié' et rassurez vos clients sur la qualité de vos produits."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* SECTION HERO */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -skew-x-12 translate-x-20 z-0 hidden lg:block" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-full mb-8"
            >
              <Sparkles size={16} className="text-brand-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Édition Spéciale Vendeurs 226</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-gray-900 leading-none italic uppercase tracking-tighter mb-8"
            >
              Vendez plus. <br />
              <span className="text-brand-primary">Vendez mieux.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-500 font-medium max-w-2xl mb-12 leading-relaxed"
            >
              FestiSolde est la première plateforme premium au Burkina Faso qui transforme votre boutique physique en une puissance de vente en ligne.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <button 
                onClick={() => navigate('/auth/register')}
                className="bg-gray-900 text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary transition-all shadow-2xl shadow-gray-200"
              >
                Ouvrir ma boutique <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="vendeur" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-gray-400 italic">+150 boutiques déjà actives</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION ARGUMENTS */}
      <section className="py-24 bg-gray-900 rounded-[4rem] mx-4">
        <div className="container mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {features.map((f, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{f.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION TARIFS (COMMISSION) */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="bg-slate-50 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter mb-6">
                Zéro frais fixes. <br />
                Juste du <span className="text-brand-primary">résultat.</span>
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  "Inscription 100% Gratuite",
                  "Pas de loyer mensuel pour votre boutique en ligne",
                  "Commission uniquement sur les ventes réussies",
                  "Accès aux outils marketing Packeo"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 font-bold text-gray-600">
                    <CheckCircle2 className="text-brand-primary" size={20} /> {text}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-80 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-brand-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Notre Commission</p>
              <div className="text-7xl font-black text-gray-900 mb-2">5%</div>
              <p className="text-sm font-bold text-gray-500 italic">Par vente finalisée</p>
              <button 
                onClick={() => navigate('/auth/register')}
                className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary transition-colors"
              >
                Commencer maintenant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER APPEL À L'ACTION */}
      <section className="pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto bg-brand-primary rounded-[3rem] p-12 shadow-2xl shadow-brand-primary/20">
          <Rocket className="mx-auto mb-6 text-white" size={48} />
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Prêt à dominer le marché ?</h2>
          <p className="text-white/80 font-bold mb-8 italic">Rejoignez la nouvelle vague du commerce au Burkina.</p>
          <button 
            onClick={() => navigate('/auth/register')}
            className="bg-white text-gray-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
          >
            Créer mon compte vendeur
          </button>
        </div>
      </section>
    </div>
  )
}