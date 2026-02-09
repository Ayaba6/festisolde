import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  image_url?: string
  product_count: number
  slug: string
}

// AJOUT : Props pour communiquer avec PackCreator
interface QuickNavProps {
  onCategorySelect: (name: string) => void;
  activeCategory: string;
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
              image_url: parent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(parent.name)}&background=ffbf00&color=000&bold=true`,
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
    <section className="py-6 bg-black/40 backdrop-blur-md border-b border-white/5 relative group/section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-brand-primary" size={14} />
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Styles disponibles</h2>
        </div>
        
        <div className="relative">
          <button onClick={() => scroll('left')} className="absolute -left-4 top-8 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black shadow-xl opacity-0 group-hover/section:opacity-100 transition-opacity">
            <ChevronLeft size={18} />
          </button>

          <div ref={scrollRef} className="flex items-start gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
            {/* BOUTON "TOUS" */}
            <button 
              onClick={() => onCategorySelect('Tous')}
              className={`flex-shrink-0 flex flex-col items-center gap-3 w-20 transition-all ${activeCategory === 'Tous' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
            >
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${activeCategory === 'Tous' ? 'border-brand-primary bg-brand-primary/10' : 'border-white/10'}`}>
                <span className="text-[10px] font-black italic">TOUS</span>
              </div>
              <p className="text-[9px] font-black uppercase text-center tracking-tighter">Global</p>
            </button>

            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-full animate-pulse" />
            )) : categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => onCategorySelect(cat.name)}
                className={`flex-shrink-0 flex flex-col items-center gap-3 w-20 transition-all ${activeCategory === cat.name ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${activeCategory === cat.name ? 'border-brand-primary shadow-neon' : 'border-white/10'}`}>
                  <img src={cat.image_url} className="w-full h-full object-cover" alt={cat.name} />
                </div>
                <div className="text-center">
                  <p className={`text-[9px] font-black uppercase italic truncate w-20 ${activeCategory === cat.name ? 'text-brand-primary' : 'text-white'}`}>
                    {cat.name}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button onClick={() => scroll('right')} className="absolute -right-4 top-8 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black shadow-xl opacity-0 group-hover/section:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}