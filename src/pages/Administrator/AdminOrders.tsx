import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  ShoppingBag, Clock, CheckCircle2, 
  Truck, Search, Eye, Filter, 
  Phone, MapPin, XCircle, Package,
  ChevronDown,
  AlertCircle
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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      toast.error("Erreur de chargement des commandes")
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchOrders() 
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      
      toast.success(`Statut mis à jour : ${newStatus}`)
      // Mise à jour locale pour la fluidité
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err: any) {
      toast.error("Échec de la mise à jour")
      console.error(err.message)
    }
  }

  const filteredOrders = orders.filter(order => {
    const term = search.toLowerCase()
    const matchesSearch = 
      order.id.toLowerCase().includes(term) || 
      (order.customer_name?.toLowerCase().includes(term)) ||
      (order.customer_phone?.includes(term))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Configuration visuelle des statuts
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Livré': 
        return { style: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={24}/> };
      case 'Expédié': 
        return { style: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Truck size={24}/> };
      case 'En cours': 
        return { style: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: <Package size={24}/> };
      case 'Annulé': 
        return { style: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={24}/> };
      default: 
        return { style: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={24}/> };
    }
  }

  if (loading) return (
    <div className="py-20 text-center font-black italic text-gray-400 animate-pulse uppercase tracking-widest">
      Récupération des commandes en cours...
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par nom, téléphone ou ID..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-purple-500/10 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {['all', 'En attente', 'En cours', 'Expédié', 'Livré', 'Annulé'].map((s) => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Toutes' : s}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES COMMANDES */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const config = getStatusConfig(order.status);
          return (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Infos Client */}
                <div className="flex gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:scale-110 duration-300 ${config.style}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-gray-900 uppercase italic tracking-tighter text-lg">
                        {order.customer_name || 'Client Inconnu'}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md uppercase">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <p className="text-[11px] text-gray-500 font-bold flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <Phone size={12} className="text-slate-400"/> {order.customer_phone || 'N/A'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <MapPin size={12} className="text-slate-400"/> {order.customer_address || 'Pas d\'adresse'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Montant et Action */}
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Total Commande</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                      {(order.total_price || 0).toLocaleString()} F
                    </p>
                  </div>
                  
                  <div className="relative">
                    <select 
                      value={order.status || 'En attente'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`pl-4 pr-10 py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all outline-none appearance-none cursor-pointer ${config.style}`}
                    >
                      <option value="En attente">En attente</option>
                      <option value="En cours">En cours</option>
                      <option value="Expédié">Expédié</option>
                      <option value="Livré">Livré</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        }) : (
          <div className="py-32 bg-white rounded-[3rem] text-center border-2 border-dashed border-gray-100">
            <ShoppingBag className="mx-auto text-gray-100 mb-4" size={64} />
            <p className="font-black italic text-gray-300 uppercase tracking-widest">Aucune commande trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}