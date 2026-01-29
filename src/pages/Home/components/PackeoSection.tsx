import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ShoppingCart, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom' // Ajout de Link

export default function PackeoSection() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const navigate = useNavigate()

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
      } catch (error) {
        console.error('Erreur:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPackeos()
  }, [])

  // LOGIQUE CARROUSEL
  const maxIndex = packs.length > 2 ? packs.length - 2 : 0
  const nextSlide = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  const prevSlide = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))

  useEffect(() => {
    if (isPaused || packs.length <= 2) return
    const interval = setInterval(() => nextSlide(), 5000)
    return () => clearInterval(interval)
  }, [currentIndex, isPaused, packs.length])

  const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' F'

  if (loading || packs.length === 0) return null 

  return (
    <section className="py-12 bg-brand-dark text-white border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER COMPACT */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-primary/10 p-2 rounded-xl">
              <Sparkles size={20} className="text-brand-primary" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tighter uppercase italic">
                Les <span className="text-brand-primary">Packeo</span>
              </h2>
              <button 
                onClick={() => navigate('/category/packeo')}
                className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-brand-primary transition-colors"
              >
                Voir tout <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={prevSlide} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-brand-primary transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextSlide} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-brand-primary transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CARROUSEL */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (window.innerWidth >= 1024 ? 50 : 100)}%)` }}
          >
            {packs.map((pack) => (
              <div key={pack.id} className="w-full lg:w-1/2 flex-shrink-0 px-2">
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                  
                  {/* IMAGE CLIQUABLE */}
                  <Link 
                    to={`/product/${pack.id}`} 
                    className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden rounded-xl flex-shrink-0 bg-white/5 block"
                  >
                    <img 
                      src={pack.images?.[0] || '/placeholder.png'} 
                      alt={pack.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </Link>

                  {/* TEXTE ET PRIX */}
                  <div className="flex flex-col justify-between h-32 sm:h-40 py-1 flex-1">
                    <div>
                      <Link to={`/product/${pack.id}`}>
                        <h3 className="font-black text-white text-base sm:text-lg truncate uppercase mb-1 tracking-tight group-hover:text-brand-primary transition-colors">
                          {pack.title}
                        </h3>
                      </Link>
                      <p className="text-slate-500 text-[11px] leading-snug line-clamp-2 italic">
                        {pack.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-600 line-through font-bold">{formatPrice(pack.price)}</span>
                        <span className="text-xl font-black text-brand-primary tracking-tighter">
                          {formatPrice(pack.promo_price || pack.price)}
                        </span>
                      </div>
                      
                      <button className="p-2.5 bg-brand-primary text-brand-dark rounded-lg hover:bg-white transition-all shadow-lg shadow-brand-primary/10 active:scale-90">
                        <ShoppingCart size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}