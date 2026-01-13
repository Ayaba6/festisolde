import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'
import { toast } from 'sonner'
import { auth } from '../../../lib/auth'
import { cart } from '../../../lib/cart'
import { ShoppingCart, Eye, Star } from 'lucide-react'

interface Product {
  id: string
  nom: string
  images: string[]
  prix_solde: number
  prix_original?: number // Pour afficher la réduction
  rating?: number
  reviews_count?: number
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
          .select('id, nom, images, prix_solde, prix_original, rating, reviews_count')
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
    new Intl.NumberFormat('fr-FR').format(p) + " FCFA"

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
    <section className="py-24 max-w-7xl mx-auto px-6 bg-white">
      {/* HEADER DE SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-amber-100">
            <Star size={12} fill="currentColor" /> Sélection premium
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Produits vedettes
          </h2>
          <p className="text-gray-500 font-bold mt-3 text-lg">
            Notre sélection des meilleures offres, choisies pour leur qualité exceptionnelle.
          </p>
        </div>
        <Link to="/products" className="group px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-900 hover:text-white transition-all border border-gray-100">
          Voir tout <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading 
          ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((item) => (
            <div key={item.id} className="group flex flex-col h-full bg-white rounded-[2.5rem] p-3 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              
              {/* IMAGE CONTAINER AVEC BADGES */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F9FAFB] mb-6">
                {/* Badge Promo Corail */}
                <div className="absolute top-4 left-4 z-10 bg-[#FF5A5A] text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-lg shadow-red-100">
                  -50%
                </div>
                
                {/* Badge Vedette Jaune */}
                <div className="absolute top-14 left-4 z-10 bg-[#FFB800] text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-amber-100">
                  <Star size={10} fill="currentColor" /> Vedette
                </div>

                <img 
                  src={item.images[0] || '/placeholder.png'} 
                  alt={item.nom} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Quick Actions sur Hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link 
                    to={`/product/${item.id}`}
                    className="p-4 bg-white text-gray-900 rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-xl"
                  >
                    <Eye size={22} />
                  </Link>
                </div>
              </div>

              {/* INFOS PRODUIT */}
              <div className="px-3 pb-4 flex flex-col flex-grow text-left">
                {/* Étoiles */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < (item.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                  ))}
                  <span className="text-[12px] font-bold text-gray-400 ml-1">({item.reviews_count || 128})</span>
                </div>

                <h3 className="font-black text-gray-900 text-xl mb-4 leading-tight group-hover:text-[#FF5A5A] transition-colors line-clamp-2">
                  {item.nom}
                </h3>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-[#FF5A5A]">
                      {formatPrice(item.prix_solde)}
                    </span>
                    <span className="text-sm text-gray-300 line-through font-bold">
                      {formatPrice(item.prix_original || item.prix_solde * 2)}
                    </span>
                  </div>

                  <button
                    disabled={addingId === item.id}
                    onClick={() => handleAddToCart(item.id)}
                    className={`p-4 rounded-2xl transition-all shadow-lg ${
                      addingId === item.id 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-gray-900 text-white hover:bg-[#FF5A5A] hover:shadow-red-200'
                    }`}
                  >
                    {addingId === item.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart size={22} />
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

const ProductSkeleton = () => (
  <div className="animate-pulse bg-white rounded-[2.5rem] p-3 border border-gray-100">
    <div className="aspect-[4/5] bg-gray-100 rounded-[2rem] mb-6" />
    <div className="px-3 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-6 bg-gray-100 rounded w-3/4" />
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  </div>
)