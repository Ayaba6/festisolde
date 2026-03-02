import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  ShoppingBag, 
  Users, 
  Wallet, 
  Trash2, 
  LayoutGrid, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Menu, 
  X 
} from 'lucide-react';

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, salesCount: 0, customersCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour le menu mobile

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: storeData } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
      if (storeData) {
        setStore(storeData);
        const { data: productsData } = await supabase.from('products').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
        setProducts(productsData || []);
        const { data: ordersData } = await supabase.from('orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
        if (ordersData) {
          setOrders(ordersData);
          const totalRevenue = ordersData.reduce((acc, order) => acc + (order.total_amount || 0), 0);
          const uniqueCustomers = new Set(ordersData.map(o => o.customer_phone)).size;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const recentSales = ordersData.filter(o => new Date(o.created_at) > sevenDaysAgo).length;
          setStats({ totalRevenue, salesCount: recentSales, customersCount: uniqueCustomers });
        }
      }
    }
    setLoading(false);
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-[11px] font-light uppercase tracking-[0.3em] text-gray-400">Initialisation du studio...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 antialiased">
      
      {/* --- HEADER ÉPURÉ & RESPONSIVE --- */}
      <header className="mb-10 md:mb-16">
        <div className="flex items-center justify-between md:items-end gap-8">
          <div className="space-y-1">
            <p className="text-[9px] md:text-[10px] font-bold text-[#0866FF] uppercase tracking-[0.4em] ml-1">Tableau de Bord</p>
            <h1 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">
              {store?.name} <span className="text-gray-300 font-extralight hidden sm:inline">| Festisolde</span>
            </h1>
          </div>

          {/* Bouton Hamburger Mobile */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Actions Desktop */}
          <div className="hidden md:flex gap-4">
            <Link to="/add-product" className="group flex items-center gap-3 bg-gray-900 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold tracking-wider hover:bg-[#0866FF] transition-all duration-500">
              <Plus size={14} className="group-hover:rotate-90 transition-transform" /> NOUVEAU PRODUIT
            </Link>
            <Link to={`/boutique/${store?.name}`} className="flex items-center gap-3 border border-gray-200 px-5 py-2.5 rounded-full text-[11px] font-semibold text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all">
              <LayoutGrid size={14} /> APERÇU
            </Link>
          </div>
        </div>

        {/* Menu Mobile Déroulant (Hamburger) */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <Link to="/add-product" className="flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-xl text-[11px] font-bold tracking-widest uppercase">
              <Plus size={16} /> Nouveau Produit
            </Link>
            <Link to={`/boutique/${store?.name}`} className="flex items-center justify-center gap-3 border border-gray-200 py-4 rounded-xl text-[11px] font-bold text-gray-600 tracking-widest uppercase">
              <LayoutGrid size={16} /> Voir ma boutique
            </Link>
          </div>
        )}
      </header>

      {/* --- STATS FINES (Grid responsive) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
        <StatCard label="Chiffre d'affaires" value={stats.totalRevenue.toLocaleString()} unit="CFA" />
        <StatCard label="Ventes hebdomadaires" value={stats.salesCount} unit="Unités" />
        <StatCard label="Portefeuille clients" value={stats.customersCount} unit="Unique" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* --- SECTION COMMANDES (Responsive Table) --- */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Flux des Commandes</h2>
            <Link to="/orders" className="text-[10px] font-bold text-[#0866FF] hover:underline uppercase tracking-widest">Voir tout</Link>
          </div>

          <div className="space-y-1">
            {orders.length > 0 ? orders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex flex-wrap md:flex-nowrap items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors px-2 group gap-4 md:gap-0">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                   <div className="hidden sm:block text-[10px] font-medium text-gray-300 group-hover:text-[#0866FF] transition-colors">
                     {new Date(order.created_at).toLocaleDateString()}
                   </div>
                   <div className="flex-1">
                     <p className="text-[13px] font-medium text-gray-800">{order.customer_name}</p>
                     <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-400 font-light">
                       <span className="flex items-center gap-1"><Phone size={10}/> {order.customer_phone}</span>
                       <span className="flex items-center gap-1 italic"><MapPin size={10}/> {order.customer_city || 'Ouaga'}</span>
                     </div>
                   </div>
                </div>
                <div className="text-left md:text-right w-full md:w-auto border-t md:border-none pt-3 md:pt-0 flex md:flex-col justify-between items-center md:items-end">
                   <p className="text-[14px] md:text-[13px] font-bold text-gray-900 tracking-tight">
                     {order.total_amount.toLocaleString()} <span className="font-light text-[10px]">CFA</span>
                   </p>
                   <p className="text-[9px] font-bold uppercase tracking-widest text-[#25D366] opacity-70">via WhatsApp</p>
                </div>
              </div>
            )) : <p className="text-[12px] text-gray-400 font-light italic">Aucun mouvement enregistré.</p>}
          </div>
        </div>

        {/* --- SECTION PRODUITS --- */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-8 border-b border-gray-100 pb-4">Inventaire</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {products.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between group bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border border-gray-50 md:border-none shadow-sm md:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-10 md:h-10 overflow-hidden rounded-md grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-gray-700 truncate w-32 md:w-28 tracking-tight group-hover:text-[#0866FF] transition-colors">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-light uppercase">{p.sale_price.toLocaleString()} CFA</p>
                  </div>
                </div>
                <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="pt-8">
            <Link to="/products" className="w-full md:w-auto text-[10px] font-bold text-gray-400 hover:text-gray-900 flex items-center justify-center md:justify-start gap-2 transition-all uppercase tracking-[0.2em]">
              Gérer le catalogue <ExternalLink size={12} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div className="border-l-2 md:border-l border-gray-100 pl-5 md:pl-6 py-2 bg-white md:bg-transparent p-4 md:p-0 rounded-r-xl md:rounded-none shadow-sm md:shadow-none">
      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2 md:mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-light text-gray-900 tracking-tighter">{value}</span>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  );
}