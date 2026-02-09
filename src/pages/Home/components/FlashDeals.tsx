import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Zap, ShoppingCart, ChevronRight } from 'lucide-react'
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

// CONFIGURATION DES RAYONS (Slugs exacts de ta base)
const SECTIONS = [
  { label: 'Homme', slug: 'homme' },
  { label: 'Femme', slug: 'femme' },
  { label: 'Enfant', slug: 'enfant' },
  { label: 'Électronique', slug: 'electronique' }
]

export default function FlashDeals() {
  const [groupedProducts, setGroupedProducts] = useState<Record<string, FlashProduct[]>>({})
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    async function fetchFlashProducts() {
      setLoading(true)
      try {
        // 1. Récupérer les catégories pour la hiérarchie
        const { data: allCats, error: catError } = await supabase
          .from('categories')
          .select('id, slug, name, parent_id')

        // 2. Récupérer les produits en promo
        // On retire le filtre .eq('is_featured', false) temporairement si aucun produit ne monte
        const { data: products, error: prodError } = await supabase
          .from('products')
          .select('*')
          .not('promo_price', 'is', null)
          .neq('category', 'Packeo')
          .gt('stock', 0)

        if (prodError || catError) throw prodError || catError

        if (products && allCats) {
          const groups: Record<string, FlashProduct[]> = {}
          
          SECTIONS.forEach(sec => {
            const parentCat = allCats.find(c => c.slug === sec.slug)
            
            if (parentCat) {
              // IDs de la famille (Parent + Enfants)
              const familyIds = [
                parentCat.id,
                ...allCats.filter(c => c.parent_id === parentCat.id).map(c => c.id)
              ]

              // Filtrage plus souple (ID ou Nom sans pression sur la casse)
              groups[sec.label] = products
                .filter(p => {
                  const matchId = p.category_id && familyIds.includes(p.category_id);
                  const matchName = p.category?.toLowerCase() === parentCat.name?.toLowerCase();
                  return matchId || matchName;
                })
                .slice(0, 4)
            }
          })

          setGroupedProducts(groups)
          console.log("Groupes créés :", groups) // Pour debug dans F12
        }
      } catch (err) {
        console.error("Erreur FlashDeals:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFlashProducts()

    const timer = setInterval(() => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59)
      const diff = endOfDay.getTime() - now.getTime()
      if (diff <= 0) clearInterval(timer)
      else {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const addToCart = (product: FlashProduct) => {
    const currentCart = JSON.parse(localStorage.getItem('festi-cart') || '[]')
    if (currentCart.find((item: any) => item.id === product.id)) {
      toast.info("Déjà dans le panier")
      return
    }
    localStorage.setItem('festi-cart', JSON.stringify([...currentCart, { ...product, quantity: 1 }]))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success("Ajouté !")
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' F'
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <section className="py-16 bg-slate-50/30">
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

        {/* CONTENU */}
        <div className="space-y-20">
          {SECTIONS.map((section) => {
            const sectionProducts = groupedProducts[section.label] || []
            
            // Si pas de produits après chargement, on n'affiche pas la section
            if (!loading && sectionProducts.length === 0) return null

            return (
              <div key={section.label}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
                    Rayon <span className="text-brand-primary">{section.label}</span>
                  </h3>
                  <Link 
                    to={`/shop?category=${encodeURIComponent(section.label)}`} 
                    className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
                  >
                    Voir la collection <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  {loading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-[2.5rem]" />)
                  ) : (
                    sectionProducts.map((item) => {
                      const discount = Math.round(((item.price - item.promo_price) / item.price) * 100);
                      return (
                        <div key={item.id} className="group bg-white p-3 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500">
                          <Link to={`/product/${item.id}`} className="relative block aspect-square overflow-hidden rounded-[2rem] bg-slate-50 mb-4">
                            <div className="absolute top-3 left-3 z-10 bg-brand-primary text-white text-[10px] font-black px-3 py-1 rounded-full">-{discount}%</div>
                            <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          </Link>

                          <div className="px-2 pb-2">
                            <h4 className="font-bold text-slate-900 text-sm truncate mb-1 group-hover:text-brand-primary transition-colors uppercase italic tracking-tight">
                              {item.title}
                            </h4>
                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-xl font-black text-slate-900">{formatPrice(item.promo_price)}</span>
                              <span className="text-[11px] text-slate-300 line-through font-bold">{formatPrice(item.price)}</span>
                            </div>
                            <button 
                              onClick={() => addToCart(item)}
                              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-brand-primary transition-all active:scale-95"
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
            )
          })}
        </div>
      </div>
    </section>
  )
}