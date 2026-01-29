import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Zap, ShoppingCart, Timer } from 'lucide-react'
import { Link } from 'react-router-dom' // 1. Import du Link

interface FlashProduct {
  id: string; title: string; images: string[]; promo_price: number; price: number; stock: number;
}

export default function FlashDeals() {
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .not('promo_price', 'is', null) 
        .limit(4)
      
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()

    const timer = setInterval(() => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59)
      const diff = endOfDay.getTime() - now.getTime()

      if (diff <= 0) {
        clearInterval(timer)
      } else {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const addToCart = (product: FlashProduct) => {
    const currentCart = JSON.parse(localStorage.getItem('festi-cart') || '[]')
    const updatedCart = [...currentCart, { ...product, quantity: 1 }]
    localStorage.setItem('festi-cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const pad = (n: number) => n.toString().padStart(2, '0')
  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' F'

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-brand-primary/10 p-1 rounded">
                <Zap size={14} className="text-brand-primary" fill="currentColor" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Offres Flash</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Ventes <span className="text-brand-primary">Flash</span></h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl self-start shadow-xl shadow-slate-200">
            <Timer size={16} className="text-brand-primary animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fin dans</span>
            <div className="flex items-center gap-1 font-black text-lg tabular-nums">
              <span>{pad(timeLeft.hours)}</span>
              <span className="text-brand-primary animate-pulse">:</span>
              <span>{pad(timeLeft.minutes)}</span>
              <span className="text-brand-primary animate-pulse">:</span>
              <span>{pad(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        {/* GRILLE PRODUITS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {!loading && products.map((item) => {
            const discount = Math.round(((item.price - item.promo_price) / item.price) * 100);
            
            return (
              <div key={item.id} className="group relative flex flex-col">
                {/* 2. Image entourée par Link */}
                <Link to={`/product/${item.id}`} className="block relative aspect-square overflow-hidden rounded-3xl bg-slate-100 mb-4 border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                  <div className="absolute top-3 left-3 z-10 bg-brand-primary text-white text-[10px] font-black px-2 py-1 rounded-lg">
                    -{discount}%
                  </div>
                  <img 
                    src={item.images?.[0]} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </Link>

                <div className="flex flex-col flex-grow">
                  {/* 3. Titre entouré par Link */}
                  <Link to={`/product/${item.id}`}>
                    <h4 className="font-bold text-slate-900 text-sm truncate mb-1 group-hover:text-brand-primary transition-colors italic uppercase tracking-tighter">
                      {item.title}
                    </h4>
                  </Link>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-black text-brand-primary">{formatPrice(item.promo_price)}</span>
                    <span className="text-[10px] text-slate-400 line-through font-bold">{formatPrice(item.price)}</span>
                  </div>

                  <button 
                    onClick={() => addToCart(item)}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all active:scale-95 shadow-lg shadow-slate-100"
                  >
                    <ShoppingCart size={14} />
                    Ajouter
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}