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
  title: string
  images: string[]
  promo_price: number
  price: number
  rating: number
  reviews_count: number
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true)
        // RÉCUPÉRATION : Uniquement ceux où is_featured est TRUE
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8)
        
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + " FCFA"

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingId(productId)
      const { data: { user } } = await auth.getUser()
      if (!user) {
        toast.error('Connexion requise');
        return
      }
      await cart.addItem(user.id, productId)
      toast.success('Ajouté au panier !')
    } catch (err) {
      toast.error('Erreur lors de l’ajout')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <section className="pb-16 lg:pb-24 pt-0 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* TITRE DE SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-brand-primary/20">
              <Sparkles size={10} fill="currentColor" /> Sélection Premium
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
              Les <span className="text-brand-primary">Incontournables</span>
            </h2>
          </div>
          <Link to="/shop" className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary transition-all shadow-lg shadow-gray-200">
            Voir boutique <ArrowRight size={18} />
          </Link>
        </div>

        {/* GRILLE DYNAMIQUE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {loading ? (
             Array(4).fill(0).map((_, i) => <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-[2rem]" />)
          ) : products.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col bg-white"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <Link to={`/product/${item.id}`} className="p-4 bg-white text-gray-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all scale-75 group-hover:scale-100">
                    <Eye size={20} strokeWidth={3} />
                  </Link>
                </div>
              </div>

              <div className="px-1 flex flex-col flex-grow">
                <div className="flex items-center gap-1 mb-1">
                  <Star size={12} fill="#f59e0b" className="text-amber-500" />
                  <span className="text-[10px] font-black text-gray-900">{item.rating?.toFixed(1) || "5.0"}</span>
                </div>
                <h3 className="font-black text-gray-900 text-base mb-2 uppercase italic tracking-tight group-hover:text-brand-primary transition-colors">{item.title}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-brand-primary tracking-tighter leading-none">{formatPrice(item.promo_price)}</span>
                    {item.price > item.promo_price && (
                      <span className="text-[10px] text-gray-400 line-through font-bold">{formatPrice(item.price)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={addingId === item.id}
                    className="p-3 bg-gray-900 text-white rounded-xl hover:bg-brand-primary transition-all shadow-md active:scale-90 disabled:bg-gray-200"
                  >
                    {addingId === item.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingCart size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}