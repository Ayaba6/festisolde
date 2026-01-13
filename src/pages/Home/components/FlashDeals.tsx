import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { toast } from 'sonner'
import { auth } from '../../../lib/auth'
import { cart } from '../../../lib/cart'

// 1. Interface stricte
interface FlashProduct {
  id: string
  nom: string
  images: string[]
  prix_solde: number
  prix_original?: number // Optionnel pour calculer la promo
}

export default function FlashDeals() {
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('id, nom, images, prix_solde, prix_original')
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF', // Adapté au Burkina Faso
      minimumFractionDigits: 0 
    }).format(p)

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingId(productId) // Bloque le bouton spécifiquement
      const { data: { user } } = await auth.getUser()

      if (!user) {
        toast.error('Veuillez vous connecter pour acheter', {
          action: { label: 'Connexion', onClick: () => window.location.href = '/auth/login' }
        })
        return
      }

      await cart.addItem(user.id, productId)
      toast.success('Ajouté avec succès !')
    } catch (err: any) {
      toast.error('Erreur lors de l’ajout')
    } finally {
      setAddingId(null)
    }
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="py-12 max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <FlashIcon />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ventes Flash</h3>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-red-600 animate-pulse">
          Finit dans 04:23:12
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading 
          ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : products.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-3xl border border-gray-100 p-2 hover:shadow-2xl transition-all duration-500">
              {/* Badge Promo */}
              {item.prix_original && (
                <div className="absolute top-5 left-5 z-10 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                  -{Math.round(((item.prix_original - item.prix_solde) / item.prix_original) * 100)}%
                </div>
              )}

              {/* Image */}
              <div className="relative h-64 overflow-hidden rounded-2xl bg-gray-50">
                <img
                  src={item.images[0] || '/placeholder.png'}
                  alt={item.nom}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Infos */}
              <div className="p-4">
                <h4 className="font-bold text-gray-800 text-lg mb-1 truncate">{item.nom}</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-indigo-600 font-black text-xl">{formatPrice(item.prix_solde)}</span>
                  {item.prix_original && (
                    <span className="text-gray-400 text-sm line-through font-medium">
                      {formatPrice(item.prix_original)}
                    </span>
                  )}
                </div>

                <button
                  disabled={addingId === item.id}
                  onClick={() => handleAddToCart(item.id)}
                  className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    addingId === item.id 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-lg shadow-gray-200'
                  }`}
                >
                  {addingId === item.id ? <LoaderIcon /> : <CartIcon />}
                  {addingId === item.id ? 'Chargement...' : 'Ajouter au panier'}
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </section>
  )
}

// --- PETITS COMPOSANTS INTERNES ---

const SkeletonCard = () => (
  <div className="bg-gray-100 animate-pulse rounded-3xl h-[400px] w-full" />
)

const FlashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
)

const CartIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
)

const LoaderIcon = () => (
  <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
)