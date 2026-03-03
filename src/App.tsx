import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// --- IMPORT DES ICÔNES ---
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Wallet, 
  Palette, 
  Settings as SettingsIcon,
  Menu,
  X,
  PlusCircle,
  Zap // Icône pour le Marketing/Boost
} from 'lucide-react';

// --- IMPORT DES PAGES ---
import Auth from './pages/Auth/Auth';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Vendor/Dashboard';
import ManageProducts from './pages/Vendor/ManageProducts';
import AddProduct from './pages/Store/AddProduct';
import Revenues from './pages/Vendor/Revenues';
import StoreSettings from './pages/Store/StoreSettings';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PublicStore from './pages/Store/PublicStore';
import ProductDetails from './pages/Store/ProductDetails';
import Cart from './pages/Store/Cart';
import Settings from './components/Settings';
import Home from './pages/Home/Home';
import Shop from './pages/Home/components/Shop'; 
import RequestBoost from './pages/Vendor/RequestBoost'; // <-- Ton nouveau composant

// --- COMPOSANT HEADER VENDEUR ---
const VendorHeader = ({ user, storeSlug, onOpenMenu }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <button onClick={onOpenMenu} className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
        <Menu size={22} />
      </button>

      <div className="flex-1 max-w-md hidden md:block text-center md:text-left">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 italic">
          Festisolde Management System
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {storeSlug && (
          <Link 
            to={`/boutique/${storeSlug}`} 
            target="_blank" 
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-white rounded-xl text-[10px] font-black hover:bg-orange-600 transition shadow-sm uppercase tracking-widest"
          >
            <ExternalLink className="w-3 h-3" /> Voir ma boutique
          </Link>
        )}
        <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-xs">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
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

  const location = useLocation();
  const navigate = useNavigate();
  const adminUid = import.meta.env.VITE_ADMIN_UID?.trim();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsMobileMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchStoreSlug() {
      if (user) {
        const { data } = await supabase.from('stores').select('slug').eq('owner_id', user.id).single();
        if (data) setStoreSlug(data.slug);
      }
    }
    fetchStoreSlug();
  }, [user]);

  if (loading) return null;

  const isUserAdmin = user?.id?.trim() === adminUid;
  const vendorPaths = ['/dashboard', '/products-manage', '/add-product', '/revenus', '/marketing', '/ma-boutique', '/settings', '/admin'];
  const isVendorArea = vendorPaths.some(path => location.pathname.startsWith(path));
  const showSidebar = isVendorArea && user;

  const SidebarLink = ({ to, icon: Icon, label, colorClass = "" }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all 
        ${isActive ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'} ${colorClass}`}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} /> {label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      <div>
        <div className="px-4 mb-4 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Navigation</div>
        <SidebarLink to="/" icon={ExternalLink} label="Accueil Client" />
      </div>
      
      <div>
        <div className="px-4 mb-4 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Ma Gestion</div>
        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink to="/products-manage" icon={Package} label="Stocks" />
        <SidebarLink to="/add-product" icon={PlusCircle} label="Nouvel Article" colorClass="text-orange-500" />
        <SidebarLink to="/revenus" icon={Wallet} label="Revenus" />
      </div>

      <div>
        <div className="px-4 mb-4 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Marketing</div>
        <SidebarLink to="/marketing" icon={Zap} label="Booster Ventes" colorClass="text-orange-600 animate-pulse" />
      </div>

      <div>
        <div className="px-4 mb-4 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Configuration</div>
        <SidebarLink to="/ma-boutique" icon={Palette} label="Identité Visuelle" />
        <SidebarLink to="/settings" icon={SettingsIcon} label="Mon Compte" />
      </div>

      {isUserAdmin && (
        <div className="pt-4 border-t border-gray-100">
          <SidebarLink to="/admin" icon={ShieldCheck} label="Super-Admin" colorClass="text-red-500 hover:bg-red-50" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white text-gray-900 antialiased font-sans">
      
      {showSidebar && (
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-8 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black italic">F</div>
            <span className="text-sm font-black uppercase tracking-widest">Festisolde</span>
          </div>
          <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide"><SidebarContent /></nav>
          <div className="p-6 border-t border-gray-50">
            <button 
              onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} 
              className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
            >
              <LogOut size={16} /> Quitter
            </button>
          </div>
        </aside>
      )}

      {/* MOBILE MENU */}
      {showSidebar && (
        <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
          <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
          <aside className={`absolute top-0 left-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <span className="font-black uppercase tracking-widest text-sm italic text-orange-600">Festisolde</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-300"><X size={20} /></button>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto"><SidebarContent /></nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {showSidebar && <VendorHeader user={user} storeSlug={storeSlug} onOpenMenu={() => setIsMobileMenuOpen(true)} />}

        <main className={`flex-1 ${!showSidebar ? '' : 'p-4 md:p-10 pb-24 md:pb-10 bg-[#FAFAFA]'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Shop />} /> 
            
            <Route path="/auth" element={!user ? <Auth /> : (isUserAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={user ? (isUserAdmin ? <Navigate to="/admin" replace /> : <Dashboard />) : <Navigate to="/auth" />} />
            <Route path="/products-manage" element={user ? <ManageProducts /> : <Navigate to="/auth" />} />
            <Route path="/add-product" element={user ? <AddProduct /> : <Navigate to="/auth" />} />
            <Route path="/marketing" element={user ? <RequestBoost /> : <Navigate to="/auth" />} />
            <Route path="/revenus" element={user ? <Revenues /> : <Navigate to="/auth" />} />
            <Route path="/ma-boutique" element={user ? <StoreSettings /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
            
            <Route path="/admin" element={user && isUserAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
            
            <Route path="/boutique/:storeSlug" element={<PublicStore />} />
            <Route path="/produit/:productId" element={<ProductDetails />} />
            <Route path="/panier" element={<Cart />} />
          </Routes>
        </main>

        {/* BOTTOM NAV MOBILE */}
        {showSidebar && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around py-3 z-40 px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            {[
              { to: "/dashboard", icon: LayoutDashboard, label: "Studio" },
              { to: "/products-manage", icon: Package, label: "Stocks" },
              { to: "/marketing", icon: Zap, label: "Boost", color: "text-orange-600" },
              { to: "/revenus", icon: Wallet, label: "Argent" }
            ].map((item) => (
              <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-1.5 px-2 ${location.pathname === item.to ? (item.color || 'text-black') : 'text-gray-300'}`}>
                <item.icon size={19} strokeWidth={location.pathname === item.to ? 2.5 : 1.5} /> 
                <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;