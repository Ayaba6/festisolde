import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// --- COMPOSANTS & PAGES ---
import SplashScreen from './SplashScreen';
const Auth = lazy(() => import('./pages/Auth/Auth'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Vendor/Dashboard'));
const ManageProducts = lazy(() => import('./pages/Vendor/ManageProducts'));
const Revenues = lazy(() => import('./pages/Vendor/Revenues'));
const WithdrawalHistory = lazy(() => import('./pages/Vendor/WithdrawalHistory'));
const StoreSettings = lazy(() => import('./pages/Store/StoreSettings'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const PublicStore = lazy(() => import('./pages/Store/PublicStore'));
const ProductDetails = lazy(() => import('./pages/Store/ProductDetails'));
const Cart = lazy(() => import('./pages/Store/Cart'));
const OrderSuccess = lazy(() => import('./pages/Store/OrderSuccess'));
const PaymentReturn = lazy(() => import('./pages/Store/PaymentReturn'));
const OrderTracking = lazy(() => import('./pages/Store/OrderTracking'));
const Settings = lazy(() => import('./components/Settings'));
import Home from './pages/Home/Home';
const Shop = lazy(() => import('./pages/Home/components/Shop'));
const RequestBoost = lazy(() => import('./pages/Vendor/RequestBoost'));
const Analytics = lazy(() => import('./pages/Vendor/Analytics'));
const Grossistes = lazy(() => import('./pages/Home/components/Grossistes'));
const Liquidation = lazy(() => import('./pages/Home/components/Liquidation'));
const Aide = lazy(() => import('./pages/Home/components/Aide'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
import ShopLayout from './components/ShopLayout';

import {
  LayoutDashboard, Package, LogOut, ExternalLink, Wallet,
  Palette, Settings as SettingsIcon, Menu, X, Zap, BarChart3, Loader2,
} from 'lucide-react';

const getSubdomain = () => window.location.hostname.split('.')[0];

// Pages de l'espace vendeur (affichées avec le menu latéral).
const VENDOR_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', short: 'Accueil' },
  { to: '/products-manage', icon: Package, label: 'Mes produits', short: 'Produits' },
  { to: '/revenus', icon: Wallet, label: 'Ventes & finances', short: 'Ventes' },
  { to: '/analytics', icon: BarChart3, label: 'Statistiques', short: 'Stats' },
  { to: '/marketing', icon: Zap, label: 'Booster mes ventes', short: 'Boost' },
];
const VENDOR_SECONDARY = [
  { to: '/ma-boutique', icon: Palette, label: 'Ma vitrine' },
  { to: '/settings', icon: SettingsIcon, label: 'Paramètres' },
];
const VENDOR_PATHS = [...VENDOR_NAV, ...VENDOR_SECONDARY].map((l) => l.to).concat('/withdrawal-history');

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<{ name: string; slug: string; logo_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isVendorSubdomain = getSubdomain() === 'vendeur';

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
    if (!user) { setStore(null); return; }
    supabase.from('stores').select('name, slug, logo_url').eq('owner_id', user.id).maybeSingle()
      .then(({ data }) => setStore(data));
  }, [user]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const showVendorUI = !!user && VENDOR_PATHS.includes(location.pathname);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(isVendorSubdomain ? '/auth' : '/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
      isActive ? 'bg-orange-50 text-orange-700' : 'text-ink-soft hover:bg-stone-100 hover:text-ink'
    }`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <img src="/logo-festisolde.png" alt="FestiSolde" className="h-8 w-auto" />
        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">Vendeur</span>
      </div>

      {store && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink text-sm font-bold text-white">
            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : store.name?.charAt(0)?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{store.name}</p>
            <Link to={`/${store.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline">
              Voir ma boutique <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Espace vendeur">
        {VENDOR_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
        <p className="px-3 pb-1 pt-6 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Ma boutique</p>
        {VENDOR_SECONDARY.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-stone-100 p-3">
        <p className="truncate px-3 pb-2 text-xs text-ink-muted">{user?.email}</p>
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink-soft transition hover:bg-red-50 hover:text-red-600">
          <LogOut size={19} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-ink antialiased">
      <SplashScreen />

      {showVendorUI && (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-stone-100 bg-white lg:block">
          {sidebar}
        </aside>
      )}

      {showVendorUI && isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu vendeur">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-white shadow-2xl">
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute right-3 top-3 rounded-full p-2 hover:bg-stone-100" aria-label="Fermer le menu">
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        {showVendorUI && (
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-100 bg-white/90 px-4 backdrop-blur-md lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="-ml-1 rounded-full p-2 text-ink hover:bg-stone-100" aria-label="Ouvrir le menu">
              <Menu size={22} />
            </button>
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-7 w-auto" />
            {store ? (
              <Link to={`/${store.slug}`} target="_blank" className="rounded-full p-2 text-ink hover:bg-stone-100" aria-label="Voir ma boutique">
                <ExternalLink size={20} />
              </Link>
            ) : <span className="w-9" />}
          </header>
        )}

        <main className={`flex-1 ${showVendorUI ? 'mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10' : ''}`}>
          <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={28} /></div>}>
          <Routes>
            <Route path="/" element={isVendorSubdomain ? (user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />) : <Home />} />
            <Route path="/products" element={<Shop />} />
            <Route path="/grossistes" element={<Grossistes />} />
            <Route path="/liquidation" element={<Liquidation />} />
            <Route path="/aide" element={<Aide />} />
            <Route path="/produit/:productId" element={<ProductDetails />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/confirmation" element={<ShopLayout><OrderSuccess /></ShopLayout>} />
            <Route path="/commande/:orderId" element={<ShopLayout><OrderTracking /></ShopLayout>} />
            <Route path="/paiement/retour" element={<ShopLayout><PaymentReturn /></ShopLayout>} />
            <Route path="/about" element={<ShopLayout><About /></ShopLayout>} />
            <Route path="/contact" element={<ShopLayout><Contact /></ShopLayout>} />
            <Route path="/privacy" element={<ShopLayout><Privacy /></ShopLayout>} />
            <Route path="/cgu" element={<ShopLayout><Terms /></ShopLayout>} />
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
            <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/auth" />} />
            <Route path="/:storeSlug" element={<PublicStore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>

        {/* Navigation mobile */}
        {showVendorUI && (
          <nav
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-stone-100 bg-white/95 backdrop-blur-md lg:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Navigation vendeur"
          >
            {VENDOR_NAV.map(({ to, icon: Icon, short }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${isActive ? 'text-orange-600' : 'text-ink-muted'}`
                }
              >
                <Icon size={21} />
                {short}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
