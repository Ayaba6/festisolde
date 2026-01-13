import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

export default function ManageProducts() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function loadVendor() {
      const user = supabase.auth.user()
      if (!user) return
      const { data } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
      if (data) setVendorId(data.id)
    }
    loadVendor()
  }, [])

  useEffect(() => {
    if (!vendorId) return
    async function loadProducts() {
      const { data } = await supabase.from('products').select('*').eq('vendor_id', vendorId)
      setProducts(data || [])
    }
    loadProducts()
  }, [vendorId])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      setProducts(products.filter(p => p.id !== id))
      toast.success('Produit supprimé')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Gérer mes produits</h2>
      {products.map(p => (
        <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded shadow">
          <div>
            <h3 className="font-bold">{p.nom}</h3>
            <p className="text-indigo-600 font-black">{p.prix_solde} €</p>
            <p className="text-gray-500 text-sm">{p.categorie}</p>
          </div>
          <button onClick={() => handleDelete(p.id)} className="text-red-500 font-bold">Supprimer</button>
        </div>
      ))}
    </div>
  )
}
