import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Check, ShoppingBag, RotateCcw, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import CartDrawer from '@/components/CartDrawer' // Vérifie que le chemin est correct

// 1. CONFIGURATION DES ÉTAPES
const STEPS = [
  { 
    id: 'haut', 
    label: 'Haut', 
    icon: '👔', 
    keywords: ['t-shirt', 'tshirt', 'pull', 'chemise', 'veste', 'top', 'polo', 'sweat'],
    exclude: [] 
  },
  { 
    id: 'bas', 
    label: 'Bas', 
    icon: '👖', 
    keywords: ['pantalon', 'short', 'jean', 'bas', 'jogging'], 
    exclude: ['basket', 'chaussure'] 
  },
  { 
    id: 'chaussures', 
    label: 'Pieds', 
    icon: '👟', 
    keywords: ['chaussures', 'baskets', 'sneakers', 'bottes', 'sandales'],
    exclude: [] 
  },
  { 
    id: 'accessoire', 
    label: 'Accessoire', 
    icon: '⌚', 
    keywords: ['montre', 'casquette', 'sac', 'lunettes', 'ceinture', 'bijou'],
    exclude: [] 
  }
]

export default function PackCreator() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [selections, setSelections] = useState<Record<string, any>>({
    haut: null, bas: null, chaussures: null, accessoire: null
  })

  // Charger le panier existant au démarrage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('festi-cart') || '[]')
    setCart(savedCart)
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, promo_price, images, category, stock')
          .eq('allow_custom_pack', true)
          .gt('stock', 0)
        
        if (error) throw error
        if (data) setProducts(data)
      } catch (err: any) {
        toast.error("Erreur de catalogue")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const step = STEPS[currentStepIndex]
    return products.filter(p => {
      const cat = p.category?.toLowerCase() || ""
      const hasKeyword = step.keywords.some(key => cat.includes(key.toLowerCase()))
      const isExcluded = step.exclude.some(ex => cat.includes(ex.toLowerCase()))
      return hasKeyword && !isExcluded
    })
  }, [products, currentStepIndex])

  const currentStep = STEPS[currentStepIndex]
  const selectedList = Object.values(selections).filter(Boolean)
  const isComplete = selectedList.length === 4
  
  const subtotal = selectedList.reduce((acc, p) => acc + (p.promo_price || p.price), 0)
  const finalTotal = isComplete ? subtotal * 0.85 : subtotal

  const handleSelect = (product: any) => {
    setSelections(prev => ({ ...prev, [currentStep.id]: product }))
    if (currentStepIndex < STEPS.length - 1) {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 400)
    }
  }

  // --- FONCTION DE FINALISATION ---
  const handleFinalizePack = () => {
    if (!isComplete) return

    // On transforme les 4 produits en articles de panier avec -15%
    const packItems = selectedList.map((item) => ({
      ...item,
      // On crée un ID unique pour le pack pour éviter les conflits
      id: `${item.id}-pack-${Date.now()}`, 
      title: `[PACK] ${item.title}`,
      // Appliquer la remise de 15% directement sur le prix
      promo_price: Math.round((item.promo_price || item.price) * 0.85),
      quantity: 1
    }))

    const updatedCart = [...cart, ...packItems]
    
    // Mise à jour de l'état local, du localStorage et ouverture du drawer
    setCart(updatedCart)
    localStorage.setItem('festi-cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated')) // Notifier le reste de l'app
    
    setIsCartOpen(true)
    toast.success("Pack ajouté avec succès !")
  }

  if (loading) return (
    <div className="h-screen bg-[#F8F8F8] flex flex-col items-center justify-center gap-4">
      <Wand2 className="animate-spin text-zinc-300" size={30} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Studio Packeo...</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-zinc-900 pb-40 font-sans">
      
      {/* HEADER ÉTAPES */}
      <div className="sticky top-0 z-40 bg-[#F8F8F8]/90 backdrop-blur-md border-b border-zinc-100 py-3 px-4">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <h2 className="text-sm font-black uppercase italic tracking-tighter leading-none">
              Custom <span className="text-zinc-400">Pack</span>
            </h2>
            <p className="text-[8px] font-bold text-zinc-400 uppercase mt-1 tracking-widest">Étape {currentStepIndex + 1} sur 4</p>
          </div>

          <div className="flex flex-1 md:flex-none justify-center md:justify-end gap-2 overflow-x-auto scrollbar-hide">
            {STEPS.map((step, idx) => (
              <div 
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`relative shrink-0 w-14 h-16 md:w-16 md:h-20 rounded-xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-white 
                  ${currentStepIndex === idx ? 'border-black scale-105 shadow-sm' : 'border-zinc-100 opacity-60'}`}
              >
                {selections[step.id] ? (
                  <img src={selections[step.id].images?.[0]} className="w-full h-full object-cover animate-in fade-in duration-500" alt="" />
                ) : (
                  <div className="flex flex-col items-center gap-0.5 text-zinc-300">
                    <span className="text-base">{step.icon}</span>
                    <span className="text-[6px] font-black uppercase tracking-tighter">{step.label}</span>
                  </div>
                )}
                {selections[step.id] && (
                  <div className="absolute top-0.5 right-0.5 bg-black text-white rounded-full p-0.5">
                    <Check size={8} strokeWidth={4} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATALOGUE */}
      <main className="max-w-[1500px] mx-auto px-4 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl opacity-50">{currentStep.icon}</span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Sélectionner {currentStep.label}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {filteredProducts.map((product) => {
            const isSelected = selections[currentStep.id]?.id === product.id
            return (
              <div 
                key={product.id}
                onClick={() => handleSelect(product)}
                className={`group relative cursor-pointer bg-white p-1.5 rounded-2xl border transition-all duration-300 
                  ${isSelected ? 'border-black shadow-md scale-[0.98]' : 'border-zinc-100 hover:border-zinc-300 shadow-sm'}`}
              >
                <div className="relative aspect-[3/4] bg-[#F5F5F5] rounded-[1.1rem] overflow-hidden mb-2">
                  <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.title} />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-white p-1.5 rounded-full shadow-xl animate-in zoom-in-50">
                        <Check size={16} strokeWidth={4} className="text-black" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-1 pb-1">
                  <p className="text-[9px] uppercase font-bold text-zinc-400 truncate mb-1 italic">{product.title}</p>
                  <p className="font-black text-xs md:text-sm tracking-tighter">{(product.promo_price || product.price).toLocaleString()} F</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* FOOTER AVEC REDIRECTION VERS DRAWER */}
      <footer className="fixed bottom-6 left-0 right-0 px-4 z-50">
        <div className="max-w-2xl mx-auto bg-black text-white rounded-[1.8rem] p-4 flex items-center justify-between shadow-2xl border border-white/10">
          <div className="pl-2">
            <p className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Pack (-15%)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-black italic tracking-tighter leading-none">
                {Math.round(finalTotal).toLocaleString()} F
              </span>
              {isComplete && (
                <span className="text-[10px] line-through text-white/20 font-bold">{subtotal.toLocaleString()} F</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setSelections({haut:null, bas:null, chaussures:null, accessoire:null}); setCurrentStepIndex(0); }}
              className="p-3 text-white/30 hover:text-white transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={handleFinalizePack}
              disabled={!isComplete}
              className={`px-6 md:px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] transition-all duration-500
                ${isComplete 
                  ? 'bg-white text-black hover:scale-105 shadow-xl active:scale-95' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            >
              {isComplete ? (
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} />
                  <span>Finaliser le Pack</span>
                </div>
              ) : (
                `${selectedList.length}/4 PRODUITS`
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* LE DRAWER */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={(newCart) => {
          setCart(newCart);
          localStorage.setItem('festi-cart', JSON.stringify(newCart));
        }}
      />
    </div>
  )
}