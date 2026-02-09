import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, RotateCcw, Check, ShoppingBag, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

// IMPORTATION DE TON COMPOSANT
import QuickCategoryNav from './QuickCategoryNav' 

// 1. DÉFINITION DES ÉTAPES (L'oubli qui causait l'erreur)
const STEPS = [
  { id: 'haut', label: 'Le Haut', icon: '👔' },
  { id: 'bas', label: 'Le Bas', icon: '👖' },
  { id: 'chaussures', label: 'Les Pieds', icon: '👟' },
  { id: 'accessoire', label: 'La Touche', icon: '⌚' }
]

export default function PackCreator() {
  const navigate = useNavigate()
  
  // États
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUniverse, setActiveUniverse] = useState('Tous')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // État des sélections du pack
  const [selections, setSelections] = useState<Record<string, any>>({
    haut: null, bas: null, chaussures: null, accessoire: null
  })

  // Chargement des produits
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('allow_custom_pack', true)
          .gt('stock', 0)
        
        if (error) throw error
        if (data) setProducts(data)
      } catch (err) {
        toast.error("Erreur de catalogue")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const currentStep = STEPS[currentStepIndex]

  // Filtrage dynamique selon l'univers choisi dans le QuickNav
  const filteredProducts = useMemo(() => {
    if (activeUniverse === 'Tous') return products
    return products.filter(p => p.category === activeUniverse)
  }, [products, activeUniverse])

  const handleSelect = (product: any) => {
    setSelections(prev => ({ 
      ...prev, 
      [currentStep.id]: { ...product, displayImage: product.images?.[0] } 
    }))
    
    if (currentStepIndex < STEPS.length - 1) {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 400)
    }
  }

  const selectedList = Object.values(selections).filter(Boolean)
  const isComplete = selectedList.length === 4
  const subtotal = selectedList.reduce((acc, p) => acc + (p.promo_price || p.price), 0)
  const finalTotal = isComplete ? subtotal * 0.85 : subtotal

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-brand-primary">
      <Wand2 className="animate-spin" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest">Initialisation Studio...</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      
      {/* 2. APPEL DU NAV (On lui passe la fonction pour changer l'univers) */}
      <QuickCategoryNav 
        activeCategory={activeUniverse} 
        onCategorySelect={(name: string) => setActiveUniverse(name)} 
      />

      <main className="pt-10 pb-48 px-4 md:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR ÉTAPES */}
        <aside className="lg:w-32 flex lg:flex-col flex-row justify-center gap-6 lg:sticky lg:top-48 h-fit">
          {STEPS.map((s, idx) => (
            <button 
              key={s.id} 
              onClick={() => setCurrentStepIndex(idx)}
              className={`group flex flex-col items-center gap-3 transition-all ${idx === currentStepIndex ? 'scale-110' : 'opacity-20'}`}
            >
              <div className={`w-16 h-20 lg:w-24 lg:h-32 rounded-3xl border-2 flex items-center justify-center overflow-hidden transition-all ${idx === currentStepIndex ? 'border-brand-primary bg-zinc-900 shadow-neon' : 'border-white/5'}`}>
                {selections[s.id] ? (
                  <img src={selections[s.id].displayImage} className="w-full h-full object-cover" />
                ) : <span className="text-2xl">{s.icon}</span>}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{s.label}</span>
            </button>
          ))}
        </aside>

        {/* GRILLE PRODUITS */}
        <div className="flex-1">
          <div className="mb-10">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              {activeUniverse} <span className="text-white/10">{currentStep.label}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isSelected = selections[currentStep.id]?.id === product.id
                return (
                  <motion.div 
                    key={product.id} 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    onClick={() => handleSelect(product)}
                    className={`group relative rounded-[2rem] p-3 border-2 transition-all cursor-pointer ${isSelected ? 'border-brand-primary bg-zinc-900' : 'border-white/5 bg-zinc-900/20'}`}
                  >
                    <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4">
                      <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase truncate">{product.title}</h4>
                    <p className="text-brand-primary font-black text-xl italic">{(product.promo_price || product.price).toLocaleString()} F</p>
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-brand-primary text-black p-1 rounded-full"><Check size={14} strokeWidth={4} /></div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* FOOTER VALIDATION */}
      <footer className="fixed bottom-0 w-full p-6 z-50 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="flex-1">
            <p className="text-[10px] font-black text-black/40 uppercase mb-1">Total du look SEMER L'AVENIR</p>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-black italic leading-none">{Math.round(finalTotal).toLocaleString()} F</span>
              {isComplete && <span className="text-zinc-300 line-through font-bold">{subtotal.toLocaleString()} F</span>}
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => setSelections({haut:null, bas:null, chaussures:null, accessoire:null})} className="p-5 rounded-2xl bg-zinc-100 text-zinc-400"><RotateCcw size={20}/></button>
            <button 
              disabled={!isComplete}
              onClick={() => {
                confetti({ particleCount: 150 });
                toast.success("Look validé !");
              }}
              className={`flex-1 md:flex-none px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${isComplete ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-300'}`}
            >
              {isComplete ? 'Ajouter au panier' : `${selectedList.length}/4 PRODUITS`}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}