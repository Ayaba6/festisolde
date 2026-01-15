import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, Send, CreditCard, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function Checkout({ cart, total, clearCart }: any) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    method: 'Orange Money'
  })

  const MERCHANT_NUMBERS = {
    'Orange Money': '70 00 00 00',
    'Moov Money': '60 00 00 00'
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return toast.error("Votre panier est vide")
    setShowPaymentStep(true)
  }

  const handleFinalConfirm = async () => {
    setLoading(true)
    try {
      const { data: createdOrders, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          total_price: total,
          payment_method: formData.method,
          status: 'En attente'
        }])
        .select()

      if (orderError) throw orderError
      if (!createdOrders || createdOrders.length === 0) throw new Error("Échec de création de la commande")
      
      const order = createdOrders[0]

      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.promo_price || item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      toast.success('Commande enregistrée !')
      clearCart() 
      localStorage.removeItem('festi_cart') 
      
      navigate('/order-success', { 
        state: { orderId: order.id, method: formData.method, total } 
      })

    } catch (err: any) {
      console.error("ERREUR CRITIQUE:", err)
      toast.error(err.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  if (showPaymentStep) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-rose-50 text-[#FF5A5A] rounded-[2rem] flex items-center justify-center border border-rose-100">
            <CreditCard size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Effectuez le paiement</h2>
        <p className="text-gray-500 text-sm font-medium mb-10">Veuillez envoyer le montant exact via {formData.method}</p>

        <div className="bg-[#F9FAFB] rounded-[2.5rem] p-8 border border-gray-100 mb-8">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant à envoyer</p>
              <p className="text-4xl font-black text-gray-900">{total.toLocaleString()} F</p>
            </div>
            <div className="bg-white py-4 px-6 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Numéro Marchand {formData.method}</p>
              <p className="text-2xl font-black text-[#FF5A5A] tracking-wider">
                {MERCHANT_NUMBERS[formData.method as keyof typeof MERCHANT_NUMBERS]}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={handleFinalConfirm} disabled={loading} className="w-full bg-gray-900 text-white py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all disabled:opacity-50">
            {loading ? "Validation..." : <>J'ai effectué le transfert <CheckCircle size={20}/></>}
          </button>
          <button onClick={() => setShowPaymentStep(false)} className="w-full py-4 text-gray-400 font-bold text-sm flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Modifier mes informations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg">
          <ShoppingBag size={24} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Finaliser la commande</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <form onSubmit={handleInitialSubmit} className="lg:col-span-3 space-y-8">
          {/* Informations */}
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Livraison</p>
            <div className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-2">
              <div className="relative">
                <User className="absolute left-5 top-5 text-gray-400" size={18} />
                <input required className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-[1.8rem] border-none focus:ring-2 focus:ring-[#FF5A5A] font-bold text-sm" placeholder="Nom complet" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <Phone className="absolute left-5 top-5 text-gray-400" size={18} />
                <input required type="tel" className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-[1.8rem] border-none focus:ring-2 focus:ring-[#FF5A5A] font-bold text-sm" placeholder="Téléphone (WhatsApp)" onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 text-gray-400" size={18} />
                <textarea required rows={2} className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-[1.8rem] border-none focus:ring-2 focus:ring-[#FF5A5A] font-bold text-sm resize-none" placeholder="Adresse de livraison..." onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Paiement</p>
            <div className="grid grid-cols-2 gap-4">
              {['Orange Money', 'Moov Money'].map(m => (
                <button key={m} type="button" onClick={() => setFormData({...formData, method: m})} className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.method === m ? 'border-[#FF5A5A] bg-rose-50 text-[#FF5A5A]' : 'border-gray-50 bg-gray-50 text-gray-400'}`}>
                  <CreditCard size={20} />
                  <span className="font-bold text-xs">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-[#FF5A5A] to-[#FF7B7B] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-rose-100 active:scale-95 transition-all flex items-center justify-center gap-4">
            Payer {total.toLocaleString()} F <Send size={20}/>
          </button>
        </form>

        {/* RÉCAPITULATIF AVEC IMAGES */}
        <div className="lg:col-span-2 bg-[#F9FAFB] rounded-[2.5rem] p-8 border border-gray-100">
           <h3 className="font-bold text-gray-900 mb-6">Votre Panier</h3>
           <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {cart.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-50">
                  {/* Image du produit */}
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/150'} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Infos produit */}
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-black text-gray-800 truncate leading-tight mb-1">{item.title}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-gray-400">{item.quantity} x</p>
                      <p className="text-xs font-black text-[#FF5A5A]">
                        {((item.promo_price || item.price) * item.quantity).toLocaleString()} F
                      </p>
                    </div>
                  </div>
                </div>
             ))}
           </div>
           
           <div className="border-t border-dashed border-gray-200 pt-6">
             <div className="flex justify-between items-end">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total</p>
                <p className="text-3xl font-black text-gray-900 leading-none">{total.toLocaleString()} F</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}