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
  ArrowUpRight,
  TrendingUp,
  Package
} from 'lucide-react';

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, salesCount: 0, customersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: storeData } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
      if (storeData) {
        setStore(storeData);
        
        // Récupération des produits
        const { data: productsData } = await supabase.from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        setProducts(productsData || []);

        // Récupération des commandes
        const { data: ordersData } = await supabase.from('orders')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Chargement du Studio...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            STUDIO <span className="text-orange-600">{store?.name}</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-green-500" /> Vos performances en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/add-product" className="flex items-center gap-2 bg-black text-white px-6 py-4 rounded-2xl text-[11px] font-black tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-gray-200">
            <Plus size={18} strokeWidth={3} /> AJOUTER UN ARTICLE
          </Link>
        </div>
      </div>

      {/* --- STATS CARDS (BOLD VERSION) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Chiffre d'Affaires" 
          value={stats.totalRevenue.toLocaleString()} 
          unit="CFA" 
          icon={<Wallet className="text-orange-600" size={20} />}
          color="bg-orange-50"
        />
        <StatCard 
          label="Ventes (7j)" 
          value={stats.salesCount} 
          unit="COMMANDES" 
          icon={<ShoppingBag className="text-blue-600" size={20} />}
          color="bg-blue-50"
        />
        <StatCard 
          label="Clients" 
          value={stats.customersCount} 
          unit="UNIQUES" 
          icon={<Users className="text-purple-600" size={20} />}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- SECTION COMMANDES RÉCENTES --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
            <h2 className="text-sm font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
              <ArrowUpRight size={18} className="text-orange-600" /> Flux des Commandes
            </h2>
            <Link to="/orders" className="text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-widest">
              Voir l'historique
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {orders.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all font-black text-xs">
                        {order.customer_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{order.customer_name}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] font-bold text-gray-400 uppercase">
                          <span className="flex items-center gap-1"><Phone size={10} strokeWidth={3} /> {order.customer_phone}</span>
                          <span className="hidden sm:flex items-center gap-1"><MapPin size={10} strokeWidth={3} /> {order.customer_city || 'Ouaga'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900 tracking-tighter">{order.total_amount.toLocaleString()} CFA</p>
                      <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Confirmé</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <ShoppingBag size={40} className="mx-auto text-gray-200" strokeWidth={1} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">En attente de votre première vente...</p>
              </div>
            )}
          </div>
        </div>

        {/* --- SECTION STOCK RAPIDE --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
            <h2 className="text-sm font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-orange-600" /> Inventaire
            </h2>
            <Link to="/products" className="text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-widest">
              Gérer
            </Link>
          </div>

          <div className="space-y-4">
            {products.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:border-black transition-all">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-inner">
                  <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-gray-900 uppercase truncate leading-tight">{p.name}</p>
                  <p className="text-[10px] font-bold text-orange-600 mt-1">{p.sale_price?.toLocaleString() || p.price.toLocaleString()} CFA</p>
                  <div className="w-full bg-gray-100 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${p.stock_quantity < 5 ? 'bg-red-500' : 'bg-green-500'}`} 
                      style={{ width: `${Math.min(p.stock_quantity * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Stock</p>
                  <p className={`text-sm font-black ${p.stock_quantity < 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock_quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SOUS-COMPOSANT STATCARD RÉVISÉ ---
function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-full">
          +12%
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-gray-900 tracking-tighter">{value}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{unit}</span>
        </div>
      </div>
    </div>
  );
}