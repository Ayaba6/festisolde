import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CreateShop() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (!name) return alert('Nom requis')
    setLoading(true)

    const { error } = await supabase.rpc('create_shop_for_user', {
      shop_name: name
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      navigate('/vendor/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Créer ma boutique</h1>

        <input
          className="w-full border rounded-lg px-4 py-3 mb-4"
          placeholder="Nom de la boutique"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700"
        >
          {loading ? 'Création...' : 'Créer ma boutique'}
        </button>
      </div>
    </div>
  )
}
