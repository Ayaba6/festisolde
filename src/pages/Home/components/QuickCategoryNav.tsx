import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  image_url?: string
  product_count?: number
  slug: string
}

export default function QuickCategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setLoading(true)
        // 1. On récupère uniquement les catégories PARENTES
        const { data: cats, error: catError } = await supabase
          .from('categories')
          .select(`
            id, 
            name, 
            image_url, 
            slug,
            products:products(count)
          `)
          .is('parent_id', null) // Filtre les sous-catégories
          .order('name', { ascending: true })
          .limit(12)

        if (catError) throw catError

        if (cats) {
          const formatted = cats.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            // Utilise l'image uploadée, sinon l'avatar par défaut
            image_url: cat.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=0f172a&color=fff&bold=true&font-size=0.33`,
            product_count: cat.products?.[0]?.count || 0
          }))
          setCategories(formatted)
        }
      } catch (err: any) {
        console.error("Erreur récupération catégories:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategoriesData()
  }, [])

  return (
    <section className="py-8 bg-white border-b border-slate-50 relative group/section">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center">
              <Sparkles className="text-indigo-600" size={14} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Nos Rayons</h2>
          </div>
          <Link to="/shop" className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            Tout voir
          </Link>
        </div>
        
        <div className="relative">
          {/* Flèche Gauche */}
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 top-10 z-10 w-8 h-8 bg-white shadow-lg rounded-full hidden md:flex items-center justify-center border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all opacity-0 group-hover/section:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Zone de Scroll */}
          <div 
            ref={scrollRef}
            className="flex items-start gap-5 md:gap-10 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          >
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-2 w-10 bg-slate-50 rounded animate-pulse" />
                </div>
              ))
            ) : categories.map((cat) => (
              <Link 
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="flex-shrink-0 group flex flex-col items-center gap-3 w-20 md:w-24 transition-transform active:scale-95"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-slate-50 group-hover:border-indigo-600 transition-all duration-300 shadow-sm">
                  <img 
                    src={cat.image_url} 
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate w-full px-1 italic uppercase">
                    {cat.name}
                  </p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                    {cat.product_count} articles
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Flèche Droite */}
          <button 
            onClick={() => scroll('right')}
            className="absolute -right-4 top-10 z-10 w-8 h-8 bg-white shadow-lg rounded-full hidden md:flex items-center justify-center border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all opacity-0 group-hover/section:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}