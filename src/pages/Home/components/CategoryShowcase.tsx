import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'
import { ChevronRight, LayoutGrid } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon_url?: string // Supposons que vous stockiez une URL ou un nom d'icône
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, icon_url')
          .order('name')
          .limit(6) // On ne garde que les plus populaires pour la vitrine

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        console.error("Erreur catégories:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (!loading && categories.length === 0) return null

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">
            <LayoutGrid size={16} />
            <span>Explorer</span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            Parcourir par univers
          </h3>
        </div>
        
        <Link 
          to="/categories" 
          className="group flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          Voir tout 
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {loading 
          ? Array(6).fill(0).map((_, i) => <SkeletonCircle key={i} />)
          : categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug || cat.name.toLowerCase()}`}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-square bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/10 group-hover:-translate-y-2 transition-all duration-300">
                {cat.icon_url ? (
                  <img src={cat.icon_url} alt={cat.name} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {cat.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors text-sm md:text-base">
                {cat.name}
              </span>
            </Link>
          ))}
      </div>
    </section>
  )
}

// --- SKELETON LOADING ---
const SkeletonCircle = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="w-full aspect-square bg-gray-100 rounded-[2rem] mb-4" />
    <div className="h-4 w-16 bg-gray-100 rounded" />
  </div>
)