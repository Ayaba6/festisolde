import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabaseClient'
import { toast } from 'sonner'
import { auth } from '../../../lib/auth'
import { cart } from '../../../lib/cart'
import { ShoppingCart, Eye, Star, ArrowRight, Sparkles } from 'lucide-react'

interface Product {
  id: string
  nom: string
  images: string[]
  prix_solde: number
  prix_original: number
  rating: number
  reviews_count: number
  is_featured: boolean
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
          .eq('is_featured', true)
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
    <section className="pb-16 lg:pb-24 pt-0 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER DE SECTION : ESPACEMENT RÉDUIT */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 lg:mb-12 gap-6">
          <div className="text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-brand-primary/20"
            >
              <Sparkles size={10} fill="currentColor" /> Sélection Premium
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter italic uppercase leading-none"
            >
              Les <span className="text-brand-primary">Incontournables</span>
            </motion.h2>
            <p className="text-gray-400 mt-2 font-medium text-sm lg:text-base italic uppercase tracking-widest opacity-80">
              Nos meilleures pépites du moment.
            </p>
          </div>
          
          <Link to="/shop" className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary transition-all duration-300 shadow-lg shadow-gray-200">
            Voir boutique 
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* GRILLE DE PRODUITS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {loading 
            ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((item, index) => {
                const discount = calculateDiscount(item.prix_original, item.prix_solde);
                
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="group flex flex-col h-full bg-white"
                  >
                    {/* IMAGE CONTAINER */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                      {discount && (
                        <div className="absolute top-4 left-4 z-10 bg-brand-primary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg italic">
                          -{discount}%
                        </div>
                      )}

                      <img 
                        src={item.images[0] || '/placeholder.png'} 
                        alt={item.nom} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[1px]">
                        <Link 
                          to={`/product/${item.id}`}
                          className="p-4 bg-white text-gray-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-300"
                        >
                          <Eye size={20} strokeWidth={3} />
                        </Link>
                      </div>
                    </div>

                    {/* INFOS PRODUIT */}
                    <div className="px-1 flex flex-col flex-grow">
                      <div className="flex items-center gap-1 mb-1">
                        <Star size={12} fill="#f59e0b" className="text-amber-500" />
                        <span className="text-[10px] font-black text-gray-900">{item.rating?.toFixed(1) || "5.0"}</span>
                        <span className="text-[10px] font-bold text-gray-400">({item.reviews_count || 0})</span>
                      </div>

                      <h3 className="font-black text-gray-900 text-base mb-2 line-clamp-2 leading-tight uppercase italic tracking-tight group-hover:text-brand-primary transition-colors">
                        {item.nom}
                      </h3>
                      
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-brand-primary tracking-tighter leading-none">
                            {formatPrice(item.prix_solde)}
                          </span>
                          {item.prix_original > item.prix_solde && (
                            <span className="text-[10px] text-gray-400 line-through font-bold mt-0.5">
                              {formatPrice(item.prix_original)}
                            </span>
                          )}
                        </div>

                        <button
                          disabled={addingId === item.id}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(item.id);
                          }}
                          className={`p-3 rounded-xl transition-all duration-300 ${
                            addingId === item.id 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-gray-900 text-white hover:bg-brand-primary hover:-translate-y-1'
                          }`}
                        >
                          {addingId === item.id ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShoppingCart size={18} strokeWidth={2.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              }
            )}
        </div>
      </div>
    </section>
  )
}

const ProductSkeleton = () => (
  <div className="animate-pulse flex flex-col">
    <div className="aspect-[4/5] bg-gray-100 rounded-[2rem] mb-4" />
    <div className="space-y-3 px-1">
      <div className="h-2 bg-gray-100 rounded w-1/4" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-100 rounded w-1/2" />
        <div className="h-10 w-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
)