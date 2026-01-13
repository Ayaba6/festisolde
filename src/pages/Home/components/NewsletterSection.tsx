import { useState } from 'react'
import { Send, Mail, CheckCircle2, Gift } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    
    // Simulation d'appel API
    setTimeout(() => {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 5000)
    }, 1500)
  }

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24">
      {/* Container principal - Utilisation du noir profond et du motif à pois */}
      <div className="relative overflow-hidden bg-[#0F1115] rounded-[4rem] p-10 md:p-24 shadow-2xl shadow-black/40">
        
        {/* Motif de fond à pois (dots pattern) tiré du design original */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Lueurs corail directionnelles pour le dynamisme */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5A5A]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF5A5A]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge Offre de Bienvenue */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl mb-10 animate-bounce">
            <div className="w-10 h-10 bg-[#FF5A5A] rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Gift className="text-white" size={20} />
            </div>
            <span className="text-white font-black text-sm tracking-wide">10% DE RÉDUCTION SUR VOTRE PREMIÈRE COMMANDE</span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
            Prêt pour les <br />
            <span className="bg-gradient-to-r from-[#FF5A5A] via-[#FF7B7B] to-[#FF9B9B] bg-clip-text text-transparent italic">
              prochaines soldes ?
            </span>
          </h2>
          
          <p className="mb-12 text-gray-400 text-lg md:text-xl font-bold leading-relaxed max-w-xl mx-auto">
            Inscrivez-vous à notre newsletter et recevez votre code promo exclusif, ainsi que nos meilleures offres en avant-première.
          </p>

          {status === 'success' ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-6 border border-emerald-500/30">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight">C'est validé !</p>
              <p className="text-emerald-400/80 mt-2 font-bold">Vérifiez vos mails, votre cadeau vous y attend.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 p-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] focus-within:border-[#FF5A5A]/50 transition-all duration-300 shadow-inner">
                <div className="flex-1 flex items-center px-4">
                  <Mail className="text-gray-500 mr-3" size={20} />
                  <input 
                    type="email" 
                    required
                    placeholder="Votre adresse email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-transparent text-white placeholder:text-gray-500 focus:outline-none font-bold text-lg"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="px-10 py-5 bg-[#FF5A5A] text-white font-black rounded-[2rem] hover:bg-[#ff4444] hover:shadow-[0_10px_30px_rgba(255,90,90,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      S'INSCRIRE <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 5000+ ABONNÉS
                </span>
                <span className="opacity-50">|</span>
                <span>DESINSCRIPTION EN 1 CLIC</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}