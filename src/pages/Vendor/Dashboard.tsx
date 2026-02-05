import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, Package, Wallet, Store, Edit3, Trash2, 
  BarChart3, ArrowUpRight, ShoppingBag, RefreshCw,
  LayoutDashboard, MessageSquare, Phone
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0 })
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      // 1. Récupérer la boutique du vendeur connecté
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (shopData) {
        setShop(shopData)

        // 2. Récupérer Produits et Ventes spécifiques à cette boutique
        const [prodsRes, itemsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('shop_id', shopData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('order_items')
            .select(`
              *,
              orders (
                customer_name,
                customer_phone,
                customer_address,
                custom_message,
                status,
                created_at
              )
            `)
            .eq('shop_id', shopData.id) // Filtrage par shop_id corrigé
            .order('created_at', { ascending: false })
        ])

        if (prodsRes.data) {
          // Calcul des ventes par produit (pour l'affichage dans le tableau)
          const salesMap = (itemsRes.data || []).reduce((acc: any, item: any) => {
            acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity
            return acc
          }, {})

          const productsWithSales = prodsRes.data.map(p => ({
            ...p,
            sold_count: salesMap[p.id] || 0
          }))

          setProducts(productsWithSales)
          setRecentOrders(itemsRes.data || [])
          
          // Calcul des stats globales de la boutique
          const totalSalesValue = (itemsRes.data || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)
          setStats({
            products: prodsRes.data.length,
            orders: itemsRes.data?.length || 0,
            sales: totalSalesValue
          })
        }
      }
    } catch (error) {
      console.error("Erreur Dashboard:", error)
      toast.error("Erreur de synchronisation")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleDelete = async (productId: string, title: string) => {
    if (confirm(`Voulez-vous vraiment supprimer "${title}" ?`)) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId)
        if (error) throw error
        toast.success("Produit retiré")
        setProducts(products.filter(p => p.id !== productId))
        setStats(prev => ({ ...prev, products: prev.products - 1 }))
      } catch (err) {
        toast.error("Action impossible")
      }
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-slate-900">
      <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4" />
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Chargement de votre shop...</p>
    </div>
  )

  if (!shop) return <NoShopView />

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 text-slate-900">
      {/* NAVBAR */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black italic text-xl tracking-tighter">
            <div className="bg-rose-600 p-1.5 rounded-lg text-white shadow-lg">
              <LayoutDashboard size={18} />
            </div>
            DASHBOARD<span className="text-rose-600">PRO</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={loadDashboardData} className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs border-2 border-white shadow-sm">
               {shop.name.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter italic uppercase text-slate-900">
              Hello, <span className="text-rose-600">{shop.name}</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm italic mt-1 uppercase tracking-wider">
               Gestion de votre catalogue & commandes
            </p>
          </div>
          <Link to="/vendor/add-product" className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200">
            <Plus size={18} strokeWidth={3} /> 
            Ajouter un produit
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Articles" value={stats.products} icon={<Package size={22} />} trend="Actifs" />
          <StatCard title="Ventes" value={stats.orders} icon={<BarChart3 size={22} />} trend="Commandes" />
          <StatCard title="Revenus" value={`${stats.sales.toLocaleString()} F`} icon={<Wallet size={22} />} isHighlight />
        </div>

        {/* VENTES RÉCENTES */}
        <div className="mb-12">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                 <ShoppingBag size={18} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">Ventes de la boutique</h3>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentOrders.length > 0 ? recentOrders.slice(0, 6).map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-black text-xs">
                            {item.quantity}x
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm uppercase leading-tight">{item.product_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                               Client: {item.orders?.customer_name}
                            </p>
                         </div>
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter ${
                        item.orders?.status === 'Livré' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                         {item.orders?.status || 'En attente'}
                      </span>
                   </div>

                   {item.orders?.custom_message && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex gap-3 italic text-slate-600 text-xs">
                         <MessageSquare size={14} className="shrink-0 text-rose-400" />
                         "{item.orders.custom_message}"
                      </div>
                   )}

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                           <Phone size={12} />
                         </div>
                         <span className="text-xs font-bold text-slate-600">{item.orders?.customer_phone}</span>
                      </div>
                      <p className="text-sm font-black text-rose-600">{(item.price * item.quantity).toLocaleString()} F</p>
                   </div>
                </div>
              )) : (
                <div className="col-span-2 py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                   <ShoppingBag size={40} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                      En attente de votre première vente... 🌹
                   </p>
                </div>
              )}
           </div>
        </div>

        {/* TABLEAU INVENTAIRE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">Votre Catalogue</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-1.5 rounded-full">
               {products.length} Produits
            </span>
          </div>

          <div className="overflow-x-auto">
            {products.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black bg-slate-50/50">
                    <th className="px-8 py-4">Produit</th>
                    <th className="px-6 py-4">État</th>
                    <th className="px-6 py-4">Ventes</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={p.id} 
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                            <img src={p.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 uppercase italic text-xs">{p.title}</span>
                            <span className="text-[10px] font-bold text-rose-600 mt-0.5">
                              {p.price?.toLocaleString()} F
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${
                          p.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {p.stock > 0 ? `En Stock (${p.stock})` : 'Rupture'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 font-black text-slate-700 italic text-sm">
                          {p.sold_count} <ArrowUpRight size={14} className="text-emerald-500" />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/vendor/edit-product/${p.id}`} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Edit3 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.title)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center">
                 <ShoppingBag size={32} className="text-slate-100 mb-4" />
                 <p className="font-black uppercase italic text-slate-400 tracking-tighter text-sm">Aucun article en ligne</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composants internes pour la propreté
function StatCard({ title, value, icon, isHighlight, trend }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all ${
      isHighlight 
      ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
      : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
    }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
        isHighlight ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' : 'bg-rose-50 text-rose-600'
      }`}>
        {icon}
      </div>
      <h2 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-1 ${isHighlight ? 'text-slate-400' : 'text-slate-400'}`}>{title}</h2>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black tracking-tighter italic">{value}</p>
        {trend && <span className="text-[9px] font-black uppercase text-rose-500 italic">{trend}</span>}
      </div>
    </div>
  )
}

function NoShopView() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white text-slate-900">
      <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mb-8 border border-rose-100 shadow-inner">
        <Store size={40} />
      </div>
      <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Propulsez votre <span className="text-rose-600">Business</span></h2>
      <p className="text-slate-400 mb-10 max-w-sm font-bold italic text-sm uppercase tracking-tight">Créez votre boutique et commencez à vendre en quelques minutes.</p>
      <Link to="/vendor/setup" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-rose-600 flex items-center gap-3 transition-all active:scale-95">
        Lancer ma Boutique <Plus size={18} />
      </Link>
    </div>
  )
}