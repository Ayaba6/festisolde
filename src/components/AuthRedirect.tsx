import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthRedirect({ user }: { user: any }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    const handleAiguillage = async () => {
      // 1. PRIORITÉ ABSOLUE : SUPER ADMIN
      if (user.role === 'admin') {
        navigate('/admin-general') 
        return
      }

      // 2. CAS VENDEUR
      if (user.role === 'vendor') {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (shop) {
          navigate('/vendor/dashboard')
        } else {
          navigate('/vendor/create-shop')
        }
        return
      }

      // 3. CAS CLIENT (CUSTOMER)
      // On vérifie s'il y a une redirection en attente (ex: après un checkout)
      // Sinon, on le laisse aller vers l'accueil ou ses commandes
      const redirectTo = sessionStorage.getItem('authRedirectPath')
      if (redirectTo) {
        sessionStorage.removeItem('authRedirectPath')
        navigate(redirectTo)
      } else {
        navigate('/') // Retour shopping par défaut
      }
    }

    handleAiguillage()
  }, [user, navigate])

  return (
    <div className="h-screen flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        {/* Loader premium FestiSolde */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl border-4 border-brand-primary/10 rotate-45"></div>
          <div className="absolute inset-0 rounded-2xl border-4 border-t-brand-primary animate-spin rotate-45"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-brand-primary font-black italic text-xl">f</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-white font-black uppercase tracking-[0.4em] text-[10px]">
            Connexion <span className="text-brand-primary">{user?.role}</span>
          </p>
          <div className="flex items-center justify-center gap-1">
             <span className="w-1 h-1 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
             <span className="w-1 h-1 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
             <span className="w-1 h-1 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}