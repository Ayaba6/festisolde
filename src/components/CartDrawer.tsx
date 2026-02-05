import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: any[]
  setCart: (cart: any[]) => void
  total: number
}

export default function CartDrawer({ isOpen, onClose, cart = [], setCart, total = 0 }: CartDrawerProps) {
  const navigate = useNavigate()

  // Mise à jour de la quantité locale
  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setCart(newCart)
  }

  // Suppression d'un article
  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
  }

  // Redirection vers la page checkout (où se trouve la logique Supabase)
  const handleGoToCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay avec flou */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panier Coulissant */}
      <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header Style Saint-Valentin */}
        <div className="p-6 border-b flex items-center justify-between bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
              <Heart size={18} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mon Panier</h2>
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">MasterHub Selection 🌹</p>
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
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-rose-100 transition-colors">
                
                {/* Image du produit */}
                <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                  <img 
                    src={Array.isArray(item.images) ? item.images[0] : (item.images || item.image_url || 'https://via.placeholder.com/150?text=Cadeau')} 
                    className="w-full h-full object-cover" 
                    alt={item.title} 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Produit' }}
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-tight">{item.title}</h4>
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-rose-600 font-black text-sm">
                      {((item.promo_price || item.price || 0) * item.quantity).toLocaleString()} F
                    </span>
                    
                    {/* Contrôleur de quantité */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Minus size={12}/>
                      </button>
                      <span className="px-2 text-xs font-black text-slate-700 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Plus size={12}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer avec Total et Action */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sous-total</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{total.toLocaleString()} F CFA</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase">Stock disponible</p>
              </div>
            </div>
            
            <button 
              onClick={handleGoToCheckout}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[15px] shadow-xl shadow-slate-200 hover:bg-rose-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Commander maintenant
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-4 text-[9px] text-center text-slate-400 font-medium">
              🛒 Paiement sécurisé à la livraison
            </p>
          </div>
        )}
      </div>
    </div>
  )
}