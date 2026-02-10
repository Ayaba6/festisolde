import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Zap, ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

interface FlashProduct {
  id: string;
  title: string;
  images: string[];
  promo_price: number;
  price: number;
  stock: number;
  category: string;
  category_id?: string;
}

const SECTIONS = [
  { label: 'Homme', slug: 'homme' },
  { label: 'Femme', slug: 'femme' },
  { label: 'Enfant', slug: 'enfant' },
  { label: 'Électronique', slug: 'electronique' }
]

// --- COMPOSANT DE RANGÉE AVEC SCROLL ---
function FlashRow({ title, products, loading, formatPrice, addToCart }: any) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <div className="relative group/row">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
          Rayon <span className="text-brand-primary">{title}</span>
        </h3>
        <Link 
          to={`/shop?category=${encodeURIComponent(title)}`} 
          className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
        >
          Voir tout <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* FLÈCHES DE NAVIGATION */}
      <button 
        onClick={() => scroll('left')}
        className="absolute -left-4 top-[50%] -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100 opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 hidden lg:flex"
      >
        <ChevronLeft size={24} className="text-slate-900" />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute -right-4 top-[50%] -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100 opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 hidden lg:flex"
      >
        <ChevronRight size={24} className="text-slate-900" />
      </button>

      {/* CONTENEUR DE SCROLL */}
      <div 
        ref={rowRef}
        className="flex gap-4 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-8 px-2"
      >
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[280px] aspect-[4/5] bg-slate-100 animate-pulse rounded-[2.5rem]" />
          ))
        ) : (
          products.map((item: FlashProduct) => {
            const discount = Math.round(((item.price - item.promo_price) / item.price) * 100);
            return (
              <div 
                key={item.id} 
                className="min-w-[260px] lg:min-w-[300px] bg-white p-3 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500"
              >
                <Link to={`/product/${item.id}`} className="relative block aspect-square overflow-hidden rounded-[2rem] bg-slate-50 mb-4">
                  <div className="absolute top-3 left-3 z-10 bg-brand-primary text-white text-[10px] font-black px-3 py-1 rounded-full">-{discount}%</div>
                  <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </Link>

                <div className="px-2 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate mb-1 uppercase italic tracking-tight italic">
                    {item.title}
                  </h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-black text-slate-900">{formatPrice(item.promo_price)}</span>
                    <span className="text-[11px] text-slate-300 line-through font-bold">{formatPrice(item.price)}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-brand-primary transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    <ShoppingCart size={14} /> Vite !
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}

// --- COMPOSANT PRINCIPAL ---
export default function FlashDeals() {
  const [groupedProducts, setGroupedProducts] = useState<Record<string, FlashProduct[]>>({})
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    async function fetchFlashProducts() {
      setLoading(true)
      try {
        const { data: allCats } = await supabase.from('categories').select('id, slug, name, parent_id')
        const { data: products } = await supabase.from('products').select('*').not('promo_price', 'is', null).neq('category', 'Packeo').gt('stock', 0)

        if (products && allCats) {
          const groups: Record<string, FlashProduct[]> = {}
          SECTIONS.forEach(sec => {
            const parentCat = allCats.find(c => c.slug === sec.slug)
            if (parentCat) {
              const familyIds = [parentCat.id, ...allCats.filter(c => c.parent_id === parentCat.id).map(c => c.id)]
              groups[sec.label] = products.filter(p => (p.category_id && familyIds.includes(p.category_id)) || (p.category?.toLowerCase() === parentCat.name?.toLowerCase()))
            }
          })
          setGroupedProducts(groups)
        }
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    fetchFlashProducts()

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59);
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) clearInterval(timer);
      else {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [])

  const addToCart = (product: FlashProduct) => {
    const currentCart = JSON.parse(localStorage.getItem('festi-cart') || '[]')
    if (currentCart.find((item: any) => item.id === product.id)) {
      toast.info("Déjà dans le panier"); return;
    }
    localStorage.setItem('festi-cart', JSON.stringify([...currentCart, { ...product, quantity: 1 }]))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success("Ajouté !")
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' F'
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <section className="py-16 bg-slate-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-brand-primary p-1 rounded-md">
                <Zap size={14} className="text-white" fill="currentColor" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">Offres Chrono</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Ventes <span className="text-brand-primary">Flash</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 text-white p-1 pl-5 rounded-2xl shadow-2xl">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expire dans</span>
             <div className="bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-2xl font-black text-brand-primary">
                {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
             </div>
          </div>
        </div>

        {/* CONTENU - Chaque section est maintenant une rangée scrollable */}
        <div className="space-y-16">
          {SECTIONS.map((section) => (
            <FlashRow 
              key={section.label}
              title={section.label}
              products={groupedProducts[section.label] || []}
              loading={loading}
              formatPrice={formatPrice}
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}