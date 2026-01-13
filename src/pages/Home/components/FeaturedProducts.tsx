import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'
import { toast } from 'sonner'
import { auth } from '../../../lib/auth'
import { cart } from '../../../lib/cart'
import { ShoppingCart, Eye, Star } from 'lucide-react'

// Interface pour un typage TypeScript robuste
interface Product {
  id: string
  nom: string
  images: string[]
  prix_solde: number
  rating?: number // Optionnel : pour afficher des étoiles
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('id, nom, images, prix_solde')
          .order('created_at', { ascending: false })
          .limit(8)
        
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error("Erreur chargement vedettes:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF', 
      minimumFractionDigits: 0 
    }).format(p)

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingId(productId)
      const { data: { user } } = await auth.getUser()
      
      if (!user) {
        toast.error('Connectez-vous pour acheter', {
          description: "C'est rapide et gratuit !"
        })
        return
      }

      await cart.addItem(user.id, productId)
      toast.success('Ajouté au panier !')
    } catch (err: any) {
      toast.error('Impossible d’ajouter le produit')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            Produits en vedette
          </h3>
          <p className="text-gray-500 mt-2">La crème de la crème, sélectionnée pour vous.</p>
        </div>
        <Link to="/products" className="text-indigo-600 font-bold hover:underline text-sm uppercase tracking-widest">
          Tout voir
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading 
          ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((item) => (
            <div key={item.id} className="group flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img 
                  src={item.images[0] || '/placeholder.png'} 
                  alt={item.nom} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay Action (Desktop Only) */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link 
                    to={`/product/${item.id}`}
                    className="p-3 bg-white text-gray-900 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Eye size={20} />
                  </Link>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.nom}
                  </h4>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900">
                    {formatPrice(item.prix_solde)}
                  </span>
                  <button
                    disabled={addingId === item.id}
                    onClick={() => handleAddToCart(item.id)}
                    className={`p-3 rounded-2xl transition-all ${
                      addingId === item.id 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {addingId === item.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}

// --- SKELETON COMPONENT ---
const ProductSkeleton = () => (
  <div className="animate-pulse flex flex-col bg-gray-50 rounded-3xl h-[400px]">
    <div className="h-64 bg-gray-200 rounded-t-3xl" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-10 bg-gray-200 rounded-xl w-full mt-4" />
    </div>
  </div>
)