import { useState } from 'react'
import AdminProducts from './AdminProducts'
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from 'lucide-react'

export default function AdminShop() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'stats'>('products')

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      
      {/* SIDEBAR FIXE */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black italic">B</div>
          <span className="text-xl font-black tracking-tighter italic">BOUTIQUE<span className="text-brand-primary">.</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20}/>} 
            label="Dashboard" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
          />
          <SidebarItem 
            icon={<Package size={20}/>} 
            label="Produits" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarItem 
            icon={<ShoppingCart size={20}/>} 
            label="Commandes" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">
          <LogOut size={20}/> Déconnexion
        </button>
      </aside>

      {/* CONTENU PRINCIPAL DYNAMIQUE */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'products' && <AdminProducts />}
        
        {activeTab === 'orders' && (
          <div className="p-10 text-center text-gray-400 font-black italic">Gestion des commandes bientôt disponible...</div>
        )}

        {activeTab === 'stats' && (
          <div className="p-10 text-center text-gray-400 font-black italic">Statistiques globales bientôt disponibles...</div>
        )}
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black transition-all ${
        active 
        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      }`}
    >
      {icon}
      <span className="text-sm uppercase tracking-wider">{label}</span>
    </button>
  )
}