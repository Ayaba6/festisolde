import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  ShoppingBag, Clock, CheckCircle2, 
  Truck, Search, Eye, Filter, 
  AlertCircle, CreditCard, User, Phone, MapPin
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Requête simple sans jointure (plus rapide et robuste)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      toast.success("Statut mis à jour")
      fetchOrders()
    }
  }

  const filteredOrders = orders.filter(order => {
    const term = search.toLowerCase()
    const matchesSearch = 
      order.id.toLowerCase().includes(term) || 
      (order.customer_name?.toLowerCase().includes(term)) ||
      (order.phone?.includes(term))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <div className="py-20 text-center font-black italic text-gray-400 animate-pulse">Chargement des commandes...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par nom, tel ou ID..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-purple-500/20 font-bold text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {['all', 'pending', 'shipped', 'delivered'].map((s) => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {s === 'all' ? 'Toutes' : s}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES COMMANDES */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap justify-between items-start gap-4">
              
              {/* Infos client & ID */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 uppercase italic tracking-tighter">{order.customer_name || 'Client anonyme'}</h3>
                    <span className="text-[9px] font-mono text-gray-300">#{order.id.slice(0,8)}</span>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><Phone size={10}/> {order.phone || 'Non renseigné'}</p>
                    <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><MapPin size={10}/> {order.address || 'Sans adresse'}</p>
                  </div>
                </div>
              </div>

              {/* Montant & Statut */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[8px] font-black text-gray-300 uppercase">Montant Total</p>
                  <p className="text-lg font-black text-purple-600 italic">{(order.total_price || 0).toLocaleString()} F</p>
                </div>
                <select 
                  value={order.status || 'pending'}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-none outline-none cursor-pointer ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <option value="pending">En attente</option>
                  <option value="shipped">Expédié</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 bg-white rounded-[2rem] text-center border-2 border-dashed border-gray-50">
            <p className="font-black italic text-gray-300 uppercase">Aucun flux de commande</p>
          </div>
        )}
      </div>
    </div>
  )
}