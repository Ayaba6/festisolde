import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ShoppingBag, Store, Loader2, Sparkles } from 'lucide-react'

interface RegisterProps {
  setUser: (user: any) => void
}

export default function Register({ setUser }: RegisterProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'vendor'>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: fullName,
            role: role 
          } 
        },
      })

      if (signUpError) throw signUpError
      if (!data.user) throw new Error('Erreur lors de la création du compte')

      setUser({ ...data.user, role, full_name: fullName })

      if (role === 'vendor') {
        navigate('/vendor/create-shop')
      } else {
        navigate('/')
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-lg rotate-3">
             <Sparkles size={28} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">
            Rejoignez <span className="text-brand-primary">FestiSolde</span>
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-4">Le futur du shopping au Burkina Faso</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs font-black p-4 rounded-2xl mb-8 border border-rose-100 flex items-center gap-3">
            <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom Complet */}
            <div className="relative">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Identité</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="Nom complet"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-primary focus:bg-white outline-none font-bold text-gray-900 transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Contact</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-primary focus:bg-white outline-none font-bold text-gray-900 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Sécurité</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="password"
                placeholder="Mot de passe (6+ caractères)"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-primary focus:bg-white outline-none font-bold text-gray-900 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Choix du Rôle */}
          <div className="space-y-3">
             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4 text-center">Choisissez votre profil</label>
             <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                    role === 'customer' 
                    ? 'border-brand-primary bg-brand-primary/5 text-gray-900 shadow-lg shadow-brand-primary/10' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <ShoppingBag size={28} className={role === 'customer' ? 'text-brand-primary' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Acheteur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                    role === 'vendor' 
                    ? 'border-brand-primary bg-brand-primary/5 text-gray-900 shadow-lg shadow-brand-primary/10' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Store size={28} className={role === 'vendor' ? 'text-brand-primary' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Vendeur</span>
                </button>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Démarrer l’expérience'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 font-bold text-xs mt-10 uppercase tracking-tight">
          Déjà inscrit ?{' '}
          <button 
            onClick={() => navigate('/auth/login')} 
            className="text-brand-primary font-black hover:underline"
          >
            Connectez-vous ici
          </button>
        </p>
      </div>
    </div>
  )
}