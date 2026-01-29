import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { ChevronRight, Package, ArrowRight } from 'lucide-react'

// Tes images locales
import imgMode from '@/assets/categorie/mode.jpg'
import imgSante from '@/assets/categorie/sante.jpg'
import imgElectronique from '@/assets/categorie/electronique.jpg'
import imgPackeo from '@/assets/categorie/packeo.jpg'
import imgBeaute from '@/assets/categorie/beaute.jpg'
import imgAutres from '@/assets/categorie/autres.jpg'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string
  promo_text: string
  color_gradient: string
  product_count?: number
}

// Ordre de priorité : on affichera les 3 premiers
const ORDER = ['Packeo', 'Sport', 'Mode & Beauté', 'Électronique', 'Santé', 'Autres']

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackCategories: Category[] = [
    { id: '1', name: 'Packeo', slug: 'packeo', image_url: imgPackeo, promo_text: 'Offres Spéciales', color_gradient: 'from-brand-dark/90 to-brand-primary/90' },
    { id: '2', name: 'Sport', slug: 'sport', image_url: imgMode, promo_text: 'Performance', color_gradient: 'from-yellow-500/80 to-orange-600/90' },
    { id: '3', name: 'Mode & Beauté', slug: 'mode', image_url: imgMode, promo_text: 'Jusqu\'à -60%', color_gradient: 'from-brand-primary/80 to-pink-600/90' },
  ]

  useEffect(() => {
    async function fetchCategoriesAndCounts() {
      try {
        setLoading(true)
        const { data: cats } = await supabase.from('categories').select('*')
        
        let baseCategories = (cats && cats.length > 0) ? cats : fallbackCategories

        const enriched = await Promise.all(
          baseCategories.map(async (cat) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category', cat.name)

            const fallback = fallbackCategories.find(f => f.name === cat.name) || fallbackCategories[0]

            return {
              ...cat,
              product_count: count || 0,
              image_url: cat.image_url || fallback.image_url,
              color_gradient: cat.color_gradient || fallback.color_gradient,
              promo_text: cat.promo_text || fallback.promo_text
            }
          })
        )

        // Tri et limitation aux 3 premiers
        const sorted = enriched.sort((a, b) => {
          const indexA = ORDER.indexOf(a.name);
          const indexB = ORDER.indexOf(b.name);
          return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        });

        setCategories(sorted.slice(0, 3))
      } catch (err) {
        console.error(err)
        setCategories(fallbackCategories.slice(0, 3))
      } finally {
        setLoading(false)
      }
    }
    fetchCategoriesAndCounts()
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER AVEC BOUTON VERS SHOP (DESKTOP) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6 border-l-4 border-brand-primary pl-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl lg:text-6xl font-black text-gray-900 mb-2 tracking-tighter italic uppercase"
            >
              Le top par <span className="text-brand-primary">catégorie</span>
            </motion.h2>
            <p className="text-gray-500 font-bold text-sm lg:text-lg italic uppercase tracking-widest opacity-70">
              Découvrez la sélection de la semaine.
            </p>
          </div>
          
          <Link 
            to="/shop" 
            className="hidden md:flex items-center gap-4 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-brand-primary transition-all duration-300 shadow-xl shadow-gray-200"
          >
            Aller à la boutique <ArrowRight size={18} />
          </Link>
        </div>

        {/* GRILLE : 3 CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 lg:h-[480px] bg-slate-50 animate-pulse rounded-[3rem]" />
            ))
          ) : (
            categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group relative block h-80 lg:h-[480px] overflow-hidden rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 bg-slate-900"
                >
                  {/* Badge Compteur */}
                  <div className="absolute top-8 left-8 z-20">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 text-white shadow-2xl">
                      <Package size={14} className="text-brand-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {cat.product_count} articles
                      </span>
                    </div>
                  </div>

                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-40"
                  />
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color_gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-700`} />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-end text-white z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 bg-brand-primary text-white w-fit px-5 py-2 rounded-full shadow-lg border border-white/20">
                      {cat.promo_text}
                    </span>
                    
                    <div className="flex items-end justify-between gap-4">
                      <h3 className="text-4xl lg:text-5xl font-black leading-none tracking-tighter italic uppercase break-words">
                        {cat.name}
                      </h3>
                      <div className="bg-white text-brand-dark p-4 rounded-3xl shadow-2xl opacity-0 translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <ChevronRight size={28} strokeWidth={4} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* BOUTON SHOP (MOBILE UNIQUEMENT) */}
        <div className="flex md:hidden justify-center mt-8">
          <Link 
            to="/shop" 
            className="flex items-center justify-center w-full gap-4 bg-gray-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl"
          >
            Accéder à la boutique <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}