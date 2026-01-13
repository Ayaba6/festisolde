import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, ChevronDown, Settings, Package, LayoutDashboard } from 'lucide-react'

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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isVendor, setIsVendor] = useState(false) // État pour vérifier si c'est un vendeur

  // Vérifier le statut de vendeur au chargement ou quand l'utilisateur change
  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!user) return
      
      const { data, error } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (data && !error) {
        setIsVendor(true)
      }
    }
    checkVendorStatus()
  }, [user])

  useEffect(() => { 
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [location])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/auth/login')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#FF5A5A] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100 group-hover:rotate-6 transition-transform">
              <span className="text-xl font-black italic">f</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-tighter text-gray-900">
                Festi <span className="text-[#FF5A5A]">Solde</span>
              </span>
            </div>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className={`text-sm font-black uppercase tracking-wider transition-colors ${location.pathname === '/' ? 'text-[#FF5A5A]' : 'text-gray-900 hover:text-[#FF5A5A]'}`}>
              Accueil
            </Link>
            <Link to="/products" className={`text-sm font-black uppercase tracking-wider transition-colors ${location.pathname === '/products' ? 'text-[#FF5A5A]' : 'text-gray-900 hover:text-[#FF5A5A]'}`}>
              Boutique
            </Link>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button onClick={onOpenCart} className="relative p-3 text-gray-900 hover:bg-gray-50 rounded-2xl transition-all active:scale-90">
              <ShoppingBag size={24} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#FF5A5A] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {!user ? (
              <Link to="/auth/login" className="bg-[#FF5A5A] hover:bg-[#ff4444] text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-100 active:scale-95 hidden sm:block">
                Connexion
              </Link>
            ) : (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF7B7B] to-[#FF5A5A] rounded-full flex items-center justify-center text-white font-black shadow-md">
                    {initial}
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 py-3 z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="px-6 py-4 border-b border-gray-50 mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compte</p>
                        <p className="text-sm font-black text-gray-900 truncate">{user.email}</p>
                      </div>

                      <Link to="/orders" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:text-[#FF5A5A] transition-colors font-bold text-sm">
                        <Package size={18} className="opacity-50" />
                        Mes commandes
                      </Link>

                      {/* CONDITION ADMINISTRATION / DASHBOARD */}
                      {isVendor ? (
                        <Link to="/vendor/dashboard" className="flex items-center gap-3 px-6 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors font-black text-sm">
                          <LayoutDashboard size={18} />
                          Tableau de bord
                        </Link>
                      ) : (
                        <Link to="/vendor/create-shop" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:text-[#FF5A5A] transition-colors font-bold text-sm">
                          <Settings size={18} className="opacity-50" />
                          Devenir Vendeur
                        </Link>
                      )}

                      <div className="h-px bg-gray-50 my-2 mx-4" />

                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-rose-500 hover:bg-rose-50 transition-colors font-black text-sm">
                        <LogOut size={18} />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-900 hover:bg-gray-50 rounded-xl">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {menuOpen && (
          <nav className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 p-8 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <Link to="/" className="text-2xl font-black text-gray-900">Accueil</Link>
            <Link to="/products" className="text-2xl font-black text-gray-900">Boutique</Link>
            {isVendor && <Link to="/vendor/dashboard" className="text-2xl font-black text-indigo-600">Mon Dashboard</Link>}
            <div className="h-px bg-gray-100 my-2" />
            {!user ? (
              <Link to="/auth/login" className="bg-[#FF5A5A] text-white text-center py-5 rounded-[2rem] font-black">Se connecter</Link>
            ) : (
              <button onClick={handleLogout} className="text-rose-500 font-black py-4 border-2 border-rose-500 rounded-[2rem]">Déconnexion</button>
            )}
          </nav>
        )}
      </header>
    </div>
  )
}