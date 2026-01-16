import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { ChevronRight } from 'lucide-react'

// On importe tes images locales pour les utiliser dans le fallback
import shoes1 from '@/assets/slider/shoes_1.jpg'
import shoes2 from '@/assets/slider/shoes_2.jpg'
import shoes3 from '@/assets/slider/shoes_3.jpg'
import shoes4 from '@/assets/slider/shoes_4.jpg'

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

  // Liste exacte de tes 6 catégories avec tes textes
  const fallbackCategories: Category[] = [
    { id: '1', name: 'Mode & Vêtements', slug: 'mode', image_url: shoes1, promo_text: 'Jusqu\'à -60%', color_gradient: 'from-brand-primary/80 to-pink-600/90' },
    { id: '2', name: 'Électronique', slug: 'electronics', image_url: shoes2, promo_text: 'Jusqu\'à -50%', color_gradient: 'from-blue-600/80 to-indigo-700/90' },
    { id: '3', name: 'Maison & Déco', slug: 'maison', image_url: shoes3, promo_text: 'Jusqu\'à -45%', color_gradient: 'from-orange-400/80 to-red-500/90' },
    { id: '4', name: 'Alimentation', slug: 'alimentation', image_url: shoes4, promo_text: 'Frais & Bio', color_gradient: 'from-emerald-500/80 to-teal-700/90' },
    { id: '5', name: 'Santé & Beauté', slug: 'sante', image_url: shoes1, promo_text: 'Soin Intense', color_gradient: 'from-purple-500/80 to-fuchsia-700/90' },
    { id: '6', name: 'Sport & Loisirs', slug: 'sport', image_url: shoes2, promo_text: 'Performance', color_gradient: 'from-yellow-500/80 to-orange-600/90' }
  ]

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('categories').select('*').limit(6)
        
        if (error || !data || data.length === 0) {
          setCategories(fallbackCategories)
        } else {
          // On injecte les images locales si l'URL Supabase est vide
          const enrichedData = data.map((cat, i) => ({
            ...cat,
            image_url: cat.image_url || fallbackCategories[i].image_url,
            color_gradient: cat.color_gradient || fallbackCategories[i].color_gradient,
            promo_text: cat.promo_text || fallbackCategories[i].promo_text
          }))
          setCategories(enrichedData)
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
    <section className="py-12 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER EXACT */}
        <div className="text-center mb-10 lg:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase"
          >
            Explorer par <span className="text-brand-primary">catégorie</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-xl mx-auto font-medium text-lg"
          >
            Trouvez les meilleures offres de Ouagadougou dans votre catégorie préférée.
          </motion.p>
        </div>

        {/* GRILLE : 6 CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-72 lg:h-[400px] bg-slate-50 animate-pulse rounded-[3rem]" />
            ))
          ) : (
            categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?category=${cat.name}`}
                  className="group relative block h-72 lg:h-[400px] overflow-hidden rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-brand-dark"
                >
                  {/* Image de fond avec zoom */}
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                  />
                  
                  {/* Overlay dynamique */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color_gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-500 mix-blend-multiply`} />
                  
                  {/* Contenu Texte */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-end text-white z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-90 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20">
                      {cat.promo_text}
                    </span>
                    
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl lg:text-4xl font-black leading-tight tracking-tighter italic uppercase">
                        {cat.name}
                      </h3>
                      <div className="bg-white text-gray-900 p-3 rounded-2xl shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}