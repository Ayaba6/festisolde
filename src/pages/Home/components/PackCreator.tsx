import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, Sparkles, Wand2, RotateCcw, 
  ArrowLeft, Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

const STEPS = [
  { id: 'haut', label: 'Le Haut', category: 'Chemise', icon: '👔' },
  { id: 'bas', label: 'Le Bas', category: 'Pantalon', icon: '👖' },
  { id: 'chaussures', label: 'Les Pieds', category: 'Chaussures', icon: '👟' },
  { id: 'accessoire', label: 'La Touche', category: 'Montre', icon: '⌚' }
]

export default function PackCreator() {
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selections, setSelections] = useState<Record<string, any>>({
    haut: null, bas: null, chaussures: null, accessoire: null
  })

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('allow_custom_pack', true)
          .gt('stock', 0)
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        toast.error("Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const currentStep = STEPS[currentStepIndex]
  const stepProducts = products.filter(p => p.category === currentStep.category)

  const handleSelect = (product: any, color?: string, size?: string) => {
    const finalColor = color || product.colors?.[0] || 'Standard'
    const finalSize = size || product.sizes?.[0] || 'Unique'
    setSelections(prev => ({ 
      ...prev, 
      [currentStep.id]: { ...product, selectedColor: finalColor, selectedSize: finalSize } 
    }))
    if (currentStepIndex < STEPS.length - 1) {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 600)
    }
  }

  const selectedList = Object.values(selections).filter(Boolean)
  const isComplete = selectedList.length === 4
  const subtotal = selectedList.reduce((acc, p) => acc + (p.promo_price || p.price), 0)
  const finalTotal = isComplete ? subtotal * 0.85 : subtotal

  const handleFinish = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFBF00', '#FFFFFF'] })
    const pack = {
      id: `look-${Date.now()}`,
      title: "Look Complet Sur-Mesure",
      items: selectedList.map(item => ({
        id: item.id,
        title: item.title,
        price: item.promo_price || item.price,
        color: item.selectedColor,
        size: item.selectedSize
      })),
      price: subtotal,
      promo_price: Math.round(finalTotal),
      image: selections.haut?.images[0],
      quantity: 1,
      isPack: true
    }
    const currentCart = JSON.parse(localStorage.getItem('festi-cart') || '[]')
    localStorage.setItem('festi-cart', JSON.stringify([...currentCart, pack]))
    toast.success("Look ajouté au panier !")
    setTimeout(() => { navigate('/'); window.location.reload(); }, 1500)
  }

  if (loading) return (
    <div className="h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
      <Wand2 className="text-brand-primary animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Studio de Style...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans overflow-x-hidden">
      
      {/* HEADER COMPACT */}
      <header className="fixed top-0 w-full z-50 bg-brand-dark/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-brand-primary mb-0.5">
              <Sparkles size={10} fill="currentColor" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">Pack Creator</span>
            </div>
            <h1 className="text-sm md:text-lg font-black uppercase italic tracking-tighter">
              {currentStep.label} <span className="text-brand-primary font-normal">{currentStep.icon}</span>
            </h1>
          </div>

          <div className="text-[10px] font-black italic text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">
            {currentStepIndex + 1}/4
          </div>
        </div>
      </header>

      <main className="pt-24 pb-56 md:pb-48 px-4 md:px-6 max-w-7xl mx-auto">
        {/* PROGRESS BAR */}
        <div className="flex justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {STEPS.map((s, idx) => (
            <div key={s.id} className={`h-1 rounded-full transition-all duration-700 ${
              idx === currentStepIndex ? 'w-12 md:w-16 bg-brand-primary shadow-[0_0_15px_#FFBF00]' : 
              selections[s.id] ? 'w-6 md:w-8 bg-white/40' : 'w-6 md:w-8 bg-white/10'
            }`} />
          ))}
        </div>

        {/* PRODUCTS GRID - 2 colonnes mobile, 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          <AnimatePresence mode="wait">
            {stepProducts.map((product) => {
              const isSelected = selections[currentStep.id]?.id === product.id
              const currentSelection = selections[currentStep.id]
              
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative flex flex-col rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-3 border-2 transition-all duration-500 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-white/5 bg-white/[0.03]'
                  }`}
                >
                  <div className="relative aspect-[4/5] rounded-[1.2rem] md:rounded-[2rem] overflow-hidden mb-3 md:mb-5">
                    <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-40" />
                  </div>

                  <div className="px-1 md:px-2 space-y-3 md:space-y-4 flex-grow">
                    <div>
                      <h3 className="text-[9px] md:text-[10px] font-black uppercase text-white/40 truncate mb-1">{product.title}</h3>
                      <p className="text-brand-primary font-black text-sm md:text-lg italic uppercase">{product.promo_price || product.price} F</p>
                    </div>

                    {/* VARIANTES - Scrollable horizontalement si trop de choix sur mobile */}
                    <div className="space-y-3">
                      {product.colors?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.colors.map((c: string) => (
                            <button key={c} onClick={() => handleSelect(product, c, currentSelection?.selectedSize)}
                              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${
                                currentSelection?.selectedColor === c ? 'bg-brand-primary text-brand-dark' : 'bg-white/5 text-white/60'
                              }`}>{c}</button>
                          ))}
                        </div>
                      )}
                      {product.sizes?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((s: string) => (
                            <button key={s} onClick={() => handleSelect(product, currentSelection?.selectedColor, s)}
                              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${
                                currentSelection?.selectedSize === s ? 'bg-brand-primary text-brand-dark' : 'bg-white/5 text-white/60'
                              }`}>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isSelected && (
                    <button onClick={() => handleSelect(product)} className="mt-3 w-full py-2.5 rounded-xl bg-white/5 text-[8px] font-black uppercase tracking-widest">
                      Choisir
                    </button>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-brand-primary text-brand-dark p-1 rounded-full shadow-lg">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER HYPER RESPONSIVE */}
      <footer className="fixed bottom-0 w-full p-3 md:p-6 z-50">
        <div className="max-w-4xl mx-auto bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-5 shadow-2xl text-brand-dark">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* Miniatures Pack - Scrollable sur petit mobile */}
            <div className="flex -space-x-3 md:-space-x-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {STEPS.map((s) => (
                <div key={s.id} onClick={() => setCurrentStepIndex(STEPS.findIndex(st => st.id === s.id))}
                  className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 md:border-4 border-white overflow-hidden shadow-lg transition-all relative bg-slate-100 flex items-center justify-center ${
                    selections[s.id] ? 'ring-2 ring-brand-primary' : 'opacity-30'
                  }`}>
                  {selections[s.id] ? (
                    <img src={selections[s.id].images[0]} className="w-full h-full object-cover" alt="" />
                  ) : <span className="text-lg">{s.icon}</span>}
                </div>
              ))}
            </div>

            {/* Prix et Status */}
            <div className="flex flex-row md:flex-col items-center md:items-start justify-between w-full md:w-auto md:flex-grow px-2">
              <div className="flex flex-col">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Look -15%</p>
                <span className="text-xl md:text-3xl font-black italic tracking-tighter">
                  {Math.round(finalTotal).toLocaleString()} F
                </span>
              </div>
              {isComplete && <div className="hidden md:block bg-brand-primary text-brand-dark text-[8px] px-2 py-0.5 rounded font-black animate-bounce uppercase">Pack Validé</div>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => { setSelections({haut:null, bas:null, chaussures:null, accessoire:null}); setCurrentStepIndex(0); }}
                className="flex-shrink-0 p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors">
                <RotateCcw size={18} />
              </button>
              
              <button disabled={!isComplete} onClick={handleFinish}
                className={`flex-grow md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] flex items-center justify-center gap-2 transition-all ${
                  isComplete ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-300'
                }`}>
                {isComplete ? 'Valider' : 'Suivant'}
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}