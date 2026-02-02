import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Wand2, 
  Layers 
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

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
      } catch (error: any) {
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

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' F'

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

        {/* CARROUSEL EXISTANT */}
        <div 
          className="relative overflow-hidden mb-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (window.innerWidth >= 1024 ? 50 : 100)}%)` }}
          >
            {packs.map((pack: any) => (
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

        {/* --- NOUVELLE BANNIÈRE : ATELIER DE COMPOSITION --- */}
        <div 
          onClick={() => navigate('/pack-creator')}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent border-2 border-brand-primary/20 p-6 md:p-8 cursor-pointer group hover:border-brand-primary/50 transition-all active:scale-[0.99]"
        >
          {/* Déco en arrière-plan */}
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Layers size={140} className="translate-x-12 translate-y-4 -rotate-12" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-500">
                <Wand2 size={30} className="text-brand-dark" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic leading-none">
                  Compose ton propre <span className="text-brand-primary text-2xl md:text-3xl">Pack</span>
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center justify-center md:justify-start gap-2">
                  Mélange 3 articles <ArrowRight size={10} /> <span className="text-white">-15% de remise</span>
                </p>
              </div>
            </div>
            
            <button className="px-10 py-4 bg-brand-primary text-brand-dark rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-brand-primary/10 group-hover:bg-white transition-colors">
              Lancer l'atelier
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}