import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import RequestBoost from './RequestBoost';
import { 
  Plus, 
  ShoppingBag, 
  Users, 
  Wallet, 
  ArrowUpRight,
  Package,
  Zap,
  X,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, salesCount: 0, customersCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showBoostModal, setShowBoostModal] = useState(false);

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
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Ouverture du Studio...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased text-gray-900 space-y-12 pb-20">
      
      {/* --- MODAL DE BOOST --- */}
      {showBoostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-gray-800 rounded-[2.5rem] bg-white">
            <button onClick={() => setShowBoostModal(false)} className="absolute top-6 right-6 z-10 p-3 bg-black text-white rounded-full hover:bg-orange-600 transition-colors shadow-xl">
              <X size={20} />
            </button>
            <RequestBoost />
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight leading-none">
            STUDIO <span className="text-orange-600">{store?.name}</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Now</span>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Vendeur vérifié</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowBoostModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 active:scale-95"
          >
            <Zap size={16} fill="white" /> BOOSTER VISIBILITÉ
          </button>
          <Link to="/inventory" className="flex items-center gap-2 bg-black text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95">
            <Plus size={16} strokeWidth={3} /> AJOUTER ARTICLE
          </Link>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Chiffre d'Affaires" value={stats.totalRevenue.toLocaleString()} unit="CFA" icon={<Wallet size={20} />} trend="+12%" />
        <StatCard label="Ventes (7j)" value={stats.salesCount} unit="COMMANDES" icon={<ShoppingBag size={20} />} trend="Live" />
        <StatCard label="Clients" value={stats.customersCount} unit="UNIQUES" icon={<Users size={20} />} trend="Global" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- SECTION GAUCHE : COMMANDES --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-1.5 h-6 bg-black rounded-full"></div>
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 italic">Dernières Transactions</h2>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden">
            {orders.length > 0 ? (
              <div className="divide-y-2 divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-sm text-gray-400 group-hover:bg-white group-hover:text-orange-600 transition-colors border-2 border-transparent group-hover:border-orange-100">
                        {order.customer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-900 uppercase italic tracking-tight">{order.customer_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-widest">{order.customer_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{order.total_amount.toLocaleString()} <span className="text-[10px] text-orange-600 italic">CFA</span></p>
                      <span className="text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-md uppercase mt-1 inline-block">Confirmé</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-100 mb-4" strokeWidth={1} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Aucune commande active</p>
              </div>
            )}
            <Link to="/revenues" className="block w-full py-4 bg-gray-50 text-center text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
              Voir tout le journal financier
            </Link>
          </div>
        </div>

        {/* --- SECTION DROITE : INVENTAIRE & PROMO --- */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* BANNIÈRE BOOST - Style plus "Premium" */}
          <div className="relative overflow-hidden bg-black p-8 rounded-[2.5rem] text-white shadow-2xl group cursor-pointer" onClick={() => setShowBoostModal(true)}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <TrendingUp size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Zap size={20} fill="white" className="animate-pulse text-white" />
              </div>
              <h3 className="text-xl font-black uppercase italic leading-none tracking-tight">Vendez <br/><span className="text-orange-600">3x plus vite</span></h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                Marketing intelligent & mise en avant revendeurs.
              </p>
              <div className="flex items-center gap-2 text-[9px] font-black text-orange-500 uppercase tracking-widest pt-2 group-hover:gap-4 transition-all">
                DÉCOUVRIR LES PACKS <ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* INVENTAIRE RAPIDE - Style "Articles" */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
               <div className="w-1.5 h-6 bg-black rounded-full"></div>
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 italic">Top Stock</h2>
            </div>
            
            <div className="space-y-3">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border-2 border-gray-100 flex items-center gap-4 group hover:border-black transition-all">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-900 uppercase truncate italic leading-tight">{p.name}</p>
                    <p className="text-[10px] font-black text-orange-600 mt-1">{p.price.toLocaleString()} CFA</p>
                  </div>
                  <div className="text-right px-2">
                    <p className={`text-sm font-black italic ${p.stock_quantity < 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock_quantity}</p>
                    <p className="text-[8px] font-black text-gray-300 uppercase">UNIT</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/inventory" className="flex items-center justify-center gap-2 w-full py-4 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
               GÉRER TOUT LE STOCK <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, trend }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-xl hover:border-black transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all text-gray-900">
          {icon}
        </div>
        <div className="px-3 py-1 bg-green-50 border border-green-100 text-green-600 text-[9px] font-black rounded-lg uppercase tracking-widest italic">{trend}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">{value}</span>
          <span className="text-[10px] font-black text-orange-600 uppercase italic">{unit}</span>
        </div>
      </div>
    </div>
  );
}