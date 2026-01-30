import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader2, Sparkles } from 'lucide-react'

interface LoginProps {
  setUser: (user: any) => void
}

export default function Login({ setUser }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginError) throw loginError
      if (!data.user) throw new Error('Utilisateur non trouvé')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) throw profileError

      const userData = { ...data.user, role: profile.role, full_name: profile.full_name ?? '' }
      setUser(userData)

      if (profile.role === 'vendor') {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', data.user.id)
          .single()

        if (shop) {
          navigate('/vendor/dashboard')
        } else {
          navigate('/vendor/create-shop')
        }
      } else {
        navigate('/') 
      }

    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100">
        
        {/* LOGO & TITRE */}
        <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gray-900 rounded-[1.8rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <Sparkles size={32} className="text-brand-primary" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">
              Bon <span className="text-brand-primary">Retour</span>
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-4">Accédez à FestiSolde Burkina</p>
        </div>

        {/* ERREUR */}
        {error && (
            <div className="bg-rose-50 text-rose-600 text-xs font-black p-4 rounded-2xl mb-8 border border-rose-100 flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Email Professionnel</label>
            <input
                type="email"
                placeholder="votre@email.com"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-primary focus:bg-white outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">Mot de passe</label>
            <input
                type="password"
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-primary focus:bg-white outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Se connecter <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">
            Pas encore de compte ?
          </p>
          <button 
            onClick={() => navigate('/auth/register')} 
            className="text-brand-primary font-black uppercase text-xs tracking-widest mt-2 hover:underline"
          >
            S'inscrire gratuitement
          </button>
        </div>
      </div>
    </div>
  )
}