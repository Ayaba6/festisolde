import { useState } from 'react'
import { Send, Mail, CheckCircle2 } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    
    // Simulation d'appel API (à remplacer par votre logique Supabase)
    setTimeout(() => {
      setStatus('success')
      setEmail('')
      // Reset après 5 secondes pour permettre une nouvelle inscription
      setTimeout(() => setStatus('idle'), 5000)
    }, 1500)
  }

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-20">
      {/* Container principal avec dégradé et bordure éclatante */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-10 md:p-20 shadow-2xl shadow-indigo-500/20">
        
        {/* Cercles décoratifs en arrière-plan */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Icône flottante */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20">
            <Mail className="text-white" size={32} />
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Ne ratez plus <br />
            <span className="text-indigo-200">une seule bonne affaire</span>
          </h2>
          
          <p className="mb-10 text-indigo-100 text-lg font-medium leading-relaxed">
            Inscrivez-vous et recevez nos ventes flash privées <br className="hidden md:block" /> 
            et des codes promos exclusifs chaque semaine.
          </p>

          {status === 'success' ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <CheckCircle2 size={64} className="text-emerald-400 mb-4" />
              <p className="text-xl font-bold text-white">Vous êtes inscrit !</p>
              <p className="text-indigo-200">Vérifiez votre boîte mail pour confirmer.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <input 
                  type="email" 
                  required
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="flex-1 px-6 py-4 bg-transparent text-white placeholder:text-indigo-200 focus:outline-none font-medium"
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-white text-indigo-700 font-black rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      S'abonner <Send size={18} />
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-[11px] text-indigo-200/70">
                En vous inscrivant, vous acceptez notre politique de confidentialité. 
                Désinscription possible à tout moment.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}