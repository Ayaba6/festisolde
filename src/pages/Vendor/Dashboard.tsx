import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { Plus, Package, Wallet, Store, Edit3, Trash2, Tag, BarChart3, ArrowUpRight, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0 })
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
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
    setLoading(false)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleDelete = async (productId: string, title: string) => {
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer "${title}" ? Cette action est irréversible.`);
    
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)

        if (error) throw error

        toast.success("Produit supprimé")
        setProducts(products.filter(p => p.id !== productId))
        setStats(prev => ({ ...prev, products: prev.products - 1 }))
      } catch (err: any) {
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-indigo-900 uppercase tracking-widest text-xs">Chargement...</p>
    </div>
  )

  if (!shop) return <NoShopView />

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg"><Store size={20}/></span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Gestion Boutique</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter italic">
              Tableau de <span className="text-indigo-600">Bord</span>
            </h1>
          </div>
          <Link to="/vendor/add-product" className="group flex items-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            Ajouter un produit
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Articles" value={stats.products} icon={<Package size={24} />} color="blue" />
          <StatCard title="Vendus" value={stats.orders} icon={<BarChart3 size={24} />} color="emerald" />
          <StatCard title="Revenus" value={`${stats.sales.toLocaleString()} F`} icon={<Wallet size={24} />} color="indigo" isHighlight />
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-[3rem] p-6 md:p-10 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black tracking-tighter">Inventaire</h3>
            <button onClick={loadDashboardData} className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors">Actualiser la liste</button>
          </div>

          <div className="overflow-x-auto">
            {products.length > 0 ? (
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="px-6 pb-2">Produit</th>
                    <th className="px-6 pb-2">Catégorie</th>
                    <th className="px-6 pb-2">Stock</th>
                    <th className="px-6 pb-2">Performance</th>
                    <th className="px-6 pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="bg-gray-50/50 group hover:bg-white hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300">
                      <td className="px-6 py-5 rounded-l-[2rem] border-y border-l border-transparent group-hover:border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shrink-0 border border-gray-200">
                            {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold line-clamp-1">{p.title}</span>
                            <span className="text-sm font-black text-indigo-600">{p.price.toLocaleString()} F CFA</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-y border-transparent group-hover:border-gray-100">
                        <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl uppercase">
                          {p.category || 'Général'}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-y border-transparent group-hover:border-gray-100">
                        <div className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl inline-block ${
                          p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {p.stock > 0 ? `${p.stock} unités` : 'Rupture'}
                        </div>
                      </td>
                      <td className="px-6 py-5 border-y border-transparent group-hover:border-gray-100">
                        <div className="flex items-center gap-2 font-black italic text-gray-700">
                          {p.sold_count} <ArrowUpRight size={14} className="text-emerald-500" />
                        </div>
                      </td>
                      <td className="px-6 py-5 rounded-r-[2rem] border-y border-r border-transparent group-hover:border-gray-100 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* LIEN MODIFIER ACTIVÉ ICI */}
                          <Link 
                            to={`/vendor/edit-product/${p.id}`}
                            className="p-3 bg-white border-2 border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-400 rounded-xl transition-all shadow-sm active:scale-90"
                            title="Modifier le produit"
                          >
                            <Edit3 size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-3 bg-white border-2 border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-400 rounded-xl transition-all shadow-sm active:scale-90"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                    <ShoppingBag size={40} />
                 </div>
                 <p className="font-bold text-gray-400">Aucun produit en ligne.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, isHighlight }: any) {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-600 text-white'
  }

  return (
    <div className={`p-10 rounded-[3rem] border transition-all duration-300 ${isHighlight ? 'bg-white border-indigo-100 shadow-2xl shadow-indigo-100/50' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className={`${colors[color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm`}>{icon}</div>
      <h2 className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{title}</h2>
      <p className="text-4xl font-black tracking-tighter">{value}</p>
    </div>
  )
}

function NoShopView() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <div className="w-24 h-24 bg-white shadow-xl text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-200">
        <Store size={44} />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Votre boutique vous attend</h2>
      <p className="text-gray-500 mb-10 max-w-xs font-medium italic">Configurez votre espace et commencez à vendre vos articles dès maintenant.</p>
      <Link to="/vendor/setup" className="bg-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
        Créer ma boutique
      </Link>
    </div>
  )
}