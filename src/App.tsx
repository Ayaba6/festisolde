import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// --- COMPOSANTS & PAGES ---
import SplashScreen from './SplashScreen'; 
import Auth from './pages/Auth/Auth';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Vendor/Dashboard';
import ManageProducts from './pages/Vendor/ManageProducts';
import Revenues from './pages/Vendor/Revenues';
import WithdrawalHistory from './pages/Vendor/WithdrawalHistory';
import StoreSettings from './pages/Store/StoreSettings';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PublicStore from './pages/Store/PublicStore';
import ProductDetails from './pages/Store/ProductDetails';
import Cart from './pages/Store/Cart';
import OrderSuccess from './pages/Store/OrderSuccess';
import Settings from './components/Settings';
import Home from './pages/Home/Home';
import Shop from './pages/Home/components/Shop'; 
import RequestBoost from './pages/Vendor/RequestBoost';
import Analytics from './pages/Vendor/Analytics';
import Grossistes from './pages/Home/components/Grossistes';
import Liquidation from './pages/Home/components/Liquidation'; 
import Aide from './pages/Home/components/Aide';

import { 
  LayoutDashboard, Package, LogOut, ExternalLink, Wallet, 
  Palette, Settings as SettingsIcon, Menu, X, PlusCircle, Zap, 
  ChevronDown, ChevronLeft, ChevronRight, BarChart3, Loader2 
} from 'lucide-react';

// --- UTILITAIRES ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const getSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname.split('.')[0]; 
};

// --- HEADER VENDEUR ---
const VendorHeader = ({ user, storeSlug, onOpenMenu, onSignOut }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onOpenMenu} className="md:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Console <span className="text-slate-900 ml-1">v2.0</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {storeSlug && (
          <Link 
            to={`/${storeSlug}`} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-xl text-[11px] font-semibold transition-all hover:bg-slate-800 active:scale-95 shadow-sm"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Ma Boutique</span>
          </Link>
        )}
        
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-full transition-all">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 text-xs font-bold border border-slate-200 uppercase">
              {user?.email?.charAt(0)}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compte</p>
                <p className="text-sm font-semibold truncate text-slate-900">{user?.email}</p>
              </div>
              <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <SettingsIcon size={16} /> Réglages
              </Link>
              <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [storeSlug, setStoreSlug] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const location = useLocation();
  const navigate = useNavigate();
  const adminUid = import.meta.env.VITE_ADMIN_UID?.trim();
  const isVendorSubdomain = getSubdomain() === 'vendeur';

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsMobileMenuOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('stores').select('slug').eq('owner_id', user.id).maybeSingle()
        .then(({ data }) => data && setStoreSlug(data.slug));
    }
  }, [user]);

  const showVendorUI = !!((isVendorSubdomain || location.pathname.startsWith('/dashboard')) && user);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFDFD]">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(isVendorSubdomain ? '/auth' : '/');
  };

  const SidebarLink = ({ to, icon: Icon, label, colorClass = "" }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all mb-1
        ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'} 
        ${colorClass} ${isCollapsed ? 'justify-center px-0' : ''}`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" /> 
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full py-4 px-4">
      <div className="space-y-1 flex-1">
        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
        <SidebarLink to="/products-manage" icon={Package} label="Inventaire" />
        <SidebarLink to="/analytics" icon={BarChart3} label="Statistiques" />
        <SidebarLink to="/revenus" icon={Wallet} label="Finance" />
        <div className="my-4 h-px bg-slate-100 mx-4" />
        <SidebarLink to="/marketing" icon={Zap} label="Boosters" colorClass="text-orange-600" />
        <SidebarLink to="/ma-boutique" icon={Palette} label="Personnalisation" />
        <SidebarLink to="/settings" icon={SettingsIcon} label="Paramètres" />
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-slate-900 antialiased font-sans">
      <ScrollToTop />
      <SplashScreen />

      {showVendorUI && (
        <aside className={`bg-white hidden md:flex flex-col sticky top-0 h-screen border-r border-slate-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'} z-40`}>
          <div className={`p-8 mb-4 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-slate-950 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg">S</div>
            {!isCollapsed && (
              <div className="flex flex-col"><span className="font-bold text-sm uppercase tracking-tighter">Studio Pro</span><span className="text-[10px] text-slate-400 font-medium">Console Vendeur</span></div>
            )}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-24 bg-white border border-slate-100 rounded-full p-1 shadow-sm hover:text-orange-500 z-50 text-slate-400">
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
          <SidebarContent />
        </aside>
      )}

      {/* MOBILE MENU */}
      {showVendorUI && isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative h-full w-72 bg-white p-6 shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="flex justify-between items-center mb-10">
              <span className="font-bold uppercase tracking-tighter text-orange-600 text-xl">Studio</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        {showVendorUI && <VendorHeader user={user} storeSlug={storeSlug} onOpenMenu={() => setIsMobileMenuOpen(true)} onSignOut={handleSignOut} />}
        
        <main className={`flex-1 ${showVendorUI ? 'p-6 md:p-10 pb-32' : ''}`}>
          <Routes>
            <Route path="/" element={isVendorSubdomain ? (user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />) : <Home />} />
            <Route path="/products" element={<Shop />} /> 
            <Route path="/grossistes" element={<Grossistes />} />
            <Route path="/liquidation" element={<Liquidation />} />
            <Route path="/aide" element={<Aide />} />
            <Route path="/produit/:productId" element={<ProductDetails />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/confirmation" element={<OrderSuccess />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/products-manage" element={user ? <ManageProducts /> : <Navigate to="/auth" />} />
            <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/auth" />} />
            <Route path="/marketing" element={user ? <RequestBoost /> : <Navigate to="/auth" />} />
            <Route path="/revenus" element={user ? <Revenues /> : <Navigate to="/auth" />} />
            <Route path="/withdrawal-history" element={user ? <WithdrawalHistory /> : <Navigate to="/auth" />} />
            <Route path="/ma-boutique" element={user ? <StoreSettings /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user?.id === adminUid ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/:storeSlug" element={<PublicStore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* BOTTOM NAV MOBILE */}
        {showVendorUI && (
          <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-slate-950/90 backdrop-blur-lg shadow-2xl rounded-2xl flex items-center justify-around px-2 z-40 border border-white/10">
            {[
              { to: "/dashboard", icon: LayoutDashboard },
              { to: "/analytics", icon: BarChart3 },
              { to: "/products-manage", icon: PlusCircle, special: true },
              { to: "/marketing", icon: Zap },
              { to: "/revenus", icon: Wallet }
            ].map((item, index) => (
              <Link key={index} to={item.to} className={`p-2 transition-all ${location.pathname === item.to ? 'text-orange-500 scale-110' : 'text-slate-400'}`}>
                <item.icon size={item.special ? 28 : 20} strokeWidth={2.5} />
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}