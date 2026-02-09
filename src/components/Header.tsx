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
  parent_id: string | null
  subCategories?: Category[]
}

export default function Header({ user, setUser, cartCount, onOpenCart }: HeaderProps) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const [menuStructure, setMenuStructure] = useState<Category[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 1. RÉCUPÉRATION DE LA STRUCTURE HIÉRARCHIQUE
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .order('name', { ascending: true })

      if (!error && data) {
        const parents = data.filter(c => !c.parent_id)
        const structured = parents.map(parent => ({
          ...parent,
          subCategories: data.filter(child => child.parent_id === parent.id)
        }))
        setMenuStructure(structured)
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

  // ACTIONS
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleImageSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', { body: formData })
      if (error) throw error
      if (data?.keywords) navigate(`/shop?search=${encodeURIComponent(data.keywords)}`)
    } catch (err) {
      alert("L'analyse a échoué.")
    } finally { setIsAnalyzing(false) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false) // Fermeture du menu
    navigate('/auth/login')
  }

  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="sticky top-0 z-50 w-full shadow-sm bg-white">
      <PromoBanner />

      {/* --- NIVEAU 1 : LOGO & RECHERCHE --- */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[70px] flex items-center gap-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="shrink-0">
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-10 w-auto object-contain" />
          </Link>

          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 relative group max-w-2xl mx-auto">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></div>
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAnalyzing ? "Analyse en cours..." : "Rechercher un article..."}
              className="w-full bg-slate-100 border-none rounded py-2 pl-10 pr-12 text-[15px] focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all outline-none"
            />
            <button type="button" onClick={() => document.getElementById('imageSearchInput')?.click()} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary">
              <Camera size={20} className={isAnalyzing ? 'animate-pulse text-brand-primary' : ''} />
            </button>
            <input id="imageSearchInput" type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />
          </form>

          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            {!user ? (
              <Link to="/auth/login" className="hidden sm:block px-4 py-1.5 text-[14px] text-brand-primary border border-brand-primary rounded font-medium hover:bg-brand-primary/5 transition-colors">
                Connexion
              </Link>
            ) : (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 hover:bg-slate-50 p-1 rounded transition-all">
                   <div className="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold text-xs">{initial}</div>
                   <ChevronDown size={14} className="text-slate-400" />
                </button>
                {userMenuOpen && (
                  <>
                    {/* Overlay pour fermer au clic extérieur */}
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-xl border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Mon Compte</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[140px] text-left">{user.email}</p>
                          {isAdmin && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded">ADMIN</span>}
                        </div>
                      </div>
                      
                      {/* CORRECTION : On ferme le menu au clic sur n'importe quel lien enfant */}
                      <div className="space-y-0.5" onClick={() => setUserMenuOpen(false)}>
                        {isAdmin && <MenuLink to="/admin-general" icon={<Settings size={16} className="text-amber-500" />} label="Console Admin" className="text-amber-600 hover:bg-amber-50 font-bold" />}
                        <MenuLink to="/account" icon={<UserIcon size={16} />} label="Mon Profil" />
                        <MenuLink to="/orders" icon={<Package size={16} />} label="Mes commandes" />
                        <MenuLink to="/pack-creator" icon={<Wand2 size={16} className="text-brand-primary" />} label="Mon Atelier" />
                        {isVendor ? <MenuLink to="/vendor/dashboard" icon={<LayoutDashboard size={16} />} label="Tableau de bord vendeur" /> : !isAdmin && <MenuLink to="/vendor/create-shop" icon={<Store size={16} />} label="Devenir Vendeur" />}
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Évite le double déclenchement
                            handleLogout();
                          }} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 text-[13px] font-bold uppercase hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut size={16} /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <Link to={isVendor ? "/vendor/dashboard" : "/vendre"} className="bg-brand-primary text-white px-3 lg:px-5 py-1.5 rounded text-[14px] font-medium hover:brightness-105 shadow-sm flex items-center gap-2">
              <span className="hidden sm:inline">Vendre</span>
              <PlusCircle size={18} />
            </Link>
            <button onClick={onOpenCart} className="relative p-2 text-slate-500 hover:text-brand-dark">
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* --- NIVEAU 2 : NAVIGATION HIÉRARCHIQUE --- */}
      <div className="border-b border-slate-200 hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <nav className="flex items-center h-12 gap-8">
            <Link to="/shop" className="text-[13px] font-black uppercase tracking-widest text-slate-900 hover:text-brand-primary transition-colors">
              Tous
            </Link>
            
            {menuStructure.map((parent) => (
              <div key={parent.id} className="relative group h-full flex items-center">
                <Link 
                  to={`/shop?category=${parent.slug}`} 
                  className="text-[13px] font-bold text-slate-600 uppercase tracking-wide hover:text-brand-primary flex items-center gap-1 transition-colors"
                >
                  {parent.name}
                  {parent.subCategories && parent.subCategories.length > 0 && (
                    <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
                  )}
                </Link>

                {parent.subCategories && parent.subCategories.length > 0 && (
                  <div className="absolute top-full left-0 w-48 bg-white shadow-xl border border-slate-100 py-3 px-2 rounded-b-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50">
                    {parent.subCategories.map(child => (
                      <Link
                        key={child.id}
                        to={`/shop?category=${child.slug}`}
                        className="block px-4 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-primary rounded-lg transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex-1" />
            <div className="flex items-center gap-6 border-l border-slate-200 pl-8 h-5">
              <Link to="/about" className="text-[12px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">À propos</Link>
              <HelpCircle size={18} className="text-slate-300 cursor-pointer hover:text-slate-600" />
            </div>
          </nav>
        </div>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-6 px-6 animate-in slide-in-from-top max-h-[70vh] overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Naviguer par rayon</p>
          <div className="space-y-6">
            {menuStructure.map(parent => (
              <div key={parent.id} className="space-y-3">
                <Link to={`/shop?category=${parent.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase italic text-slate-900">
                  {parent.name}
                </Link>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {parent.subCategories?.map(child => (
                    <Link 
                      key={child.id} to={`/shop?category=${child.slug}`} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-slate-500"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
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