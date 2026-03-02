import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// Import des icônes Lucide
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  Search, 
  Bell, 
  ExternalLink, 
  ShieldCheck,
  Wallet,
  Palette,
  Settings as SettingsIcon // Ajouté pour les paramètres
} from 'lucide-react';

// Pages
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Vendor/Dashboard';
import ManageProducts from './pages/Vendor/ManageProducts';
import Revenues from './pages/Vendor/Revenues';
import StoreSettings from './pages/Store/StoreSettings';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PublicStore from './pages/Store/PublicStore';
import Settings from './components/Settings'; // Ton nouveau composant

// NOUVELLES PAGES CLIENT
import ProductDetails from './pages/Store/ProductDetails';
import Cart from './pages/Store/Cart';

// --- COMPOSANT HEADER VENDEUR ---
const VendorHeader = ({ user, storeName }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Rechercher... (Presser K)"
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gray-200 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {storeName && (
          <Link 
            to={`/boutique/${storeName}`} 
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition border border-gray-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Voir le site</span>
          </Link>
        )}

        <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

// --- COMPOSANT PRINCIPAL APP ---
function App() {
  const [user, setUser] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const adminUid = import.meta.env.VITE_ADMIN_UID;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchStoreName() {
      if (user) {
        const { data } = await supabase
          .from('stores')
          .select('name')
          .eq('owner_id', user.id)
          .single();
        if (data) setStoreName(data.name);
      }
    }
    fetchStoreName();
  }, [user]);

  if (loading) return null;

  const isPublicStore = location.pathname.startsWith('/boutique/');
  const isProductPage = location.pathname.startsWith('/produit/');
  const isCartPage = location.pathname === '/panier';
  const isAuthPage = location.pathname === '/auth';
  
  const hideSidebar = isPublicStore || isProductPage || isCartPage || isAuthPage;
  const showSidebar = !hideSidebar && user;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-[#111827]">
      
      {showSidebar && (
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black">F</div>
              <span className="text-xl font-black tracking-tighter uppercase">Festisolde</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gestion</p>
            
            <Link to="/" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${location.pathname === '/' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            <Link to="/products" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${location.pathname === '/products' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Package size={18} /> Mes Produits
            </Link>

            <Link to="/revenus" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${location.pathname === '/revenus' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Wallet size={18} /> Revenus
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-50">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Configuration</p>
              <Link to="/ma-boutique" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${location.pathname === '/ma-boutique' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Palette size={18} /> Ma Boutique
              </Link>
              
              {/* LIEN AJOUTÉ : PARAMÈTRES COMPTE */}
              <Link to="/settings" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${location.pathname === '/settings' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                <SettingsIcon size={18} /> Paramètres
              </Link>
            </div>

            {user?.id === adminUid && (
              <Link to="/admin" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm mt-4 transition-all ${location.pathname === '/admin' ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}>
                <ShieldCheck size={18} /> Admin Panel
              </Link>
            )}
          </nav>

          <div className="p-4 border-t border-gray-50 space-y-1">
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/auth'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {showSidebar && <VendorHeader user={user} storeName={storeName} />}

        <main className={`flex-1 ${hideSidebar ? '' : 'p-6 md:p-10'}`}>
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/products" element={user ? <ManageProducts /> : <Navigate to="/auth" />} />
            <Route path="/revenus" element={user ? <Revenues /> : <Navigate to="/auth" />} />
            <Route path="/ma-boutique" element={user ? <StoreSettings /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user?.id === adminUid ? <AdminDashboard /> : <Navigate to="/" />} />
            
            {/* ROUTE AJOUTÉE : SETTINGS */}
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
            
            {/* ROUTES PUBLIQUES (CLIENTS) */}
            <Route path="/boutique/:storeName" element={<PublicStore />} />
            <Route path="/produit/:productId" element={<ProductDetails />} />
            <Route path="/panier" element={<Cart />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;