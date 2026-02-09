import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, ArrowLeft, Truck, CheckCircle2, Wallet, Tag } from 'lucide-react'
import { toast } from 'sonner'

export default function Checkout({ cart, clearCart }: any) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'ligdicash'>('ligdicash')
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })

  // --- CALCUL DYNAMIQUE FESTSOLDE (REMISES DÉGRESSIVES) ---
  const { finalTotal, totalSavings } = useMemo(() => {
    let total = 0
    let originalTotal = 0

    cart.forEach((item: any) => {
      const quantity = parseInt(item.quantity)
      const basePrice = parseFloat(item.promo_price || item.price)
      
      let discount = 1
      if (quantity === 2) discount = 0.95 // -5%
      if (quantity >= 3) discount = 0.90 // -10%

      const discountedPrice = basePrice * discount
      total += discountedPrice * quantity
      originalTotal += basePrice * quantity
    })

    return { 
      finalTotal: total, 
      totalSavings: originalTotal - total 
    }
  }, [cart])

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return toast.error("Votre panier est vide")
    setShowPaymentStep(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinalConfirm = async () => {
    setLoading(true)
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');

      // 1. Commande
      const { data: createdOrders, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: cleanPhone,
          customer_address: formData.address,
          total_price: finalTotal,
          payment_method: paymentMethod === 'cod' ? 'Livraison' : 'LigdiCash',
          status: 'En attente'
        }])
        .select()

      if (orderError) throw orderError
      const order = createdOrders[0]

      // 2. Articles avec prix remisé unitaire
      const orderItems = cart.map((item: any) => {
        const qty = parseInt(item.quantity)
        const base = parseFloat(item.promo_price || item.price)
        let disc = 1
        if (qty === 2) disc = 0.95
        if (qty >= 3) disc = 0.90

        return {
          order_id: order.id,
          product_id: item.id,
          shop_id: item.shop_id || null,
          quantity: qty,
          price: base * disc,
          product_name: item.title || 'Produit'
        }
      })

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      if (paymentMethod === 'ligdicash') {
        toast.info("Lancement de LigdiCash...");
        // Simulation pour le test
        setTimeout(() => {
            clearCart();
            navigate('/order-success', { state: { orderId: order.id, total: finalTotal, method: 'LigdiCash' } });
        }, 1500);
      } else {
        clearCart();
        toast.success("Commande FESTSOLDE validée ! 🌹");
        navigate('/order-success', { state: { orderId: order.id, total: finalTotal, method: 'Livraison' } });
      }
    } catch (err: any) {
      toast.error("Erreur de validation");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="flex-1 w-full">
            {!showPaymentStep ? (
              <div className="animate-in fade-in slide-in-from-left duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Livraison</h2>
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5">
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input required className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl font-bold transition-all outline-none" placeholder="Nom complet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input required type="tel" className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl font-bold transition-all outline-none" placeholder="Numéro Orange/Moov" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-6 text-gray-400" size={20} />
                      <textarea required className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl font-bold min-h-[140px] outline-none" placeholder="Détails de l'adresse (Ex: Ouaga, Secteur 15, face à la pharmacie...)" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3">
                    Valider les infos <ArrowLeft className="rotate-180" size={20}/>
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <button onClick={() => setShowPaymentStep(false)} className="flex items-center gap-2 text-gray-400 font-bold text-xs mb-6 uppercase tracking-widest">
                  <ArrowLeft size={16} /> Modifier les informations
                </button>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 italic uppercase">Paiement</h2>

                <div className="space-y-4 mb-8">
                  <div onClick={() => setPaymentMethod('ligdicash')} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'ligdicash' ? 'border-rose-500 bg-rose-50/50 shadow-md' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${paymentMethod === 'ligdicash' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Wallet size={24} /></div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-sm">LigdiCash</p>
                        <p className="text-xs text-gray-500 font-bold italic">Orange Money, Moov Money, Visa</p>
                      </div>
                    </div>
                    {paymentMethod === 'ligdicash' && <CheckCircle2 className="text-rose-500" />}
                  </div>

                  <div onClick={() => setPaymentMethod('cod')} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-rose-500 bg-rose-50/50 shadow-md' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${paymentMethod === 'cod' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Truck size={24} /></div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-sm">Espèces à la livraison</p>
                        <p className="text-xs text-gray-500 font-bold italic">Réglez au livreur à la réception</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <CheckCircle2 className="text-rose-500" />}
                  </div>
                </div>

                <button onClick={handleFinalConfirm} disabled={loading} className="w-full py-6 rounded-3xl font-black uppercase bg-rose-600 text-white shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3">
                  {loading ? "Chargement..." : `Confirmer ${finalTotal.toLocaleString()} F`}
                </button>
              </div>
            )}
          </div>

          {/* RÉSUMÉ (DROITE) */}
          <div className="w-full lg:w-[400px] sticky top-12">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 uppercase mb-6 italic">Votre Panier</h3>
              <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2">
                {cart.map((item: any) => {
                  const qty = parseInt(item.quantity)
                  const base = parseFloat(item.promo_price || item.price)
                  let disc = 1
                  if (qty === 2) disc = 0.95
                  if (qty >= 3) disc = 0.90
                  const currentPrice = base * disc

                  return (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                        <img src={item.images?.[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-[11px] uppercase line-clamp-1">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-rose-500 text-[10px]">{qty} × {currentPrice.toLocaleString()} F</p>
                          {disc < 1 && (
                            <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black flex items-center gap-1">
                              <Tag size={8} /> -{Math.round((1-disc)*100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalSavings > 0 && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                   <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <Tag size={16} className="shrink-0" />
                      <span className="text-[10px] font-black uppercase">Remise FestSolde</span>
                   </div>
                   <p className="text-emerald-600 font-bold text-sm">
                    Bravo ! Vous économisez {totalSavings.toLocaleString()} F
                   </p>
                </div>
              )}

              <div className="pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Sous-total</span>
                  <span className="line-through">{(finalTotal + totalSavings).toLocaleString()} F</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black uppercase text-gray-900 italic">Total Net</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{finalTotal.toLocaleString()} F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}