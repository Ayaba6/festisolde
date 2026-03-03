import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import RequestBoost from './RequestBoost'; // Import du composant créé précédemment
import { 
  Plus, 
  ShoppingBag, 
  Users, 
  Wallet, 
  Phone, 
  MapPin, 
  ArrowUpRight,
  TrendingUp,
  Package,
  Zap,
  X
} from 'lucide-react';

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, salesCount: 0, customersCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showBoostModal, setShowBoostModal] = useState(false); // État pour le modal

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: storeData } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
      if (storeData) {
        setStore(storeData);
        
        const { data: productsData } = await supabase.from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        setProducts(productsData || []);

        const { data: ordersData } = await supabase.from('orders')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          setOrders(ordersData);
          const totalRevenue = ordersData.reduce((acc, order) => acc + (order.total_amount || 0), 0);
          const uniqueCustomers = new Set(ordersData.map(o => o.customer_phone)).size;
          const recentSales = ordersData.filter(o => new Date(o.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
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
    <div className="max-w-7xl mx-auto space-y-10 pb-20 relative">
      
      {/* --- MODAL DE BOOST --- */}
      {showBoostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBoostModal(false)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowBoostModal(false)}
              className="absolute top-6 right-6 z-10 p-2 bg-black text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              <X size={20} />
            </button>
            <RequestBoost />
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">
            STUDIO <span className="text-orange-600">{store?.name}</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-black mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Session Vendeur Active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBoostModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-2xl text-[11px] font-black tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-100"
          >
            <Zap size={18} fill="currentColor" /> BOOSTER VISIBILITÉ
          </button>
          <Link to="/add-product" className="flex items-center gap-2 bg-black text-white px-6 py-4 rounded-2xl text-[11px] font-black tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
            <Plus size={18} strokeWidth={3} /> AJOUTER ARTICLE
          </Link>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Chiffre d'Affaires" value={stats.totalRevenue.toLocaleString()} unit="CFA" icon={<Wallet className="text-orange-600" size={20} />} color="bg-orange-50" />
        <StatCard label="Ventes (7j)" value={stats.salesCount} unit="COMMANDES" icon={<ShoppingBag className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Clients" value={stats.customersCount} unit="UNIQUES" icon={<Users className="text-purple-600" size={20} />} color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- SECTION GAUCHE : COMMANDES --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
            <h2 className="text-sm font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
              <ArrowUpRight size={18} className="text-orange-600" /> Flux des Commandes
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {orders.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black text-xs text-gray-400">
                        {order.customer_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase">{order.customer_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.customer_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{order.total_amount.toLocaleString()} CFA</p>
                      <p className="text-[9px] font-black text-green-500 uppercase">Confirmé</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <ShoppingBag size={40} className="mx-auto text-gray-200" strokeWidth={1} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">En attente de ventes...</p>
              </div>
            )}
          </div>
        </div>

        {/* --- SECTION DROITE : INVENTAIRE & PROMO --- */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* BANNIÈRE MARKETING RAPIDE */}
          <div className="bg-gradient-to-br from-orange-600 to-red-700 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-orange-200">
            <Zap size={32} fill="white" className="animate-pulse" />
            <h3 className="text-xl font-black uppercase italic leading-none">Vendez 3x plus vite</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-relaxed">
              Activez un pack marketing et faites décoller vos stocks auprès des revendeurs.
            </p>
            <button 
              onClick={() => setShowBoostModal(true)}
              className="w-full bg-white text-orange-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Découvrir les Packs
            </button>
          </div>

          {/* INVENTAIRE RAPIDE */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4">
              <h2 className="text-sm font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-orange-600" /> Inventaire
              </h2>
            </div>
            <div className="space-y-4">
              {products.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-inner">
                    <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-900 uppercase truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-orange-600 mt-1">{p.price.toLocaleString()} CFA</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${p.stock_quantity < 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock_quantity}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">PCS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <div className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-full">+12%</div>
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