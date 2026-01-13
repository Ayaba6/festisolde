import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { Plus, Package, ShoppingBag, Wallet, Store, Edit3, Trash2, Tag, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0 })
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      // 1. Charger la boutique
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (shopData) {
        setShop(shopData)

        // 2. Charger les produits ET les ventes (order_items)
        const [prodsRes, itemsRes] = await Promise.all([
          supabase.from('products').select('*').eq('shop_id', shopData.id).order('created_at', { ascending: false }),
          supabase.from('order_items').select('product_id, quantity, price').eq('shop_id', shopData.id)
        ])

        if (prodsRes.data) {
          // Calculer le nombre vendu par produit
          const salesMap = (itemsRes.data || []).reduce((acc: any, item: any) => {
            acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity
            return acc
          }, {})

          // Fusionner les infos
          const productsWithSales = prodsRes.data.map(p => ({
            ...p,
            sold_count: salesMap[p.id] || 0,
            status: p.stock > 0 ? 'En stock' : 'Rupture'
          }))

          setProducts(productsWithSales)
          
          // Mettre à jour les stats globales
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

    loadDashboardData()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600 animate-pulse">Chargement du Dashboard...</div>
  if (!shop) return <NoShopView />

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Tableau de bord</h1>
          <p className="text-gray-500 font-medium">Gestion de <span className="text-indigo-600">{shop.name}</span></p>
        </div>
        <Link to="/vendor/add-product" className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          <Plus size={20} /> Ajouter un produit
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Articles" value={stats.products} icon={<Package className="text-blue-600" />} bgColor="bg-blue-50" />
        <StatCard title="Vendus" value={stats.orders} icon={<BarChart3 className="text-emerald-600" />} bgColor="bg-emerald-50" />
        <StatCard title="Revenus" value={`${stats.sales.toLocaleString()} F`} icon={<Wallet className="text-indigo-600" />} bgColor="bg-indigo-50" isHighlight />
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="text-2xl font-black text-gray-900 mb-8">Inventaire</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-2">Produit</th>
                <th className="px-6 py-2">Catégorie</th>
                <th className="px-6 py-2">Statut</th>
                <th className="px-6 py-2">Vendu</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                  <td className="px-6 py-4 rounded-l-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-indigo-600 font-black">{p.price.toLocaleString()} F</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full w-fit">
                      <Tag size={12} /> {p.category || 'Général'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${
                      p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.stock > 0 ? `En Stock (${p.stock})` : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900">{p.sold_count}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">unités</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></button>
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, bgColor, isHighlight }: any) {
    return (
      <div className={`p-8 rounded-[2.5rem] border border-gray-100 transition-all ${isHighlight ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/50' : 'bg-white'}`}>
        <div className={`${bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>{icon}</div>
        <h2 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">{title}</h2>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
    )
}

function NoShopView() { /* ... garder ton code précédent ... */ return <div>Aucune boutique</div> }