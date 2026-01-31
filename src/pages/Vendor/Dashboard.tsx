import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, Package, Wallet, Store, Edit3, Trash2, 
  BarChart3, ArrowUpRight, ShoppingBag, RefreshCw,
  LayoutDashboard, Settings, Info
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0 })
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (shopData) {
        setShop(shopData)

        const [prodsRes, itemsRes] = await Promise.all([
          supabase.from('products').select('*').eq('shop_id', shopData.id).order('created_at', { ascending: false }),
          supabase.from('order_items').select('product_id, quantity, price').eq('shop_id', shopData.id)
        ])

        if (prodsRes.data) {
          const salesMap = (itemsRes.data || []).reduce((acc: any, item: any) => {
            acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity
            return acc
          }, {})

          const productsWithSales = prodsRes.data.map(p => ({
            ...p,
            sold_count: salesMap[p.id] || 0
          }))

          setProducts(productsWithSales)
          
          const totalSales = (itemsRes.data || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)
          setStats({
            products: prodsRes.data.length,
            orders: itemsRes.data?.length || 0,
            sales: totalSales
          })
        }
      }
    } catch (error) {
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
        toast.success("Produit retiré de l'inventaire")
        setProducts(products.filter(p => p.id !== productId))
        setStats(prev => ({ ...prev, products: prev.products - 1 }))
      } catch (err) {
        toast.error("Action impossible pour le moment")
      }
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
      <p className="font-black text-gray-900 uppercase tracking-[0.3em] text-[10px]">Chargement sécurisé...</p>
    </div>
  )

  if (!shop) return <NoShopView />

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* BARRE DE NAVIGATION VENDEUR */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black italic text-xl tracking-tighter">
            <div className="bg-brand-primary p-1.5 rounded-lg text-white shadow-lg shadow-brand-primary/20">
              <LayoutDashboard size={18} />
            </div>
            FESTI<span className="text-brand-primary">SOLDE PRO</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="text-gray-400 hover:text-brand-primary transition-colors">
                <Settings size={20} />
             </button>
             <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xs shadow-md">
               {shop.name.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter italic uppercase">
              Mon <span className="text-brand-primary">Espace Vendeur</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm italic mt-1 uppercase tracking-wider opacity-70">
               {shop.name} — Partenaire Officiel FestiSolde
            </p>
          </div>
          <Link to="/vendor/add-product" className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-gray-200">
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
            Ajouter un Article
          </Link>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Articles en ligne" value={stats.products} icon={<Package size={22} />} trend="Stock actif" />
          <StatCard title="Ventes conclues" value={stats.orders} icon={<BarChart3 size={22} />} trend="+12% ce mois" />
          <StatCard title="Gains totaux" value={`${stats.sales.toLocaleString()} F`} icon={<Wallet size={22} />} isHighlight />
        </div>

        {/* BANNIÈRE STRATÉGIQUE (Nouveau) */}
        <div className="bg-brand-primary/5 rounded-[2rem] p-6 mb-12 border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-sm">
              <Info size={22} />
            </div>
            <div>
              <p className="text-brand-dark font-black text-sm uppercase italic leading-none mb-1">Boostez votre visibilité</p>
              <p className="text-slate-500 text-[11px] font-bold">Les articles avec un prix promo s'affichent en priorité sur la page d'accueil.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl text-slate-400 border border-slate-100 shadow-sm">
              Commission : 10%
            </span>
          </div>
        </div>

        {/* SECTION INVENTAIRE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black uppercase italic tracking-tight">Gestion du Stock</h3>
            <button 
              onClick={loadDashboardData} 
              disabled={refreshing}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 px-4 py-2 rounded-xl hover:bg-brand-primary/10 transition-all"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              Actualiser les données
            </button>
          </div>

          <div className="overflow-x-auto">
            {products.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black bg-slate-50/50">
                    <th className="px-8 py-4">Désignation</th>
                    <th className="px-6 py-4">État Stock</th>
                    <th className="px-6 py-4">Vendus</th>
                    <th className="px-8 py-4 text-right">Modifier</th>
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
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <img src={p.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 leading-tight uppercase italic text-sm">{p.nom || p.title}</span>
                            <span className="text-xs font-bold text-brand-primary mt-1">
                              {p.promo_price ? p.promo_price.toLocaleString() : p.price?.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                          p.stock > 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {p.stock > 0 ? `${p.stock} Unités` : 'Rupture'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 font-black text-gray-700 italic">
                          {p.sold_count} <ArrowUpRight size={14} className="text-emerald-500" />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/vendor/edit-product/${p.id}`}
                            className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-brand-primary hover:border-brand-primary/30 rounded-xl transition-all shadow-sm"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(p.id, p.nom || p.title)}
                            className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-4 text-gray-300">
                    <ShoppingBag size={32} />
                 </div>
                 <p className="font-black uppercase italic text-gray-400 tracking-tighter">Aucun article enregistré</p>
                 <Link to="/vendor/add-product" className="text-brand-primary font-black uppercase text-[10px] mt-2 tracking-widest hover:underline">Ouvrir mon rayon maintenant</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, isHighlight, trend }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${
      isHighlight 
      ? 'bg-gray-900 border-gray-900 text-white shadow-2xl shadow-gray-200' 
      : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1'
    }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
        isHighlight ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'
      }`}>
        {icon}
      </div>
      <h2 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-1 ${isHighlight ? 'text-gray-400' : 'text-gray-400'}`}>
        {title}
      </h2>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black tracking-tighter italic">{value}</p>
        {trend && <span className="text-[9px] font-black uppercase text-emerald-500 italic">{trend}</span>}
      </div>
    </div>
  )
}

function NoShopView() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white overflow-hidden">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-brand-primary/10 text-brand-primary rounded-[2.5rem] flex items-center justify-center mb-8 border border-brand-primary/20 shadow-inner"
      >
        <Store size={40} />
      </motion.div>
      <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase">Propulsez votre <span className="text-brand-primary">Commerce</span></h2>
      <p className="text-gray-500 mb-10 max-w-sm font-medium italic">Rejoignez FestiSolde et vendez vos articles aux milliers de clients qui attendent vos promos.</p>
      <Link to="/vendor/setup" className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-brand-primary transition-all active:scale-95 flex items-center gap-3">
        Créer ma Boutique <Plus size={18} />
      </Link>
    </div>
  )
}