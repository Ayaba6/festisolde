import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'
import { toast } from 'sonner'
import { auth } from '../../../lib/auth'
import { cart } from '../../../lib/cart'
import { ShoppingCart, Eye, Star, ArrowRight } from 'lucide-react'

interface Product {
  id: string
  nom: string
  images: string[]
  prix_solde: number
  prix_original: number
  rating: number
  reviews_count: number
  is_featured: boolean // La colonne qui définit si c'est vedette
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
          .select('*')
          .eq('is_featured', true) // FILTRE : Uniquement les produits vedettes
          .limit(8)
          .order('created_at', { ascending: false })
        
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

  const calculateDiscount = (original: number, sale: number) => {
    if (!original || original <= sale) return null
    return Math.round(((original - sale) / original) * 100)
  }

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingId(productId)
      const { data: { user } } = await auth.getUser()
      
      if (!user) {
        toast.error('Connexion requise', {
          description: "Connectez-vous pour ajouter au panier."
        })
        return
      }

      await cart.addItem(user.id, productId)
      toast.success('Produit ajouté au panier !')
    } catch (err: any) {
      toast.error('Erreur lors de l’ajout')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <section className="py-12 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER DE SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-16 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-brand-primary/20">
              <Star size={12} fill="currentColor" /> Sélection Premium
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter italic">
              Les Incontournables
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl font-medium">
              Découvrez les pépites sélectionnées par nos experts pour leur style et leur rapport qualité-prix.
            </p>
          </div>
          <Link to="/products" className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-brand-primary transition-all shadow-xl shadow-gray-200">
            Voir toute la boutique 
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* GRILLE DE PRODUITS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10">
          {loading 
            ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((item) => {
                const discount = calculateDiscount(item.prix_original, item.prix_solde);
                
                return (
                  <div key={item.id} className="group flex flex-col h-full bg-white transition-all duration-500">
                    
                    {/* IMAGE CONTAINER */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-50 mb-6">
                      {/* Badges Dynamiques */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {discount && (
                          <div className="bg-brand-primary text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg italic">
                            -{discount}%
                          </div>
                        )}
                        <div className="bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm uppercase tracking-wider border border-gray-100">
                          <Star size={10} fill="#f59e0b" className="text-amber-500" /> Vedette
                        </div>
                      </div>

                      <img 
                        src={item.images[0] || '/placeholder.png'} 
                        alt={item.nom} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      
                      {/* Quick View Button */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <Link 
                          to={`/product/${item.id}`}
                          className="p-4 bg-white text-gray-900 rounded-2xl hover:bg-brand-primary hover:text-white transition-all shadow-2xl scale-75 group-hover:scale-100 duration-500 font-bold flex items-center gap-2"
                        >
                          <Eye size={20} />
                        </Link>
                      </div>
                    </div>

                    {/* INFOS PRODUIT */}
                    <div className="px-2 pb-2 flex flex-col flex-grow text-left">
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={12} fill="#f59e0b" className="text-amber-500" />
                        <span className="text-[11px] font-black text-gray-900">{item.rating || 5.0}</span>
                        <span className="text-[11px] font-bold text-gray-400 ml-1">({item.reviews_count || 48})</span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 min-h-[3rem] leading-tight">
                        {item.nom}
                      </h3>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-brand-primary tracking-tighter leading-none">
                            {formatPrice(item.prix_solde)}
                          </span>
                          {item.prix_original > item.prix_solde && (
                            <span className="text-xs text-gray-300 line-through font-bold mt-1">
                              {formatPrice(item.prix_original)}
                            </span>
                          )}
                        </div>

                        <button
                          disabled={addingId === item.id}
                          onClick={() => handleAddToCart(item.id)}
                          className={`p-4 rounded-2xl transition-all duration-300 ${
                            addingId === item.id 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-gray-900 text-white hover:bg-brand-primary shadow-xl hover:shadow-brand-primary/30'
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
                )
              }
            )}
        </div>
      </div>
    </section>
  )
}

const ProductSkeleton = () => (
  <div className="animate-pulse bg-white rounded-[2rem] p-4">
    <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] mb-6" />
    <div className="space-y-4">
      <div className="h-3 bg-gray-50 rounded w-1/4" />
      <div className="h-6 bg-gray-50 rounded w-3/4" />
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 bg-gray-50 rounded w-1/3" />
        <div className="h-12 w-12 bg-gray-50 rounded-2xl" />
      </div>
    </div>
  </div>
)