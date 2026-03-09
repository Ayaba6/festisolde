import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// --- IMPORT DES ICÔNES ---
import { 
  LayoutDashboard, Package, LogOut, ExternalLink, ShieldCheck, Wallet, 
  Palette, Settings as SettingsIcon, Menu, X, PlusCircle, Zap, 
  ChevronDown, Store, ChevronLeft, ChevronRight, BarChart3, Loader2, Clock
} from 'lucide-react';

// --- IMPORT DES PAGES ---
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

// --- NOUVELLES PAGES ---
import Grossistes from './pages/Home/components/Grossistes'; // Assure-toi que le chemin est correct
import Liquidation from './pages/Home/components/Liquidation'; 
import Aide from './pages/Home/components/Aide';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const VendorHeader = ({ user, storeSlug, onOpenMenu, onSignOut }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onOpenMenu} className="md:hidden p-2 text-black hover:bg-gray-100 rounded-xl transition-colors">
          <Menu size={22} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Studio <span className="text-orange-600">v2.0</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {storeSlug && (
          <Link 
            to={`/${storeSlug}`} 
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase transition-all active:scale-95"
          >
            <ExternalLink size={12} strokeWidth={2.5} />
            <span className="hidden xs:inline">Ma Boutique</span>
          </Link>
        )}
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-full transition-all"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md border-2 border-white">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compte</p>
                <p className="text-xs font-bold truncate text-gray-700">{user?.email}</p>
              </div>
              <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                <SettingsIcon size={16} /> RÉGLAGES
              </Link>
              <Link to="/ma-boutique" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                <Palette size={16} /> DESIGN BOUTIQUE
              </Link>
              <div className="h-px bg-gray-50 my-1" />
              <button 
                onClick={() => { setIsProfileOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> DÉCONNEXION
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [storeSlug, setStoreSlug] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const location = useLocation();
  const navigate = useNavigate();
  const adminUid = import.meta.env.VITE_ADMIN_UID?.trim();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsMobileMenuOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchStoreSlug() {
      if (user) {
        const { data } = await supabase.from('stores').select('slug').eq('owner_id', user.id).maybeSingle();
        if (data) setStoreSlug(data.slug);
      }
    }
    fetchStoreSlug();
  }, [user]);

  const vendorPaths = ['/dashboard', '/products-manage', '/revenus', '/withdrawal-history', '/marketing', '/analytics', '/ma-boutique', '/settings', '/admin'];
  const isVendorArea = vendorPaths.some(path => location.pathname.startsWith(path));
  const showVendorUI = !!(isVendorArea && user);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FB]">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const SidebarLink = ({ to, icon: Icon, label, colorClass = "" }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[11px] uppercase transition-all mb-1
        ${isActive ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-black'} 
        ${colorClass} ${isCollapsed ? 'justify-center px-0' : ''}`}
      >
        <Icon size={18} strokeWidth={isActive ? 3 : 2} className="shrink-0" /> 
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const SidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      <div className="space-y-6 flex-1">
        <div className="space-y-1">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/products-manage" icon={Package} label="Stock" />
          <SidebarLink to="/analytics" icon={BarChart3} label="Analytiques" />
          <SidebarLink to="/revenus" icon={Wallet} label="Revenus" />
        </div>
        <div className="pt-4 border-t border-gray-100 space-y-1">
          <SidebarLink to="/marketing" icon={Zap} label="Boost" colorClass="text-orange-600" />
          <SidebarLink to="/ma-boutique" icon={Palette} label="Design" />
          <SidebarLink to="/settings" icon={SettingsIcon} label="Réglages" />
        </div>
        {isMobile && storeSlug && (
          <div className="pt-4 border-t border-gray-100">
             <SidebarLink to={`/${storeSlug}`} icon={Store} label="Voir Boutique" colorClass="text-black" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-gray-900 antialiased font-sans">
      <ScrollToTop />
      
      {showVendorUI && (
        <aside className={`bg-white hidden md:flex flex-col sticky top-0 h-screen border-r border-gray-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} z-40`}>
          <div className={`p-8 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-black rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black italic shadow-xl">S</div>
            {!isCollapsed && <span className="font-black text-base uppercase tracking-tighter truncate">FESTISOLDE</span>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-20 bg-white border border-gray-100 rounded-full p-1 shadow-md hover:text-orange-600 z-50 text-gray-400">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <nav className="flex-1 px-4 overflow-y-auto">{SidebarContent(false)}</nav>
        </aside>
      )}

      {showVendorUI && isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative h-full w-72 bg-white p-6 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-10">
              <span className="font-black uppercase italic text-orange-600 text-xl">Studio</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            {SidebarContent(true)}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        {showVendorUI && <VendorHeader user={user} storeSlug={storeSlug} onOpenMenu={() => setIsMobileMenuOpen(true)} onSignOut={handleSignOut} />}
        
        <main className={`flex-1 ${showVendorUI ? 'p-4 md:p-10 pb-32' : ''}`}>
          <Routes>
            {/* ROUTES PUBLIQUES PRIORITAIRES */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Shop />} /> 
            <Route path="/grossistes" element={<Grossistes />} />
            <Route path="/liquidation" element={<Liquidation />} />
            <Route path="/aide" element={<Aide />} />
            <Route path="/produit/:productId" element={<ProductDetails />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/confirmation" element={<OrderSuccess />} />
            
            {/* AUTH */}
            <Route path="/auth" element={!user ? <Auth /> : (user.id === adminUid ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
            
            {/* VENDOR DASHBOARD */}
            <Route path="/dashboard" element={user ? (user.id === adminUid ? <Navigate to="/admin" replace /> : <Dashboard />) : <Navigate to="/auth" />} />
            <Route path="/products-manage" element={user ? <ManageProducts /> : <Navigate to="/auth" />} />
            <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/auth" />} />
            <Route path="/marketing" element={user ? <RequestBoost /> : <Navigate to="/auth" />} />
            <Route path="/revenus" element={user ? <Revenues /> : <Navigate to="/auth" />} />
            <Route path="/withdrawal-history" element={user ? <WithdrawalHistory /> : <Navigate to="/auth" />} />
            <Route path="/ma-boutique" element={user ? <StoreSettings /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user && user.id === adminUid ? <AdminDashboard /> : <Navigate to="/dashboard" />} />

            {/* ROUTES BOUTIQUES */}
            <Route path="/boutique/:storeSlug" element={<PublicStore />} />
            <Route path="/:storeSlug" element={<PublicStore />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {showVendorUI && (
          <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-black shadow-2xl rounded-3xl flex items-center justify-around px-2 z-40 border border-white/10">
            {[
              { to: "/dashboard", icon: LayoutDashboard },
              { to: "/analytics", icon: BarChart3 },
              { to: "/products-manage", icon: PlusCircle, special: true },
              { to: "/marketing", icon: Zap },
              { to: "/revenus", icon: Wallet }
            ].map((item, index) => (
              <Link key={index} to={item.to} className={`p-2 transition-all ${location.pathname === item.to || (item.to === "/revenus" && location.pathname === "/withdrawal-history") ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
                <item.icon size={item.special ? 32 : 22} strokeWidth={2.5} className={item.special ? "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" : ""} />
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;