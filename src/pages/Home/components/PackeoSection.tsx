import { useState, useEffect } from 'react'
import { Plus, ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

export default function PackeoSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const packs = [
    {
      id: 1,
      title: "Pack Élégance Urbaine",
      slogan: "Le style sans effort, de la tête aux pieds.",
      oldPrice: 65000,
      newPrice: 42500,
      image: "https://images.unsplash.com/photo-1594932224828-b4b059b8fe0e?q=80&w=600",
      items: ["Chemise Slim", "Pantalon Chino", "Mocassins Cuir", "Montre Classique"]
    },
    {
      id: 2,
      title: "Pack Casual Chic",
      slogan: "Confort et tendance pour toutes vos sorties.",
      oldPrice: 55000,
      newPrice: 35000,
      image: "https://images.unsplash.com/photo-1552831388-6a0b3575b32a?q=80&w=600",
      items: ["T-shirt Premium", "Jean Cargo", "Sneakers Blanches", "Casquette Design"]
    },
    {
      id: 3,
      title: "Pack Business Femme",
      slogan: "Affirmez votre professionnalisme avec audace.",
      oldPrice: 75000,
      newPrice: 45000,
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600",
      items: ["Veste Ajustée", "Jupe Crayon", "Escarpins Confort", "Sac à Main Cuir"]
    },
    {
      id: 4,
      title: "Pack Sport & Détente",
      slogan: "Pour vos sessions training ou vos moments chill.",
      oldPrice: 40000,
      newPrice: 25000,
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600",
      items: ["Ensemble Athlétique", "Gourde Isotherme", "Running Pro", "Montre Connectée"]
    }
  ]

  const maxIndex = packs.length - 2

  const nextSlide = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  const prevSlide = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => nextSlide(), 5000)
    return () => clearInterval(interval)
  }, [currentIndex, isPaused])

  const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' F CFA'

  return (
    <section className="py-20 bg-brand-dark text-white border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-brand-primary" fill="currentColor" />
              <span className="text-[11px] font-black uppercase tracking-widest text-brand-primary">L'art du bon plan</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
              Les <span className="text-brand-primary italic">Packeo</span> du moment
            </h2>
            <p className="text-slate-400 max-w-md mt-3 text-lg">
              Créez votre style complet sans casser la tirelire. Des tenues parfaites à prix déstockés.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={prevSlide} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-primary hover:text-brand-dark transition-all active:scale-90">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-primary hover:text-brand-dark transition-all active:scale-90">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* CARROUSEL CONTAINER */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * (window.innerWidth >= 1024 ? 50 : 100)}%)` }}
          >
            {packs.map((pack) => (
              <div key={pack.id} className="w-full lg:w-1/2 flex-shrink-0 px-3">
                <div className="flex flex-col gap-5 p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-primary/50 transition-all group">
                  
                  {/* IMAGE */}
                  <div className="w-full h-64 sm:h-72 lg:h-80 overflow-hidden rounded-xl bg-white/10">
                    <img 
                      src={pack.image} 
                      alt={pack.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>

                  {/* INFOS */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-2xl truncate mb-2">{pack.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{pack.slogan}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      {pack.items.map((item, i) => (
                        <span key={i} className="text-[10px] font-medium bg-white/10 text-slate-300 px-3 py-1 rounded-md border border-white/10">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* PRIX ET BOUTON */}
                  <div className="flex items-center justify-between gap-4 mt-auto border-t border-white/10 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 line-through font-bold">{formatPrice(pack.oldPrice)}</span>
                      <span className="text-3xl font-black text-brand-primary tracking-tighter">{formatPrice(pack.newPrice)}</span>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-primary text-brand-dark px-6 py-3 rounded-xl text-sm font-black hover:bg-white hover:scale-105 transition-all shadow-lg shadow-brand-primary/20">
                      <ShoppingCart size={18} strokeWidth={2.5} />
                      <span className="hidden sm:inline">Je profite</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INDICATEURS */}
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(maxIndex + 1)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${currentIndex === i ? 'w-10 bg-brand-primary' : 'w-3 bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}