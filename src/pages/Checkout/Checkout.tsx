import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Checkout({ cart, total, clearCart }: any) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    method: 'Orange Money' // Par défaut
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          total_price: total,
          payment_method: formData.method,
          status: 'En attente'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Ajouter les articles de la commande
      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      // 3. Succès
      toast.success('Commande envoyée !')
      clearCart()
      navigate('/order-success', { state: { orderId: order.id, method: formData.method, total } })
    } catch (err: any) {
      toast.error("Erreur : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-black mb-8 tracking-tighter">Finaliser ma commande</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Client */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold"
              placeholder="Votre nom complet"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              required
              type="tel"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold"
              placeholder="Numéro de téléphone (WhatsApp)"
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
            <textarea 
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold resize-none"
              placeholder="Adresse de livraison (Quartier, Ville)"
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        {/* Choix du Paiement Mobile */}
        <div className="grid grid-cols-2 gap-4">
          {['Orange Money', 'Moov Money'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setFormData({...formData, method: m})}
              className={`p-4 rounded-2xl border-2 font-black transition-all ${
                formData.method === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
        >
          {loading ? "Traitement..." : <>Confirmer la commande <Send size={20}/></>}
        </button>
      </form>
    </div>
  )
}