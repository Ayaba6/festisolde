import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthRedirect({ user }: { user: any }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    const handleAiguillage = async () => {
      // On vérifie si l'utilisateur possède déjà une boutique
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (shop) {
        // S'il a une boutique, c'est un vendeur confirmé -> Dashboard
        navigate('/vendor/dashboard')
      } else {
        // S'il n'a pas de boutique, peu importe son rôle actuel, 
        // on l'envoie la créer s'il a cliqué sur "Ouvrir ma boutique"
        navigate('/vendor/create-shop')
      }
    }

    handleAiguillage()
  }, [user, navigate])

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-white font-bold">Préparation de votre espace...</p>
      </div>
    </div>
  )
}