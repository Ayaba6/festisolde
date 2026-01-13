import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ShoppingBag, Store } from 'lucide-react'

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
      // 1. Inscription Supabase Auth
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

      // 2. Mise à jour de l'état global
      setUser({ ...data.user, role, full_name: fullName })

      // 3. Redirection Intelligente
      if (role === 'vendor') {
        navigate('/vendor/create-shop') // Directement vers la création de boutique
      } else {
        navigate('/') // Retour à l'accueil pour les clients
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Rejoignez FestiSolde</h1>
          <p className="text-gray-500 font-medium mt-2">Créez votre compte en quelques secondes</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Nom Complet */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Nom complet"
              className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Adresse email"
              className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Mot de passe (6 caractères min.)"
              className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Choix du Rôle (Design amélioré) */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'customer' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <ShoppingBag size={24} />
              <span className="text-xs font-black uppercase">Acheteur</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('vendor')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'vendor' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <Store size={24} />
              <span className="text-xs font-black uppercase">Vendeur</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 mt-4"
          >
            {loading ? 'Création du compte...' : 'Démarrer l’expérience'}
          </button>
        </form>

        <p className="text-center text-gray-500 font-bold mt-8">
          Déjà inscrit ?{' '}
          <button 
            onClick={() => navigate('/auth/login')} 
            className="text-indigo-600 hover:underline"
          >
            Connectez-vous
          </button>
        </p>
      </div>
    </div>
  )
}