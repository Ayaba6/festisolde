import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient' // Vérifie que ce chemin est correct
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronDown, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react'

export default function Orders() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVendor() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // CORRECTION : On utilise 'shops' et 'owner_id' comme dans le Header
      const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (data) setVendorId(data.id)
      setLoading(false)
    }
    loadVendor()
  }, [])

  useEffect(() => {
    if (!vendorId) return

    async function loadOrders() {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id, 
          quantity, 
          price, 
          products(nom, image_url), 
          orders(id, status, created_at)
        `)
        .eq('vendor_id', vendorId)
        .order('id', { ascending: false })

      if (error) console.error("Erreur chargement commandes:", error)
      setOrders(data || [])
    }
    loadOrders()
  }, [vendorId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const config: any = {
      'pending': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={14}/>, label: 'En attente' },
      'shipped': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Truck size={14}/>, label: 'Expédié' },
      'completed': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={14}/>, label: 'Livré' },
      'cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertCircle size={14}/>, label: 'Annulé' }
    }
    const s = config[status] || config['pending']
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${s.color}`}>
        {s.icon} {s.label}
      </div>
    )
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-brand-primary">CHARGEMENT...</div>

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-10 text-left">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
            Mes <span className="text-brand-primary">commandes</span>
          </h2>
          <p className="text-gray-500 font-medium mt-1">Gérez vos ventes et suivez vos expéditions.</p>
        </header>

        <div className="space-y-4">
          {!vendorId ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
               <p className="text-gray-400 font-bold uppercase italic">Vous n'avez pas encore de boutique active.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold italic uppercase">Aucune vente enregistrée</p>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4"
                  onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        Vente du {o.orders ? formatDate(o.orders.created_at) : 'Date inconnue'}
                      </h3>
                      <p className="text-gray-400 text-sm font-medium">
                        {o.quantity} article{o.quantity > 1 ? 's' : ''} • ID: #{o.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    {o.orders && getStatusBadge(o.orders.status)}
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900 leading-none">
                        {(o.price * o.quantity).toFixed(2)} €
                      </p>
                    </div>
                    <ChevronDown size={20} className={`text-gray-300 transition-transform duration-300 ${expandedId === o.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === o.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-50 bg-gray-50/30 overflow-hidden">
                      <div className="p-6 flex items-start gap-6">
                         <div className="w-20 h-20 bg-white rounded-xl border border-gray-100 p-2 overflow-hidden shadow-sm shrink-0">
                            <img src={o.products?.image_url} alt={o.products?.nom} className="w-full h-full object-contain" />
                         </div>
                         <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Produit</p>
                               <p className="font-bold text-gray-800">{o.products?.nom}</p>
                            </div>
                            <div>
                               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Prix Unitaire</p>
                               <p className="font-bold text-gray-800">{o.price} €</p>
                            </div>
                            <div>
                               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Status Global</p>
                               <p className="font-bold text-brand-primary uppercase text-xs">{o.orders?.status}</p>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}