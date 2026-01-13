import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ShoppingCart, User as UserIcon, LogOut, Menu, X } from 'lucide-react'

interface HeaderProps {
  user: any | null
  setUser: (user: any | null) => void
  cartCount: number
  onOpenCart: () => void 
}

export default function Header({ user, setUser, cartCount, onOpenCart }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/auth/login')
  }

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Utilisateur'

  return (
    <div className="sticky top-0 z-50 w-full shadow-sm">
      {/* 1. BANNIÈRE */}
      <div className="bg-[#0f172a] text-white py-2 px-4 text-center flex items-center justify-center">
        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">
          Livraison rapide sur <span className="text-indigo-400">Ouagadougou & Bobo</span>
        </p>
      </div>

      {/* 2. HEADER PRINCIPAL */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
              F
            </div>
            <span className="font-black text-2xl tracking-tighter text-gray-900 hidden sm:block">
              Festi<span className="text-indigo-600">Solde</span>
            </span>
          </Link>

          {/* DESKTOP NAV & ACTIONS */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 mr-4 font-black text-sm uppercase tracking-widest">
              <Link to="/" className="text-gray-500 hover:text-indigo-600">Accueil</Link>
              <Link to="/products" className="text-gray-500 hover:text-indigo-600">Boutique</Link>
              {user?.role === 'vendor' && <Link to="/vendor/dashboard" className="text-indigo-600">Ventes</Link>}
            </nav>

            {/* BOUTON PANIER (Déclencheur) */}
            <button 
              onClick={onOpenCart} 
              className="relative p-2.5 bg-gray-50 rounded-full hover:bg-indigo-50 transition-colors group"
            >
              <ShoppingCart size={22} className="text-gray-700 group-hover:text-indigo-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

            {/* PROFIL / LOGIN */}
            {!user ? (
              <Link to="/auth/login" className="hidden sm:flex items-center gap-2 text-sm font-black text-gray-900 hover:text-indigo-600 transition">
                <UserIcon size={18} /> Connexion
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right leading-tight">
                  <p className="text-xs font-black text-gray-900 leading-none">{displayName}</p>
                  <p className="text-[9px] uppercase font-bold text-indigo-500 tracking-tighter mt-1">
                    {user.role === 'vendor' ? 'Vendeur' : 'Client'}
                  </p>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {/* MOBILE BURGER */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-xl transition">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-4">
            <Link to="/" className="text-xl font-black py-2">Accueil</Link>
            <Link to="/products" className="text-xl font-black py-2">Boutique</Link>
            <button onClick={() => { setMenuOpen(false); onOpenCart(); }} className="text-xl font-black py-2 text-left flex justify-between items-center text-indigo-600">
              Mon Panier <span>({cartCount})</span>
            </button>
            <hr className="my-2 border-gray-50" />
            {!user ? (
              <Link to="/auth/login" className="bg-indigo-600 text-white text-center py-4 rounded-2xl font-black">Se connecter</Link>
            ) : (
              <button onClick={handleLogout} className="text-red-500 font-black py-4 border-2 border-red-500 rounded-2xl">Déconnexion</button>
            )}
          </nav>
        )}
      </header>
    </div>
  )
}