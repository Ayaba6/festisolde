import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Package, 
  Search, 
  HelpCircle, 
  PlusCircle,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Store,
  Wand2,
  Camera
} from 'lucide-react'

import PromoBanner from './PromoBanner'

interface HeaderProps {
  user: any | null
  setUser: (user: any | null) => void
  cartCount: number
  onOpenCart: () => void 
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function Header({ user, setUser, cartCount, onOpenCart }: HeaderProps) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 1. RÉCUPÉRATION DES CATÉGORIES (Limité à 10)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true })
        .limit(10) // Limite pour garder un header propre

      if (!error && data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

  // 2. STATUT VENDEUR
  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!user?.id) return
      const { data } = await supabase.from('shops').select('id').eq('owner_id', user.id).maybeSingle() 
      setIsVendor(!!data)
    }
    checkVendorStatus()
  }, [user?.id])

  // 3. RECHERCHE TEXTUELLE
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // 4. RECHERCHE PAR IMAGE
  const handleImageSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: formData,
      })

      if (error) throw error

      if (data?.keywords) {
        navigate(`/shop?search=${encodeURIComponent(data.keywords)}`)
      }
    } catch (err) {
      console.error("Erreur analyse image:", err)
      alert("L'analyse de l'image a échoué.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/auth/login')
  }

  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="sticky top-0 z-50 w-full shadow-sm bg-white">
      <PromoBanner />

      {/* --- NIVEAU 1 : LOGO & RECHERCHE & ACTIONS --- */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[70px] flex items-center gap-4">
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="shrink-0">
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-10 w-auto object-contain" />
          </Link>

          {/* BARRE DE RECHERCHE */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 relative group max-w-2xl mx-auto">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAnalyzing ? "Analyse en cours..." : "Rechercher un article..."}
              disabled={isAnalyzing}
              className={`w-full bg-slate-100 border-none rounded py-2 pl-10 pr-12 text-[15px] focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all outline-none ${isAnalyzing ? 'opacity-50' : ''}`}
            />
            
            <button 
              type="button"
              onClick={() => document.getElementById('imageSearchInput')?.click()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors"
            >
              <Camera size={20} className={isAnalyzing ? 'animate-pulse text-brand-primary' : ''} />
            </button>
            <input id="imageSearchInput" type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />
          </form>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            {!user ? (
              <Link to="/auth/login" className="hidden sm:block px-4 py-1.5 text-[14px] text-brand-primary border border-brand-primary rounded font-medium hover:bg-brand-primary/5 transition-colors">
                Connexion
              </Link>
            ) : (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 hover:bg-slate-50 p-1 rounded transition-all">
                   <div className="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold text-xs">
                     {initial}
                   </div>
                   <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-xl border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                      
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Mon Compte</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[140px] text-left">{user.email}</p>
                          {isAdmin && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded">ADMIN</span>}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        {isAdmin && (
                          <MenuLink to="/admin-general" icon={<Settings size={16} className="text-amber-500" />} label="Console Admin" className="text-amber-600 hover:bg-amber-50 font-bold" />
                        )}
                        <MenuLink to="/account" icon={<UserIcon size={16} />} label="Mon Profil" />
                        <MenuLink to="/orders" icon={<Package size={16} />} label="Mes commandes" />
                        <MenuLink to="/pack-creator" icon={<Wand2 size={16} className="text-brand-primary" />} label="Mon Atelier" />

                        {isVendor ? (
                          <MenuLink to="/vendor/dashboard" icon={<LayoutDashboard size={16} />} label="Tableau de bord vendeur" />
                        ) : (
                          !isAdmin && <MenuLink to="/vendor/create-shop" icon={<Store size={16} />} label="Devenir Vendeur" />
                        )}

                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 text-[13px] font-bold uppercase hover:bg-rose-50 transition-colors text-left">
                          <LogOut size={16} /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link to={isVendor ? "/vendor/dashboard" : "/vendre"} className="bg-brand-primary text-white px-3 lg:px-5 py-1.5 rounded text-[14px] font-medium hover:brightness-105 transition-all shadow-sm">
              <span className="hidden sm:inline">Vendre</span>
              <PlusCircle size={18} className="sm:hidden" />
            </Link>

            <button onClick={onOpenCart} className="relative p-2 text-slate-500 hover:text-brand-dark">
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- NIVEAU 2 : NAVIGATION CATÉGORIES (Pointent vers le shop via le NOM) --- */}
      <div className="border-b border-slate-200 hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <nav className="flex items-center h-12 gap-8 overflow-x-auto no-scrollbar">
            <Link to="/shop" className="text-[15px] font-medium text-slate-900 hover:text-brand-primary transition-colors">
              Tous
            </Link>
            {categories.map((cat, index) => (
              <Link 
                key={cat.id} 
                // Synchronisation : On utilise cat.name car le shop filtre par nom
                to={`/shop?category=${encodeURIComponent(cat.name)}`} 
                className={`text-[15px] whitespace-nowrap transition-colors ${index < 4 ? 'text-slate-900 font-medium' : 'text-slate-500 font-normal'} hover:text-brand-primary`}
              >
                {cat.name}
              </Link>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-6 border-l border-slate-200 pl-8 h-5">
              <Link to="/about" className="text-[14px] text-slate-500 hover:text-slate-900">À propos</Link>
              <HelpCircle size={20} className="text-slate-400 cursor-pointer hover:text-slate-600" />
            </div>
          </nav>
        </div>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-4 px-6 animate-in slide-in-from-top">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Catégories</p>
          <div className="grid grid-cols-2 gap-y-4">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-[15px] font-bold text-slate-800 italic">Voir tout</Link>
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                to={`/shop?category=${encodeURIComponent(cat.name)}`} 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-[15px] text-slate-800 hover:text-brand-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({ to, icon, label, className }: { to: string, icon: any, label: string, className?: string }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-[13px] font-medium transition-colors ${className || ''}`}
    >
      <span className="opacity-70">{icon}</span>
      {label}
    </Link>
  )
}