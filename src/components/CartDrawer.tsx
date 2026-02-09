import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2, Heart, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: any[]
  setCart: (cart: any[]) => void
  // On peut garder total dans l'interface, mais on va privilégier le calcul local
  total?: number 
}

export default function CartDrawer({ isOpen, onClose, cart = [], setCart }: CartDrawerProps) {
  const navigate = useNavigate()

  // --- 1. LOGIQUE DE PRIX UNITAIRE (REMISE) ---
  const calculateItemPrice = (item: any) => {
    const basePrice = item.promo_price || item.price || 0
    if (item.quantity === 2) return basePrice * 0.95 // -5%
    if (item.quantity >= 3) return basePrice * 0.90  // -10%
    return basePrice
  }

  // --- 2. CALCUL DU TOTAL DYNAMIQUE ---
  // useMemo permet de recalculer le total uniquement quand le panier change
  const dynamicTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const discountedPrice = calculateItemPrice(item)
      return acc + (discountedPrice * item.quantity)
    }, 0)
  }, [cart])

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setCart(newCart)
    localStorage.setItem('festi-cart', JSON.stringify(newCart))
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('festi-cart', JSON.stringify(newCart))
  }

  const handleGoToCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
              <Heart size={18} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mon Panier</h2>
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">SEMER L'AVENIR Selection 🌹</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
              <ShoppingBag size={48} className="mb-4 text-slate-300" />
              <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Votre panier est vide</p>
            </div>
          ) : (
            cart.map((item) => {
              const unitPrice = calculateItemPrice(item)
              const hasDiscount = item.quantity >= 2

              return (
                <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-rose-100 transition-colors relative overflow-hidden">
                  
                  {hasDiscount && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg flex items-center gap-1 uppercase">
                      <Tag size={8} /> Remise Volume
                    </div>
                  )}

                  <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                    <img 
                      src={Array.isArray(item.images) ? item.images[0] : (item.images || item.image_url || 'https://via.placeholder.com/150')} 
                      className="w-full h-full object-cover" 
                      alt={item.title} 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-tight uppercase italic">{item.title}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through font-bold">
                            {((item.promo_price || item.price) * item.quantity).toLocaleString()} F
                          </span>
                        )}
                        <span className="text-rose-600 font-black text-sm">
                          {(unitPrice * item.quantity).toLocaleString()} F
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm">
                            <Minus size={12}/>
                          </button>
                          <span className="px-2 text-xs font-black text-slate-700 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm">
                            <Plus size={12}/>
                          </button>
                        </div>
                        {item.quantity === 1 && (
                          <span className="text-[8px] font-bold text-slate-400 italic">Ajoutez-en 1 pour -5%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer avec dynamicTotal */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total à payer</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  {dynamicTotal.toLocaleString()} F CFA
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-tighter shadow-sm border border-emerald-100">
                  Économie incluse ✅
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleGoToCheckout}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[15px] shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 group"
            >
              Passer la commande
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}