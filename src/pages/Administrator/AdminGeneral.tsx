import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  LayoutDashboard, Store, Package, BarChart3, 
  ShoppingCart, Search, LogOut, Menu, X, 
  CheckCircle2, TrendingUp, Clock, Tag 
} from 'lucide-react'
import { toast } from 'sonner'

import AdminShops from './AdminShops'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCategories from './AdminCategories' // Importation du nouvel onglet

export default function AdminGeneral() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'products' | 'orders' | 'categories'>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    shopsCount: 0, 
    productsCount: 0, 
    ordersCount: 0,
    recentShops: [] as any[],
    pendingApprovals: [] as any[]
  })

  // RÉCUPÉRATION DES STATS
  const fetchAdminStats = async () => {
    try {
      const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
      const { count: sCount } = await supabase.from('shops').select('*', { count: 'exact', head: true })
      const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })

      const { data: ordersData } = await supabase.from('orders').select('total_price')
      const totalRev = ordersData?.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) || 0

      const { data: recentShopsData } = await supabase
        .from('shops')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(4)

      const { data: pending } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'pending')
        .limit(3)

      setStats({
        totalRevenue: totalRev,
        shopsCount: sCount || 0,
        productsCount: pCount || 0,
        ordersCount: oCount || 0,
        recentShops: recentShopsData || [],
        pendingApprovals: pending || []
      })
    } catch (err) {
      console.error("Erreur stats:", err)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [activeTab])

  const handleTabChange = (tab: any) => {
    setActiveTab(tab)
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[#1E1B4B] text-white flex flex-col p-6 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-purple-500/40 group-hover:rotate-12 transition-transform">F</div>
            <span className="text-xl font-black tracking-tighter italic uppercase">MasterHub</span>
          </div>
          <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
          <NavItem icon={<Store size={20}/>} label="Vendeurs" count={stats.shopsCount} active={activeTab === 'shops'} onClick={() => handleTabChange('shops')} />
          <NavItem icon={<Package size={20}/>} label="Produits" count={stats.productsCount} active={activeTab === 'products'} onClick={() => handleTabChange('products')} />
          <NavItem icon={<Tag size={20}/>} label="Catégories" active={activeTab === 'categories'} onClick={() => handleTabChange('categories')} />
          <NavItem icon={<ShoppingCart size={20}/>} label="Commandes" count={stats.ordersCount} active={activeTab === 'orders'} onClick={() => handleTabChange('orders')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-rose-400 transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
            <LogOut size={18}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 w-full lg:max-w-[calc(100%-18rem)] overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 lg:p-10 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-gray-100" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Administration</h2>
              <p className="text-2xl font-black text-gray-900 italic capitalize tracking-tighter">
                {activeTab === 'overview' ? 'Tableau de bord' : activeTab}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="hidden sm:block relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={16} />
               <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none w-48 focus:w-72 focus:border-purple-200 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-sm" 
                placeholder="Rechercher partout..." 
               />
            </div>
            <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-xs italic shadow-inner">A</div>
                <div className="hidden sm:block text-left leading-none">
                  <p className="text-[10px] font-black text-gray-900">Directeur</p>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Connecté</p>
                </div>
            </div>
          </div>
        </header>

        <div className="px-6 lg:px-10 pb-10">
          {activeTab === 'overview' && <OverviewSection stats={stats} setActiveTab={handleTabChange} />}
          {activeTab === 'shops' && <AdminShops />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'categories' && <AdminCategories />}
        </div>
      </main>
    </div>
  )
}

// --- SOUS-COMPOSANTS ---

function OverviewSection({ stats, setActiveTab }: { stats: any, setActiveTab: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Revenus Générés" value={`${stats.totalRevenue.toLocaleString()} F`} trend="+12.5%" icon={<BarChart3 />} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Partenaires" value={stats.shopsCount} trend={`+${stats.recentShops.length}`} icon={<Store />} color="text-orange-600" bg="bg-orange-50" />
        <StatCard title="Catalogue" value={stats.productsCount} trend="Live" icon={<Package />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Ventes Totales" value={stats.ordersCount} trend="Total" icon={<ShoppingCart />} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900 italic tracking-tighter uppercase">Nouveaux <span className="text-purple-600">Vendeurs</span></h3>
            <button onClick={() => setActiveTab('shops')} className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">Voir tout</button>
          </div>
          <div className="grid gap-4">
            {stats.recentShops.map((shop: any) => (
              <div key={shop.id} className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 rounded-[1.5rem] transition-all border border-transparent hover:border-purple-100">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-purple-600 shadow-sm border border-gray-50 group-hover:bg-purple-600 group-hover:text-white transition-colors uppercase italic">
                    {shop.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-900 uppercase tracking-tight">{shop.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold italic">{shop.profiles?.full_name || 'Propriétaire inconnu'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="hidden md:block text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscrit le</p>
                      <p className="text-xs font-bold text-gray-900">{new Date(shop.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Clock size={18}/></div>
            <h3 className="text-lg font-black text-gray-900 italic tracking-tighter uppercase">En <span className="text-amber-500">Attente</span></h3>
          </div>
          <div className="space-y-6">
              {stats.pendingApprovals.length > 0 ? stats.pendingApprovals.map((item: any) => (
                <ApprovalItem key={item.id} label={item.name} sub="Boutique" />
              )) : (
                <div className="py-10 text-center">
                   <CheckCircle2 className="mx-auto text-emerald-100 mb-3" size={40} />
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tout est à jour</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${active ? 'bg-[#8B5CF6] text-white shadow-xl shadow-purple-500/20 translate-x-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-4">{icon}<span>{label}</span></div>
      {count !== undefined && <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'}`}>{count}</span>}
    </button>
  )
}

function StatCard({ title, value, trend, icon, color, bg }: any) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>{icon}</div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-black text-gray-900 tracking-tighter italic">{value}</p>
        <div className="flex flex-col items-end">
          <TrendingUp size={14} className="text-emerald-500 mb-1" />
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">{trend}</span>
        </div>
      </div>
    </div>
  )
}

function ApprovalItem({ label, sub }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white text-purple-600 rounded-xl flex items-center justify-center shadow-sm"><CheckCircle2 size={16}/></div>
        <div>
          <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{label}</p>
          <p className="text-[9px] text-gray-400 italic font-bold uppercase">{sub}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="p-2 bg-white text-emerald-500 rounded-xl shadow-sm hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={14}/></button>
        <button className="p-2 bg-white text-rose-500 rounded-xl shadow-sm hover:bg-rose-500 hover:text-white transition-all"><X size={14}/></button>
      </div>
    </div>
  )
}