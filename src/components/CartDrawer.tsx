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

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Panneau blanc coulissant */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* Header du panier */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-black tracking-tighter">Votre Panier</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag size={64} className="mb-4 text-gray-300" />
              <p className="font-bold text-gray-500">Votre panier est vide</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                  <img src={item.images?.[0]} className="w-full h-full object-cover" alt={item.title} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-indigo-600 font-black mt-1">{item.price.toLocaleString()} F</p>
                  </div>
                  
                  <div className="flex items-center bg-gray-50 w-fit rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Minus size={14}/></button>
                    <span className="px-4 font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer avec Total */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Sous-total</span>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{total.toLocaleString()} F</span>
            </div>
            <button 
              onClick={() => { onClose(); navigate('/checkout'); }}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Passer à la caisse <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}