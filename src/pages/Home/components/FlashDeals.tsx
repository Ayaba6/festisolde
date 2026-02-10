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

// --- COMPOSANT DE RANGÉE COMPACTE ---
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
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
          Rayon <span className="text-brand-primary">{title}</span>
        </h3>
        <Link 
          to={`/shop?category=${encodeURIComponent(title)}`} 
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
        >
          Voir tout
        </Link>
      </div>

      <button 
        onClick={() => scroll('left')}
        className="absolute -left-2 top-[35%] -translate-y-1/2 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 opacity-0 group-hover/row:opacity-100 transition-all hidden lg:flex"
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute -right-2 top-[35%] -translate-y-1/2 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 opacity-0 group-hover/row:opacity-100 transition-all hidden lg:flex"
      >
        <ChevronRight size={20} />
      </button>

      <div 
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6 px-2"
      >
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[200px] h-[280px] bg-slate-100 animate-pulse rounded-[2rem]" />
          ))
        ) : (
          products.map((item: FlashProduct) => {
            const discount = Math.round(((item.price - item.promo_price) / item.price) * 100);
            return (
              <div 
                key={item.id} 
                className="group min-w-[200px] lg:min-w-[220px] bg-white p-3 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                {/* ZONE IMAGE */}
                <Link to={`/product/${item.id}`} className="relative block w-full h-[150px] overflow-hidden rounded-[1.5rem] bg-slate-50/50 mb-3">
                  <div className="absolute top-2 left-2 z-10 bg-brand-primary text-[9px] text-white font-black px-2 py-0.5 rounded-full shadow-sm">
                    -{discount}%
                  </div>
                  <img 
                    src={item.images?.[0]} 
                    alt={item.title} 
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
                  />
                </Link>

                <div className="px-1 text-center">
                  <h4 className="font-bold text-slate-900 text-[11px] truncate mb-1 uppercase italic">
                    {item.title}
                  </h4>
                  
                  {/* ZONE PRIX MISE À JOUR : ROUGE POUR PROMO / NOIR POUR RÉEL */}
                  <div className="flex flex-col items-center gap-0 mb-3">
                    <span className="text-lg font-black text-red-600 leading-tight">
                      {formatPrice(item.promo_price)}
                    </span>
                    <span className="text-[9px] text-slate-900 line-through font-bold opacity-40">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary transition-all active:scale-95"
                  >
                    <ShoppingCart size={12} /> Acheter
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
    <section className="py-12 bg-slate-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
              Ventes <span className="text-brand-primary">Flash</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl">
             <span className="text-[9px] font-bold uppercase text-slate-400">Expire dans</span>
             <div className="font-mono text-xl font-black text-brand-primary">
                {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
             </div>
          </div>
        </div>

        <div className="space-y-12">
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