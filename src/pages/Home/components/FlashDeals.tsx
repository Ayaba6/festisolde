import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Zap, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

// Interface alignée sur les colonnes probables de ta DB
interface FlashProduct {
  id: string
  title: string      // Changé de 'nom' à 'title'
  images: string[]
  promo_price: number // Changé de 'prix_solde' à 'promo_price'
  price: number       // Changé de 'prix_original' à 'price'
  stock: number       // Changé de 'stock_total' à 'stock'
}

export default function FlashDeals() {
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        // REQUÊTE CORRIGÉE : On sélectionne les noms de colonnes SQL standards
        const { data, error } = await supabase
          .from('products')
          .select('id, title, images, promo_price, price, stock') 
          .limit(4) 

        if (error) {
          console.error("Erreur de colonnes Supabase :", error.message)
          throw error
        }
        setProducts(data || [])
      } catch (err) { 
        console.error("Erreur Fetch:", err) 
      } finally { 
        setLoading(false) 
      }
    }
    fetchProducts()
  }, [])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(p)

  return (
    <section className="py-20 bg-[#FDF8F3]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 text-left">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 4 }}
                className="p-1.5 bg-[#FF5A5A] rounded-lg text-white shadow-lg shadow-red-200"
              >
                <Zap size={20} fill="currentColor" />
              </motion.div>
              <span className="bg-[#FF5A5A]/10 text-[#FF5A5A] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Ventes Flash
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Offres éclair du jour</h2>
            <p className="text-gray-500 font-bold mt-2">Dépêchez-vous, stocks limités !</p>
          </div>

          {/* COMPTE À REBOURS */}
          <div className="bg-[#101828] text-white px-8 py-5 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
             <div className="flex items-center gap-3">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               <span className="text-sm font-bold text-gray-400">Fin dans</span>
             </div>
             <div className="flex gap-5">
               {['23', '54', '01'].map((val, i) => (
                 <div key={i} className="text-center">
                   <span className="text-3xl font-black tabular-nums">{val}</span>
                   <span className="text-[10px] block text-gray-500 font-bold uppercase mt-1">{['h', 'm', 's'][i]}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* GRILLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {!loading && products.map((item) => (
            <div key={item.id} className="group bg-white rounded-[2.5rem] p-3 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100">
              
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-50 mb-6">
                <div className="absolute top-4 left-4 z-10 bg-[#FF5A5A] text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg">
                  -{Math.round(((item.price - item.promo_price) / item.price) * 100)}%
                </div>
                <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                
                {/* PROGRESS BAR */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl">
                  <div className="flex justify-between text-[10px] font-black mb-2 uppercase">
                    <span className="text-gray-400">Stock</span>
                    <span className="text-[#FF5A5A]">{item.stock} restants</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.stock / 50) * 100}%` }} // Remplacé stock_total par une valeur arbitraire 50 ou à ajouter en DB
                      className="h-full bg-gradient-to-r from-[#FF5A5A] to-[#FF8A5A] rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="px-2 pb-2 text-left">
                <h4 className="font-black text-gray-900 text-lg mb-2 truncate">{item.title}</h4>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl font-black text-[#FF5A5A]">{formatPrice(item.promo_price)}</span>
                  <span className="text-sm text-gray-400 line-through font-bold">{formatPrice(item.price)}</span>
                </div>

                <button className="w-full py-4 bg-gray-900 hover:bg-[#FF5A5A] text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95">
                  <ShoppingCart size={18} />
                  Panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}