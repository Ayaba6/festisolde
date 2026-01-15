import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Zap, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

interface FlashProduct {
  id: string; title: string; images: string[]; promo_price: number; price: number; stock: number;
}

export default function FlashDeals() {
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').limit(4)
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // LOGIQUE SAUVEGARDE PANIER (LocalStorage)
  const addToCart = (product: FlashProduct) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const updatedCart = [...currentCart, { ...product, quantity: 1 }]
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Optionnel: déclencher un événement pour mettre à jour l'icône du header
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const formatPrice = (p: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(p)

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-brand-primary" fill="currentColor" />
              <span className="text-caption text-brand-primary">Offres Limitées</span>
            </div>
            <h2 className="title-section">Ventes Flash</h2>
          </div>

          <div className="flex items-center gap-3 bg-brand-slate-900 text-white px-4 py-2 rounded-lg self-start">
            <span className="text-festi-xs font-bold text-slate-400">Fin dans</span>
            <span className="text-lg font-black tabular-nums">23:54:01</span>
          </div>
        </div>

        {/* GRILLE 2 COLONNES MOBILE / 4 PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {!loading && products.map((item) => (
            <div key={item.id} className="card-product group">
              {/* IMAGE ASPECT CARRE POUR PLUS DE COMPACITÉ */}
              <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100 mb-3">
                <div className="absolute top-2 left-2 z-10 bg-brand-primary text-white text-[10px] font-black px-2 py-0.5 rounded">
                  -{Math.round(((item.price - item.promo_price) / item.price) * 100)}%
                </div>
                <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>

              {/* INFOS */}
              <div className="px-1">
                <h4 className="font-bold text-brand-slate-900 text-festi-sm truncate mb-1">{item.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-festi-base font-black text-brand-primary">{formatPrice(item.promo_price)}</span>
                  <span className="text-[10px] text-slate-400 line-through">{formatPrice(item.price)}</span>
                </div>

                <button 
                  onClick={() => addToCart(item)}
                  className="btn-dark w-full py-2 text-festi-xs"
                >
                  <ShoppingCart size={14} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}