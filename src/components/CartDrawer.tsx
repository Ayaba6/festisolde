import { X, Plus, Minus, ShoppingBag, ArrowRight, Zap, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: any[]
  setCart: (cart: any[]) => void
  total: number
}

export default function CartDrawer({ isOpen, onClose, cart, setCart, total }: CartDrawerProps) {
  const navigate = useNavigate()

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay fluide */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all duration-500" 
        onClick={onClose} 
      />
      
      {/* Panneau latéral responsive */}
      <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Votre Panier</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:rotate-90">
            <X size={22} />
          </button>
        </div>

        {/* Liste des produits */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar bg-slate-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 border border-slate-50">
                <ShoppingBag size={24} className="text-slate-200" />
              </div>
              <p className="font-semibold text-slate-400 text-sm">Votre panier est encore vide</p>
              <button onClick={onClose} className="mt-4 text-xs font-bold text-brand-primary uppercase tracking-widest">Continuer mes achats</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                
                {/* IMAGE / PACK GRID */}
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  {item.isPack ? (
                    <div className="grid grid-cols-2 w-full h-full gap-0.5">
                      {item.items?.map((sub: any, idx: number) => (
                        <img key={idx} src={sub.image} className="w-full h-full object-cover" alt="" />
                      ))}
                    </div>
                  ) : (
                    <img 
                      src={item.image_url || item.image || item.images?.[0]} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={item.title} 
                    />
                  )}
                </div>

                {/* CONTENU */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-[14px] md:text-base leading-tight">
                        {item.title}
                      </h4>
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.isPack ? (
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-lg w-fit">
                        <Zap size={10} fill="currentColor" /> LOOK PERSONNALISÉ
                      </div>
                    ) : (
                      <p className="text-[11px] font-medium text-slate-400">
                        {item.selectedColor} {item.selectedSize && `• ${item.selectedSize}`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-brand-primary font-bold text-base">
                        {(item.promo_price || item.price).toLocaleString()} F
                      </span>
                      {item.promo_price && item.promo_price < item.price && (
                        <span className="text-[10px] text-slate-300 line-through">
                          {item.price.toLocaleString()} F
                        </span>
                      )}
                    </div>

                    {/* Quantité compacte */}
                    <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-400 hover:text-rose-500 transition-all"><Minus size={12}/></button>
                      <span className="px-3 font-bold text-[13px] text-slate-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-400 hover:text-emerald-500 transition-all"><Plus size={12}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 md:p-8 bg-white border-t border-slate-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sous-total</span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{total.toLocaleString()} F</span>
            </div>
            
            <button 
              onClick={() => { onClose(); navigate('/checkout'); }}
              className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl font-bold text-[15px] shadow-xl shadow-slate-200 hover:bg-brand-primary transition-all flex items-center justify-center gap-3 group"
            >
              Passer à la commande
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center leading-relaxed">
                Paiement Mobile Money Sécurisé (Burkina Faso)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}