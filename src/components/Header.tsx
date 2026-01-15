import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Settings, 
  Package, 
  LayoutDashboard,
  Store
} from 'lucide-react'

// --- IMPORT DU COMPOSANT EXTERNE ---
import PromoBanner from './PromoBanner'

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
  const [isVendor, setIsVendor] = useState(false)

  // Vérification du statut vendeur
  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!user) {
        setIsVendor(false)
        return
      }
      const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      if (data) setIsVendor(true)
    }
    checkVendorStatus()
  }, [user])

  // Fermer les menus lors du changement de page
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
  const isAdmin = user?.role === 'admin'

  return (
    <div className="sticky top-0 z-50 w-full shadow-sm">
      {/* 1. BANDEAU PROMOTIONNEL */}
      <PromoBanner />

      {/* 2. BARRE DE NAVIGATION PRINCIPALE */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 lg:px-6 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* LOGO PREMIUM */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <span className="text-xl font-black italic">f</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-tighter text-brand-dark">
                Festi <span className="text-brand-primary">Solde</span>
              </span>
            </div>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-10">
            {['Accueil', 'Boutique'].map((item) => {
              const path = item === 'Accueil' ? '/' : '/products'
              const isActive = location.pathname === path
              return (
                <Link 
                  key={item}
                  to={path} 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] relative group py-2 ${
                    isActive ? 'text-brand-primary' : 'text-brand-dark hover:text-brand-primary'
                  }`}
                >
                  {item}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary transition-transform duration-300 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              )
            })}
          </nav>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-2 lg:gap-5">
            {/* Panier */}
            <button 
              onClick={onOpenCart} 
              className="relative p-3 text-brand-dark hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
              <ShoppingBag size={22} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            {!user ? (
              <Link to="/auth/login" className="btn-primary hidden sm:flex px-6 py-2.5 text-xs shadow-md">
                CONNEXION
              </Link>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)} 
                  className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-brand-primary/10">
                    {initial}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="px-6 py-4 border-b border-slate-50 mb-2 text-left">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mon Compte</p>
                           {isAdmin && (
                             <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>
                           )}
                        </div>
                        <p className="text-sm font-bold text-brand-dark truncate">{user.email}</p>
                      </div>

                      <div className="space-y-1">
                        {/* LIEN CONSOLE ADMIN */}
                        {isAdmin && (
                          <MenuLink 
                            to="/admin-general" 
                            icon={<Settings size={18} className="text-amber-500" />} 
                            label="Console Admin" 
                            primary 
                          />
                        )}

                        <MenuLink to="/orders" icon={<Package size={18} />} label="Mes commandes" />
                        
                        {isVendor ? (
                          <MenuLink to="/vendor/dashboard" icon={<LayoutDashboard size={18} />} label="Tableau de bord" />
                        ) : (
                          !isAdmin && <MenuLink to="/vendor/create-shop" icon={<Store size={18} />} label="Devenir Vendeur" />
                        )}
                        
                        <div className="h-px bg-slate-50 my-2 mx-4" />
                        
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-6 py-3 text-rose-500 hover:bg-rose-50 transition-colors font-black text-xs uppercase tracking-wider"
                        >
                          <LogOut size={18} />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Menu Mobile Button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden p-2 text-brand-dark hover:bg-slate-50 rounded-xl transition-colors"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV OVERLAY */}
        {menuOpen && (
          <nav className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 p-8 flex flex-col gap-5 shadow-2xl animate-in slide-in-from-top-5">
            <Link to="/" className="text-3xl font-black text-brand-dark">Accueil</Link>
            <Link to="/products" className="text-3xl font-black text-brand-dark">Boutique</Link>
            
            {isAdmin && (
              <Link to="/admin" className="text-3xl font-black text-amber-500 italic">Console Admin</Link>
            )}
            
            {isVendor && (
              <Link to="/vendor/dashboard" className="text-3xl font-black text-brand-primary">Mon Shop</Link>
            )}
            
            <div className="h-px bg-slate-100 my-4" />
            
            {!user ? (
              <Link to="/auth/login" className="btn-primary text-center py-5 rounded-2xl font-black">SE CONNECTER</Link>
            ) : (
              <button onClick={handleLogout} className="text-rose-500 font-black py-4 border-2 border-rose-500 rounded-2xl">DÉCONNEXION</button>
            )}
          </nav>
        )}
      </header>
    </div>
  )
}

function MenuLink({ to, icon, label, primary }: { to: string, icon: any, label: string, primary?: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-6 py-3 transition-colors font-bold text-xs uppercase tracking-wider ${
        primary ? 'text-brand-primary hover:bg-brand-primary/5' : 'text-slate-600 hover:text-brand-dark hover:bg-slate-50'
      }`}
    >
      <span className="opacity-70">{icon}</span>
      {label}
    </Link>
  )
}