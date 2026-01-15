import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthRedirect({ user }: { user: any }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    const handleAiguillage = async () => {
      // 1. PRIORITÉ ABSOLUE : SUPER ADMIN
      // On redirige vers la nouvelle console générale
      if (user.role === 'admin') {
        navigate('/admin-general') 
        return
      }

      // 2. CAS VENDEUR (OU FUTUR VENDEUR)
      if (user.role === 'vendor') {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (shop) {
          navigate('/vendor/dashboard')
        } else {
          // Si le rôle est 'vendor' mais qu'il n'a pas fini de créer sa boutique
          navigate('/vendor/create-shop')
        }
        return
      }

      // 3. CAS CLIENT (VISITOR/CUSTOMER)
      // On le renvoie vers l'accueil pour qu'il puisse faire son shopping
      navigate('/')
    }

    handleAiguillage()
  }, [user, navigate])

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        {/* Un loader plus moderne et assorti au style FestiSolde */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin"></div>
        </div>
        
        <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">
          Synchronisation <span className="text-brand-primary">{user?.role}</span>
        </p>
        <p className="text-gray-500 text-[9px] mt-2 font-bold uppercase">Chargement de votre environnement...</p>
      </div>
    </div>
  )
}