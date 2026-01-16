import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  LayoutDashboard, Store, Package, BarChart3, 
  AlertCircle, Bell, Settings, CheckCircle2, 
  Clock, ArrowUpRight, ShoppingCart, Search,
  TrendingUp, LogOut, Menu, X 
} from 'lucide-react'

import AdminShops from './AdminShops'
import AdminProducts from './AdminProducts'

export default function AdminGeneral() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'products' | 'orders'>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // État pour le menu mobile
  const [stats, setStats] = useState({ 
    totalRevenue: 811000, 
    shopsCount: 0, 
    productsCount: 0, 
    ordersCount: 0,
    recentShops: [] as any[]
  })

  useEffect(() => {
    const fetchAdminStats = async () => {
      const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
      const { count: sCount, data: recentShopsData } = await supabase
        .from('shops')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(3)
      const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })

      setStats(prev => ({
        ...prev,
        shopsCount: sCount || 0,
        productsCount: pCount || 0,
        ordersCount: oCount || 0,
        recentShops: recentShopsData || []
      }))
    }
    fetchAdminStats()
  }, [])

  // Fermer la sidebar lors du changement d'onglet sur mobile
  const handleTabChange = (tab: any) => {
    setActiveTab(tab)
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - Responsive (cachée sur mobile, coulissante) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[#1E1B4B] text-white flex flex-col p-6 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-purple-500/20">F</div>
            <span className="text-xl font-black tracking-tighter italic uppercase">MasterHub</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
          <NavItem icon={<Store size={20}/>} label="Vendeurs" count={stats.shopsCount} active={activeTab === 'shops'} onClick={() => handleTabChange('shops')} />
          <NavItem icon={<Package size={20}/>} label="Produits" count={stats.productsCount} active={activeTab === 'products'} onClick={() => handleTabChange('products')} />
          <NavItem icon={<ShoppingCart size={20}/>} label="Commandes" count={stats.ordersCount} active={activeTab === 'orders'} onClick={() => handleTabChange('orders')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
            <LogOut size={18}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 w-full lg:max-w-[calc(100%-18rem)]">
        
        {/* HEADER RESPONSIVE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 lg:p-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-gray-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Festi Solde</h2>
              <p className="text-2xl font-black text-gray-900 italic capitalize">{activeTab}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="hidden sm:block relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input type="text" className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs outline-none w-48 focus:w-64 transition-all" placeholder="Rechercher..." />
            </div>
            <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-gray-100 shadow-sm">
               <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-xs italic">A</div>
               <span className="hidden sm:inline text-xs font-black text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        {/* CONTENU DYNAMIQUE AVEC PADDING ADAPTATIF */}
        <div className="px-6 lg:px-10 pb-10">
          {activeTab === 'overview' && <OverviewSection stats={stats} setActiveTab={handleTabChange} />}
          {activeTab === 'shops' && <AdminShops />}
          {activeTab === 'products' && <AdminProducts />}
        </div>
      </main>
    </div>
  )
}

function OverviewSection({ stats, setActiveTab }: { stats: any, setActiveTab: any }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* KPI CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Revenus" value={`${stats.totalRevenue.toLocaleString()} F`} trend="+12%" icon={<BarChart3 />} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Vendeurs" value={stats.shopsCount} trend="+3" icon={<Store />} color="text-orange-600" bg="bg-orange-100" />
        <StatCard title="Produits" value={stats.productsCount} trend="+12" icon={<Package />} color="text-emerald-600" bg="bg-emerald-100" />
        <StatCard title="Commandes" value={stats.ordersCount} trend="+5" icon={<ShoppingCart />} color="text-blue-600" bg="bg-blue-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* TOP VENDEURS */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-50 overflow-hidden">
          <h3 className="text-lg font-black text-gray-900 mb-6 italic">Top <span className="text-purple-600">Vendeurs</span></h3>
          <div className="space-y-4 overflow-x-auto">
            {stats.recentShops.map((shop: any) => (
              <div key={shop.id} className="min-w-[300px] flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-purple-600 shadow-sm border border-gray-100">{shop.name.charAt(0)}</div>
                  <p className="font-bold text-sm text-gray-900">{shop.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-gray-900">950K F</p>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Actif</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODÉRATION */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-50">
          <h3 className="text-lg font-black text-gray-900 mb-6 italic">Alertes</h3>
          <div className="space-y-6">
             <ApprovalItem label="SportMax" sub="Boutique" />
             <ApprovalItem label="Iphone 15" sub="Produit" />
             <ApprovalItem label="BeautyBox" sub="Boutique" />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SOUS-COMPOSANTS RÉUTILISABLES ---

function NavItem({ icon, label, active, onClick, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-wider ${active ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-4">{icon}<span>{label}</span></div>
      {count !== undefined && <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md">{count}</span>}
    </button>
  )
}

function StatCard({ title, value, trend, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-xl font-black text-gray-900">{value}</p>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
      </div>
    </div>
  )
}

function ApprovalItem({ label, sub }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><CheckCircle2 size={16}/></div>
        <div>
          <p className="text-xs font-bold text-gray-900">{label}</p>
          <p className="text-[10px] text-gray-400 italic font-medium">{sub}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={14}/></button>
        <button className="p-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-500 hover:text-white transition-all"><X size={14}/></button>
      </div>
    </div>
  )
}