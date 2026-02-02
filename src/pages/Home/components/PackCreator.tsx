import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, ChevronLeft, Sparkles, 
  CheckCircle2, Wand2, RotateCcw, 
  ArrowLeft, ShoppingBag, Info, Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

const STEPS = [
  { id: 'haut', label: 'Le Haut', category: 'Chemise', icon: '👔', desc: 'Choisis ta plus belle chemise' },
  { id: 'bas', label: 'Le Bas', category: 'Pantalon', icon: '👖', desc: 'Un pantalon pour l\'accompagner' },
  { id: 'chaussures', label: 'Les Pieds', category: 'Chaussures', icon: '👟', desc: 'Marche avec style' },
  { id: 'accessoire', label: 'La Touche Finale', category: 'Montre', icon: '⌚', desc: 'L\'élégance au poignet' }
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
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-primary selection:text-brand-dark">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-brand-dark/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-brand-primary mb-0.5">
              <Sparkles size={12} fill="currentColor" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Édition Limitée</span>
            </div>
            <h1 className="text-lg font-black uppercase italic tracking-tighter">
              {currentStep.label} <span className="text-brand-primary font-normal">{currentStep.icon}</span>
            </h1>
          </div>

          <div className="w-10 text-right text-[10px] font-black italic text-brand-primary">
            {currentStepIndex + 1}/4
          </div>
        </div>
      </header>

      <main className="pt-28 pb-48 px-6 max-w-7xl mx-auto">
        {/* PROGRESS BAR */}
        <div className="flex justify-center gap-3 mb-12">
          {STEPS.map((s, idx) => (
            <div key={s.id} className={`h-1 rounded-full transition-all duration-700 ${
              idx === currentStepIndex ? 'w-16 bg-brand-primary shadow-[0_0_20px_#FFBF00]' : 
              selections[s.id] ? 'w-8 bg-white/40' : 'w-8 bg-white/10'
            }`} />
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {stepProducts.map((product) => {
              const isSelected = selections[currentStep.id]?.id === product.id
              const currentSelection = selections[currentStep.id]
              
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative flex flex-col rounded-[2.5rem] p-3 border-2 transition-all duration-500 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-white/5 bg-white/[0.03]'
                  }`}
                >
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-5">
                    <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="px-2 space-y-4 flex-grow">
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">{product.title}</h3>
                      <p className="text-brand-primary font-black text-lg italic uppercase">{product.promo_price || product.price} F</p>
                    </div>

                    {/* SELECTION COULEURS */}
                    {product.colors?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Couleur</span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.colors.map((c: string) => (
                            <button 
                              key={c}
                              onClick={() => handleSelect(product, c, currentSelection?.selectedSize)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                currentSelection?.selectedColor === c 
                                ? 'bg-brand-primary text-brand-dark' 
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SELECTION TAILLES */}
                    {product.sizes?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Taille</span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.sizes.map((s: string) => (
                            <button 
                              key={s}
                              onClick={() => handleSelect(product, currentSelection?.selectedColor, s)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                currentSelection?.selectedSize === s 
                                ? 'bg-brand-primary text-brand-dark' 
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOUTON SELECTION RAPIDE SI RIEN CHOISI */}
                  {!isSelected && (
                    <button 
                      onClick={() => handleSelect(product)}
                      className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-brand-dark transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                      Sélectionner
                    </button>
                  )}

                  {isSelected && (
                    <div className="absolute top-6 right-6 bg-brand-primary text-brand-dark p-1.5 rounded-full shadow-[0_0_20px_rgba(255,191,0,0.4)]">
                      <Check size={16} strokeWidth={4} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 w-full p-4 md:p-8 z-50">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.8rem] p-5 shadow-2xl text-brand-dark">
          <div className="flex items-center gap-6">
            
            <div className="flex -space-x-4">
              {STEPS.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setCurrentStepIndex(STEPS.findIndex(step => step.id === s.id))}
                  className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] border-4 border-white overflow-hidden shadow-xl cursor-pointer transition-all hover:-translate-y-2 relative bg-slate-50 flex items-center justify-center ${
                    selections[s.id] ? 'ring-2 ring-brand-primary' : 'opacity-40 grayscale'
                  }`}
                >
                  {selections[s.id] ? (
                    <>
                      <img src={selections[s.id].images[0]} className="w-full h-full object-cover" alt="" />
                      <div className="absolute bottom-0 inset-x-0 bg-brand-primary/90 text-[7px] font-black text-center py-0.5 uppercase">
                        {selections[s.id].selectedSize}
                      </div>
                    </>
                  ) : <span className="text-xl">{s.icon}</span>}
                </div>
              ))}
            </div>

            <div className="flex-grow">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total Look -15%</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-4xl font-black italic tracking-tighter">
                  {Math.round(finalTotal).toLocaleString()} F
                </span>
                {isComplete && <div className="bg-brand-primary text-brand-dark text-[8px] px-2 py-1 rounded-md font-black animate-bounce tracking-tighter uppercase">Pack Validé</div>}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setSelections({haut:null, bas:null, chaussures:null, accessoire:null}); setCurrentStepIndex(0); }}
                className="hidden sm:flex p-5 rounded-2xl bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <RotateCcw size={22} />
              </button>
              
              <button
                disabled={!isComplete}
                onClick={handleFinish}
                className={`px-8 md:px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 transition-all ${
                  isComplete 
                  ? 'bg-brand-dark text-white shadow-2xl hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {isComplete ? 'Finaliser le Look' : 'Compléter'}
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}