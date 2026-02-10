import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom' 

interface Category {
  id: string
  name: string
  image_url?: string
  product_count: number
  slug: string
}

interface QuickNavProps {
  onCategorySelect?: (name: string) => void;
  activeCategory?: string;
}

export default function QuickCategoryNav({ onCategorySelect, activeCategory }: QuickNavProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setLoading(true)
        const { data: allCats } = await supabase.from('categories').select('id, name, image_url, slug, parent_id')
        const { data: allProds } = await supabase.from('products').select('category_id')

        if (allCats && allProds) {
          const parents = allCats.filter(c => c.parent_id === null)
          const formatted = parents.map(parent => {
            const childrenIds = allCats.filter(c => c.parent_id === parent.id).map(c => c.id)
            const familyIds = [parent.id, ...childrenIds]
            const count = allProds.filter(p => familyIds.includes(p.category_id)).length

            return {
              id: parent.id,
              name: parent.name,
              slug: parent.slug,
              image_url: parent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(parent.name)}&background=f3f4f6&color=1f2937&bold=true`,
              product_count: count
            }
          })
          setCategories(formatted)
        }
      } catch (err) {
        console.error("Erreur:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategoriesData()
  }, [])

  return (
    <section className="py-8 bg-white border-b border-gray-100 relative group/section">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-1.5 bg-red-600 rounded-lg shadow-md shadow-red-100">
            <Sparkles className="text-white" size={14} />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 italic">
            Explorer les catégories
          </h2>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => scroll('left')} 
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl border border-gray-100 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-gray-50 hover:scale-110"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div ref={scrollRef} className="flex items-start gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2">
            
            {/* LIEN TOUS -> Vers /shop sans filtre */}
            <Link 
              to="/shop"
              className="flex-shrink-0 flex flex-col items-center gap-3 w-20 group transition-transform"
            >
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                activeCategory === 'Tous' 
                ? 'border-red-600 bg-red-600 shadow-lg shadow-red-100 scale-110' 
                : 'border-gray-200 hover:border-red-400 bg-gray-50'
              }`}>
                <span className={`text-[10px] font-black italic ${activeCategory === 'Tous' ? 'text-white' : 'text-gray-400'}`}>TOUS</span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-tighter ${activeCategory === 'Tous' ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-900'}`}>Global</p>
            </Link>

            {/* LISTE DES CATÉGORIES -> Vers /shop?category=Nom */}
            {loading ? [...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full animate-pulse border-2 border-transparent" />
            )) : categories.map((cat) => (
              <Link 
                key={cat.id}
                // ICI : Redirection vers /shop avec le paramètre de catégorie
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="flex-shrink-0 flex flex-col items-center gap-3 w-20 group transition-transform"
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 relative ${
                  activeCategory === cat.name 
                  ? 'border-red-600 shadow-lg shadow-red-100 scale-110' 
                  : 'border-gray-100 hover:border-gray-300 shadow-sm'
                }`}>
                  <img 
                    src={cat.image_url} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`} 
                    alt={cat.name} 
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-black uppercase italic truncate w-20 transition-colors ${
                    activeCategory === cat.name ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-900'
                  }`}>
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')} 
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl border border-gray-100 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-gray-50 hover:scale-110"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}