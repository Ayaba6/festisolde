import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  LayoutDashboard, Store, Package, Users, 
  BarChart3, ShieldCheck, AlertCircle, 
  ArrowUpRight, TrendingUp, Bell, Search,
  Settings, CheckCircle2, Clock
} from 'lucide-react'

// Imports des sous-composants (à créer ou existants)
import AdminShops from './AdminShops'
import AdminProducts from './AdminProducts'

export default function AdminGeneral() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'products' | 'orders'>('overview')
  const [stats, setStats] = useState({ products: 0, shops: 0, stockAlerts: 0 })

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* SIDEBAR GAUCHE - FIXE */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col p-6 fixed h-full z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-brand-primary/20">F</div>
          <span className="text-xl font-black tracking-tighter italic">MASTER<span className="text-brand-primary">HUB</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Vue d'ensemble" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Store size={20}/>} label="Gestion Boutiques" active={activeTab === 'shops'} onClick={() => setActiveTab('shops')} />
          <NavItem icon={<Package size={20}/>} label="Catalogue Global" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <NavItem icon={<Clock size={20}/>} label="Suivi Commandes" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        </nav>

        <div className="pt-6 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
            <Settings size={18}/> Paramètres Système
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 ml-72 p-10">
        
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Tableau de bord</h2>
            <p className="text-3xl font-black text-gray-900 italic capitalize">{activeTab}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Bell className="text-gray-400 group-hover:text-brand-primary cursor-pointer transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900">Admin General</p>
                <p className="text-[10px] text-brand-primary font-bold uppercase tracking-tighter">Superuser</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* RENDU DYNAMIQUE SELON L'ONGLET */}
        {activeTab === 'overview' && <OverviewSection setActiveTab={setActiveTab} />}
        {activeTab === 'shops' && <AdminShops />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'orders' && (
           <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <Clock size={48} className="text-gray-200 mb-4" />
             <p className="text-gray-400 font-black italic uppercase tracking-widest">Module Commandes en développement...</p>
           </div>
        )}
      </main>
    </div>
  )
}

// --- SOUS-SECTION : VUE D'ENSEMBLE ---
function OverviewSection({ setActiveTab }: { setActiveTab: any }) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ventes Totales" value="2,450,000 F" trend="+14%" icon={<BarChart3 />} color="bg-indigo-600" />
        <StatCard title="Vendeurs Actifs" value="18" trend="+2" icon={<Store />} color="bg-blue-500" />
        <StatCard title="Produits" value="482" trend="+12%" icon={<Package />} color="bg-emerald-500" />
        <StatCard title="Alertes Stock" value="12" trend="Action requise" icon={<AlertCircle />} color="bg-rose-500" isAlert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DERNIÈRES BOUTIQUES CRÉÉES */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black italic">Boutiques <span className="text-brand-primary">récentes</span></h3>
            <button onClick={() => setActiveTab('shops')} className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">Voir tout</button>
          </div>
          <div className="space-y-4">
             {/* Répéter ce bloc pour chaque shop */}
             {[1, 2].map(i => (
               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-brand-primary italic">S{i}</div>
                   <div>
                     <p className="font-bold text-gray-900">Boutique Numero {i}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Inscrit le : 14 Jan. 2026</p>
                   </div>
                 </div>
                 <CheckCircle2 className="text-emerald-500" size={20} />
               </div>
             ))}
          </div>
        </div>

        {/* ACTIVITÉ SYSTÈME */}
        <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-xl font-black italic mb-6">Status Platform</h3>
             <div className="space-y-6">
               <ActivityItem label="Paiements" status="Opérationnel" color="bg-emerald-400" />
               <ActivityItem label="Serveur API" status="99.9% stable" color="bg-emerald-400" />
               <ActivityItem label="Modération" status="3 en attente" color="bg-amber-400" />
             </div>
             <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Consulter les logs</button>
           </div>
           <BarChart3 className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
        </div>
      </div>
    </div>
  )
}

// --- PETITS COMPOSANTS UTILES ---

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-wider ${
        active ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function StatCard({ title, value, trend, icon, color, isAlert }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isAlert ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}

function ActivityItem({ label, status, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`}></span>
        <span className="text-xs font-black uppercase tracking-tighter">{status}</span>
      </div>
    </div>
  )
}