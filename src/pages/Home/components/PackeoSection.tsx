import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Wand2 
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

export default function PackeoSection() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const navigate = useNavigate()
  
  // Configuration pour afficher MAXIMUM 4 éléments
  const [itemsPerPage, setItemsPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(4)      // Desktop : 4 images
      else if (window.innerWidth >= 768) setItemsPerPage(2)  // Tablette : 2 images
      else setItemsPerPage(1.2)                              // Mobile : 1.2 (aperçu du suivant)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchPackeos() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'Packeo')
          .order('created_at', { ascending: false })
        if (error) throw error
        setPacks(data || [])
      } catch (error: any) {
        console.error('Erreur:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPackeos()
  }, [])

  const maxIndex = Math.max(0, packs.length - Math.floor(itemsPerPage))

  const nextSlide = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  const prevSlide = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))

  useEffect(() => {
    if (isPaused || packs.length <= itemsPerPage) return
    const interval = setInterval(() => nextSlide(), 4000)
    return () => clearInterval(interval)
  }, [currentIndex, isPaused, packs.length, itemsPerPage])

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' F'

  if (loading || packs.length === 0) return null 

  return (
    <section className="py-12 bg-brand-dark text-white border-y border-white/5 overflow-hidden">
      {/* max-w-7xl est idéal pour 4 colonnes */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary/20 p-2 rounded-lg">
                <Sparkles size={22} className="text-brand-primary" fill="currentColor" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">
                Les <span className="text-brand-primary">Packeo</span>
              </h2>
            </div>
            
            <Link 
              to="/products?category=Packeo" 
              className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-white/40 hover:text-brand-primary transition-all group border-b border-transparent hover:border-brand-primary/30 pb-1"
            >
              Voir plus
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-brand-primary" />
            </Link>
          </div>

          <div className="hidden md:flex gap-2">
            <button onClick={prevSlide} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-brand-dark transition-all duration-300">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-brand-dark transition-all duration-300">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* CARROUSEL 4 IMAGES */}
        <div 
          className="relative mb-16 cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
          >
            {packs.map((pack: any) => (
              <div 
                key={pack.id} 
                className="flex-shrink-0 px-2 md:px-4"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-4 group hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
                  
                  <Link to={`/product/${pack.id}`} className="block aspect-[4/5] overflow-hidden rounded-[2rem] mb-5 bg-black/20">
                    <img 
                      src={pack.images?.[0] || '/placeholder.png'} 
                      alt={pack.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  </Link>

                  <div className="px-1 pb-1 space-y-4">
                    <div className="h-14 overflow-hidden">
                      <h3 className="font-bold text-[14px] md:text-[15px] uppercase truncate text-white/80 group-hover:text-white transition-colors tracking-tight">
                        {pack.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-primary font-black text-lg md:text-xl tracking-tighter">
                          {formatPrice(pack.promo_price || pack.price)}
                        </span>
                        <span className="text-[10px] text-white/10 line-through">
                          {formatPrice(pack.price)}
                        </span>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-white/5 group-hover:bg-brand-primary group-hover:text-brand-dark rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 border border-white/5">
                      <ShoppingCart size={16} strokeWidth={3} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BANNIÈRE ATELIER */}
        <div 
          onClick={() => navigate('/pack-creator')}
          className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-r from-brand-primary/20 via-brand-primary/5 to-transparent border border-white/5 p-8 md:p-12 cursor-pointer group transition-all duration-500 shadow-2xl"
        >
          <div className="absolute right-[-5%] top-[-10%] opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
            <Wand2 size={240} className="-rotate-12 text-white" />
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[1.8rem] bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Wand2 size={32} className="text-brand-dark" strokeWidth={2.5} />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">
                  Crée ton propre <span className="text-brand-primary">Pack</span>
                </h3>
                <p className="text-slate-500 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] mt-3">
                   Mélange 4 articles • <span className="text-white bg-white/5 px-2 py-1 rounded">-15% SUR LE TOTAL</span>
                </p>
              </div>
            </div>
            
            <button className="w-full md:w-auto px-12 py-5 bg-white text-brand-dark rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-brand-primary transition-all duration-300 shadow-xl group-hover:translate-x-2">
              Lancer l'Atelier
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}