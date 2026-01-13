import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Store, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CreateShop() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oups ! Vous devez être connecté.')

      // 2. Création de la boutique dans la table 'shops'
      const { error: shopError } = await supabase.from('shops').insert([
        {
          name,
          description,
          owner_id: user.id,
        },
      ])
      if (shopError) throw new Error("Erreur lors de la création de la boutique. Vérifiez si le nom n'est pas déjà pris.")

      // 3. Mise à jour du rôle dans la table 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'vendor' })
        .eq('id', user.id)

      if (profileError) throw new Error("Impossible de mettre à jour votre profil en 'vendeur'.")

      // 4. Rafraîchir la session locale pour que le jeton JWT contienne le nouveau rôle
      await supabase.auth.refreshSession()

      setSuccess(true)

      // 5. Redirection forcée après 2 secondes
      setTimeout(() => {
        // On utilise replace pour éviter que l'utilisateur ne revienne en arrière sur le formulaire
        window.location.replace('/vendor/dashboard')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // --- Écran de Succès ---
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-[2.5rem] shadow-xl border border-green-100">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-green-500 rounded-full p-4 text-white">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">C'est parti !</h2>
          <p className="text-gray-500 font-medium">
            Votre boutique <span className="text-indigo-600 font-bold">"{name}"</span> est maintenant en ligne.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            Préparation de votre dashboard...
          </div>
        </div>
      </div>
    )
  }

  // --- Formulaire de Création ---
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 rotate-3">
            <Store size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Devenir Vendeur</h1>
          <p className="text-gray-500 font-medium mt-3">
            Donnez un nom et une âme à votre boutique pour commencer à vendre.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-2xl flex items-start gap-3 animate-shake">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreateShop} className="space-y-6">
          <div>
            <label className="block mb-2 font-black text-gray-700 ml-1 uppercase text-xs tracking-widest">
              Nom de la boutique
            </label>
            <input
              type="text"
              placeholder="Ex: Festi'Mode Ouaga"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold transition-all placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block mb-2 font-black text-gray-700 ml-1 uppercase text-xs tracking-widest">
              Description de votre activité
            </label>
            <textarea
              placeholder="Que vendez-vous ? (Vêtements, électronique, déco...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-medium transition-all placeholder:text-gray-300 resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-[#0f172a] hover:bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Lancer ma boutique
                  <Store size={20} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-xs text-gray-400 font-medium">
          En créant une boutique, vous acceptez nos conditions générales de vente.
        </p>
      </div>
    </div>
  )
}