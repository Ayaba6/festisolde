import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom' // Ajout de l'import

interface LoginProps {
  setUser: (user: any) => void
}

export default function Login({ setUser }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate() // Initialisation du hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Authentification Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginError) throw loginError
      if (!data.user) throw new Error('Utilisateur non trouvé')

      // 2. Récupérer le profil pour avoir le rôle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) throw profileError

      const userData = { ...data.user, role: profile.role, full_name: profile.full_name ?? '' }
      setUser(userData)

      // 3. LOGIQUE DE REDIRECTION INTELLIGENTE
      if (profile.role === 'vendor') {
        // Vérifier si le vendeur a déjà une boutique
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', data.user.id)
          .single()

        if (shop) {
          navigate('/vendor/dashboard') // Boutique existe -> Dashboard
        } else {
          navigate('/vendor/create-shop') // Pas de boutique -> Création
        }
      } else {
        // Client classique
        navigate('/') 
      }

    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">F</div>
            <h1 className="text-3xl font-black text-gray-900">Bon retour !</h1>
            <p className="text-gray-500 font-medium mt-2">Connectez-vous à votre espace FestiSolde</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl mb-6 border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
            <input
                type="email"
                placeholder="nom@exemple.com"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Mot de passe</label>
            <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-500 font-bold mt-8">
          Pas encore de compte ?{' '}
          <button 
            onClick={() => navigate('/auth/register')} 
            className="text-indigo-600 hover:underline"
          >
            S'inscrire gratuitement
          </button>
        </p>
      </div>
    </div>
  )
}