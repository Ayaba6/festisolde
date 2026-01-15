import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'
import { ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string
  promo_text: string
  color_gradient: string
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Liste étendue à 6 catégories pour le fallback
  const fallbackCategories: Category[] = [
    { id: '1', name: 'Mode & Vêtements', slug: 'mode', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', promo_text: 'Jusqu\'à -60%', color_gradient: 'from-brand-primary/80 to-pink-600/90' },
    { id: '2', name: 'Électronique', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661', promo_text: 'Jusqu\'à -50%', color_gradient: 'from-blue-600/80 to-indigo-700/90' },
    { id: '3', name: 'Maison & Déco', slug: 'maison', image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a', promo_text: 'Jusqu\'à -45%', color_gradient: 'from-orange-400/80 to-red-500/90' },
    { id: '4', name: 'Alimentation', slug: 'alimentation', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e', promo_text: 'Frais & Bio', color_gradient: 'from-emerald-500/80 to-teal-700/90' },
    { id: '5', name: 'Santé & Beauté', slug: 'sante', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9', promo_text: 'Soin Intense', color_gradient: 'from-purple-500/80 to-fuchsia-700/90' },
    { id: '6', name: 'Sport & Loisirs', slug: 'sport', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', promo_text: 'Performance', color_gradient: 'from-yellow-500/80 to-orange-600/90' }
  ]

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        // On récupère 6 catégories au lieu de 3
        const { data, error } = await supabase.from('categories').select('*').limit(6)
        
        if (error || !data || data.length === 0) {
          setCategories(fallbackCategories)
        } else {
          setCategories(data)
        }
      } catch (err) {
        setCategories(fallbackCategories)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="py-12 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER */}
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-3 tracking-tighter italic">
            Explorer par <span className="text-brand-primary">catégorie</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">
            Trouvez les meilleures offres de Ouagadougou dans votre catégorie préférée.
          </p>
        </div>

        {/* GRILLE : Responsive 1 -> 2 -> 3 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 lg:h-80 bg-slate-50 animate-pulse rounded-[2rem]" />
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.name}`} // Lien vers la boutique avec filtre
                className="group relative h-64 lg:h-80 overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image de fond */}
                <img 
                  src={cat.image_url} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay dynamique */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color_gradient} opacity-70 group-hover:opacity-85 transition-opacity duration-500`} />
                
                {/* Contenu Texte */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-90 drop-shadow-sm">
                    {cat.promo_text}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl lg:text-3xl font-black leading-tight tracking-tighter italic">
                      {cat.name}
                    </h3>
                    <div className="bg-white text-gray-900 p-3 rounded-2xl shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}