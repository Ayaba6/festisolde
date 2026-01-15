import { useState } from 'react'
import { Send, Mail, CheckCircle2, Gift } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    
    setTimeout(() => {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 5000)
    }, 1500)
  }

  return (
    <section className="relative max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-20">
      {/* Container - Passage de rounded-[4rem] à rounded-brand (ou 2xl pour marquer la section) */}
      <div className="relative overflow-hidden bg-brand-dark rounded-2xl lg:rounded-[3rem] p-8 lg:p-20 shadow-xl">
        
        {/* Motif de fond à pois discret */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Lueurs corail plus subtiles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Badge Offre de Bienvenue - Plus petit et élégant */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 pl-1 pr-4 py-1 rounded-full mb-8">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shadow-lg">
              <Gift className="text-white" size={14} />
            </div>
            <span className="text-white font-bold text-[10px] lg:text-xs tracking-wider uppercase">
              -10% sur votre première commande
            </span>
          </div>

          {/* Titre : Utilisation de festi-h1 mais avec un line-height serré */}
          <h2 className="text-festi-h1 font-black text-white mb-6 leading-[1.1]">
            Prêt pour les <br />
            <span className="text-brand-primary italic">prochaines soldes ?</span>
          </h2>
          
          <p className="mb-10 text-slate-400 text-sm lg:text-base font-medium leading-relaxed max-w-md mx-auto">
            Inscrivez-vous pour recevoir votre code promo exclusif et nos offres en avant-première.
          </p>

          {status === 'success' ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-500 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white">C'est validé !</p>
              <p className="text-slate-400 text-sm mt-1">Vérifiez votre boîte mail.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl">
                <div className="flex-1 flex items-center px-3">
                  <Mail className="text-slate-500 mr-2" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="Votre email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full py-3 bg-transparent text-white placeholder:text-slate-600 focus:outline-none font-medium text-sm lg:text-base"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="btn-primary py-3 px-8 text-xs lg:text-sm whitespace-nowrap"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>S'INSCRIRE <Send size={16} /></>
                  )}
                </button>
              </div>
              
              {/* Footer de formulaire plus discret */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> 5000+ ABONNÉS
                </span>
                <span className="opacity-30">|</span>
                <span>SANS SPAM</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}