import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
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

  // Mise à jour de la quantité + sauvegarde locale
  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setCart(newCart)
    localStorage.setItem('festi_cart', JSON.stringify(newCart))
  }

  // Suppression + sauvegarde locale
  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('festi_cart', JSON.stringify(newCart))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay avec flou */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Panneau latéral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* Header - Style Minimaliste & Noir */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded-xl">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-gray-900">Mon Panier</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Liste des produits */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-200" />
              </div>
              <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Le panier est vide</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-2 rounded-2xl hover:bg-gray-50/50 transition-colors group">
                {/* Vignette Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                  <img 
                    src={item.image_url || item.images?.[0] || 'https://via.placeholder.com/150'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={item.title} 
                  />
                </div>

                {/* Détails Produit */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-gray-900 text-sm line-clamp-1 pr-4 uppercase tracking-tight">
                        {item.title}
                      </h4>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="text-gray-300 hover:text-[#FF5A5A] transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-[#FF5A5A] font-black text-base mt-1">
                      {(item.promo_price || item.price).toLocaleString()} F
                    </p>
                  </div>
                  
                  {/* Sélecteur de Quantité */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-[#FF5A5A] transition-all active:scale-90"
                      >
                        <Minus size={14}/>
                      </button>
                      <span className="px-4 font-black text-sm text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-[#FF5A5A] transition-all active:scale-90"
                      >
                        <Plus size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer avec Total & CTA */}
        {cart.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0,02)]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] mb-1">Total à payer</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">
                  {total.toLocaleString()} <span className="text-lg">F</span>
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => { onClose(); navigate('/checkout'); }}
              className="w-full bg-gradient-to-r from-[#FF5A5A] to-[#FF7B7B] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-rose-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
            >
              Commander maintenant <ArrowRight size={22} />
            </button>
            
            <p className="text-center mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Livraison rapide en 24h/48h
            </p>
          </div>
        )}
      </div>
    </div>
  )
}