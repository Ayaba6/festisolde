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

  // Données de secours stylisées selon festi10.PNG
  const fallbackCategories = [
    { id: '1', name: 'Mode & Vêtements', slug: 'mode', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', promo_text: 'Jusqu\'à -60%', color_gradient: 'from-rose-500/80 to-pink-600/90' },
    { id: '2', name: 'Électronique', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661', promo_text: 'Jusqu\'à -50%', color_gradient: 'from-blue-600/80 to-indigo-700/90' },
    { id: '3', name: 'Maison & Déco', slug: 'maison', image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a', promo_text: 'Jusqu\'à -45%', color_gradient: 'from-orange-400/80 to-red-500/90' }
  ]

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(3)

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
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER DE LA SECTION */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
            Explorer par catégorie
          </h2>
          <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
            Trouvez les meilleures offres dans votre catégorie préférée
          </p>
        </div>

        {/* GRILLE DE CATÉGORIES STYLISÉES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-[2.5rem]" />
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative h-80 overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                {/* Image de fond */}
                <img 
                  src={cat.image_url} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Overlay Coloré avec Dégradé */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color_gradient} opacity-90 group-hover:opacity-95 transition-opacity`} />
                
                {/* Contenu Texte */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end text-left text-white">
                  <span className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">
                    {cat.promo_text}
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black leading-tight tracking-tight">
                      {cat.name}
                    </h3>
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-md translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                      <ChevronRight size={24} />
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