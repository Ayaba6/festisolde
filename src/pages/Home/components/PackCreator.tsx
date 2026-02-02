import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, Sparkles, Wand2, RotateCcw, 
  ArrowLeft, Check, ShoppingBag, Zap
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
        toast.error("Erreur de chargement des articles")
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
    
    // Synchro Image / Couleur
    const colorIndex = product.colors?.indexOf(finalColor) || 0
    const displayImage = product.images?.[colorIndex] || product.images?.[0]

    setSelections(prev => ({ 
      ...prev, 
      [currentStep.id]: { 
        ...product, 
        selectedColor: finalColor, 
        selectedSize: finalSize,
        displayImage: displayImage 
      } 
    }))

    if (!selections[currentStep.id] && currentStepIndex < STEPS.length - 1) {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 700)
    }
  }

  const selectedList = Object.values(selections).filter(Boolean)
  const isComplete = selectedList.length === 4
  const subtotal = selectedList.reduce((acc, p) => acc + (p.promo_price || p.price), 0)
  const finalTotal = isComplete ? subtotal * 0.85 : subtotal

  // --- LOGIQUE DE FINALISATION ET REDIRECTION ---
  const handleFinish = () => {
    confetti({ 
      particleCount: 150, 
      spread: 70, 
      origin: { y: 0.6 }, 
      colors: ['#FFBF00', '#FFFFFF', '#000000'] 
    })
    
    const pack = {
      id: `pack-${Date.now()}`,
      variantId: `pack-${Date.now()}`,
      title: "Look Complet Sur-Mesure",
      items: selectedList.map(item => ({
        id: item.id,
        title: item.title,
        price: item.promo_price || item.price,
        color: item.selectedColor,
        size: item.selectedSize,
        image: item.displayImage
      })),
      price: subtotal,
      promo_price: Math.round(finalTotal),
      image: selections.haut?.displayImage || selections.haut?.images[0],
      quantity: 1,
      isPack: true
    }

    // Sauvegarde dans festi_cart (nom utilisé dans ton App.tsx)
    const savedCart = localStorage.getItem('festi_cart')
    let currentCart = []
    try {
      currentCart = savedCart ? JSON.parse(savedCart) : []
    } catch (e) { currentCart = [] }

    localStorage.setItem('festi_cart', JSON.stringify([...currentCart, pack]))
    
    // FLAG pour ouvrir le panier au retour
    localStorage.setItem('open_cart_on_load', 'true')
    
    toast.success("Look validé ! Direction le panier...", { icon: '🛍️' })

    setTimeout(() => { 
      navigate('/')
      window.location.reload() 
    }, 1200)
  }

  if (loading) return (
    <div className="h-screen bg-brand-dark flex flex-col items-center justify-center gap-4 text-white">
      <Wand2 className="text-brand-primary animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Création de votre univers...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-brand-dark/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-brand-primary mb-0.5">
              <Sparkles size={10} fill="currentColor" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Packeo Studio</span>
            </div>
            <h1 className="text-sm md:text-lg font-black uppercase italic tracking-tighter">
              {currentStep.label} <span className="text-brand-primary font-normal">{currentStep.icon}</span>
            </h1>
          </div>
          <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-black italic">
            {currentStepIndex + 1}/4
          </div>
        </div>
      </header>

      <main className="pt-24 pb-64 md:pb-48 px-4 max-w-7xl mx-auto">
        {/* PROGRESS */}
        <div className="flex justify-center gap-2 mb-10">
          {STEPS.map((s, idx) => (
            <div key={s.id} className={`h-1 rounded-full transition-all duration-700 ${
              idx === currentStepIndex ? 'w-12 md:w-20 bg-brand-primary shadow-[0_0_20px_#FFBF00]' : 
              selections[s.id] ? 'w-6 md:w-10 bg-white/40' : 'w-6 md:w-10 bg-white/10'
            }`} />
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          <AnimatePresence mode="wait">
            {stepProducts.map((product) => {
              const isSelected = selections[currentStep.id]?.id === product.id
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative flex flex-col rounded-[1.8rem] md:rounded-[2.5rem] p-2 md:p-3 border-2 transition-all duration-500 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/5 shadow-2xl shadow-brand-primary/10' : 'border-white/5 bg-white/[0.03]'
                  }`}
                >
                  <div className="relative aspect-[4/5] rounded-[1.4rem] md:rounded-[2rem] overflow-hidden mb-3 md:mb-5 bg-black/20">
                    <img 
                      src={isSelected ? (selections[currentStep.id]?.displayImage || product.images[0]) : product.images[0]} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                  </div>

                  <div className="px-1 md:px-2 flex-grow space-y-4">
                    <div>
                      <h3 className="text-[9px] font-black uppercase text-white/40 truncate tracking-widest">{product.title}</h3>
                      <p className="text-brand-primary font-black text-sm md:text-lg italic">{(product.promo_price || product.price).toLocaleString()} F</p>
                    </div>

                    <div className="space-y-3">
                      {product.colors?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.colors.map((c: string) => (
                            <button key={c} onClick={() => handleSelect(product, c, selections[currentStep.id]?.selectedSize)}
                              className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${
                                selections[currentStep.id]?.selectedColor === c ? 'bg-brand-primary text-brand-dark' : 'bg-white/5 text-white/50'
                              }`}>{c}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isSelected && (
                    <button onClick={() => handleSelect(product)} className="mt-4 w-full py-3 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest">
                      Sélectionner
                    </button>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-brand-primary text-brand-dark p-1 rounded-full">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER RÉCAPITULATIF */}
      <footer className="fixed bottom-0 w-full p-4 z-50">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] p-3 md:p-5 shadow-2xl text-brand-dark">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            <div className="flex -space-x-3 md:-space-x-4">
              {STEPS.map((s) => (
                <div key={s.id} onClick={() => setCurrentStepIndex(STEPS.findIndex(st => st.id === s.id))}
                  className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[1.8rem] border-4 border-white overflow-hidden shadow-xl cursor-pointer transition-all relative bg-slate-100 flex items-center justify-center ${
                    selections[s.id] ? 'ring-2 ring-brand-primary scale-105' : 'opacity-30 grayscale'
                  }`}>
                  {selections[s.id] ? (
                    <img src={selections[s.id].displayImage} className="w-full h-full object-cover" alt="" />
                  ) : <span className="text-xl">{s.icon}</span>}
                </div>
              ))}
            </div>

            <div className="flex-grow text-center md:text-left">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Look (-15%)</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xl md:text-4xl font-black italic tracking-tighter">
                  {Math.round(finalTotal).toLocaleString()} F
                </span>
                {isComplete && <Zap size={16} className="text-brand-primary fill-brand-primary animate-pulse" />}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => { setSelections({haut:null, bas:null, chaussures:null, accessoire:null}); setCurrentStepIndex(0); }}
                className="p-4 rounded-2xl bg-slate-100 text-slate-400 hover:text-rose-500 transition-all"><RotateCcw size={20} /></button>
              
              <button disabled={!isComplete} onClick={handleFinish}
                className={`flex-grow md:flex-none px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${
                  isComplete ? 'bg-brand-dark text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-300'
                }`}>
                {isComplete ? 'Finaliser & Voir Panier' : 'Compléter le Look'}
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}