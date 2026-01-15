import { useState } from 'react'
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Menu, X } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
    { icon: ShoppingBag, label: 'Produits', path: '/admin/products' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
    { icon: Settings, label: 'Réglages', path: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 font-black text-2xl text-brand-primary italic">Festi<span className="text-gray-900">Admin</span></div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-brand-primary transition-all">
              <item.icon size={22} />
              {isSidebarOpen && <span className="font-bold">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button className="m-4 p-3 flex items-center gap-4 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all">
          <LogOut size={22} />
          {isSidebarOpen && <span>Déconnexion</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-white rounded-lg shadow-sm">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">Admin FestiSolde</span>
            <div className="w-10 h-10 rounded-full bg-brand-primary"></div>
          </div>
        </header>

        <Outlet /> {/* Ici s'afficheront les pages spécifiques */}
      </main>
    </div>
  )
}