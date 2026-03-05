import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import RequestBoost from './RequestBoost';
import { 
  Plus, ShoppingBag, Users, Wallet, ArrowUpRight, Zap, X, TrendingUp, 
  Image as ImageIcon, Loader2, Save, BarChart3, ChevronRight 
} from 'lucide-react';

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, salesCount: 0, customersCount: 0 });
  const [analytics, setAnalytics] = useState({ views: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

        // 1. Produits
        const { data: pData } = await supabase.from('products').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
        setProducts(pData || []);
        
        // 2. Commandes & Stats Ventes
        const { data: oData } = await supabase.from('orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
        if (oData) {
          setOrders(oData);
          const totalRevenue = oData.reduce((acc, order) => acc + (order.total_amount || 0), 0);
          const uniqueCustomers = new Set(oData.map(o => o.customer_phone)).size;
          const recentSales = oData.filter(o => new Date(o.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
          setStats({ totalRevenue, salesCount: recentSales, customersCount: uniqueCustomers });
        }

        // 3. Aperçu rapide des vues
        const { data: viewsData } = await supabase.from('store_analytics').select('views_count').eq('store_id', storeData.id);
        if (viewsData) {
          const totalViews = viewsData.reduce((acc, curr) => acc + curr.views_count, 0);
          setAnalytics({ views: totalViews });
        }
      }
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* --- MODAL AJOUT --- */}
      {isAddModalOpen && <AddProductModal storeId={store?.id} onClose={() => setIsAddModalOpen(false)} onRefresh={fetchDashboardData} />}

      {/* --- MODAL BOOST --- */}
      {showBoostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-gray-800 rounded-[2.5rem] bg-white">
            <button onClick={() => setShowBoostModal(false)} className="absolute top-6 right-6 z-10 p-3 bg-black text-white rounded-full"><X size={20}/></button>
            <RequestBoost />
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
            MAGASIN <span className="text-orange-600">{store?.name}</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <div className="px-3 py-1 bg-green-50 rounded-full border border-green-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Boutique Active</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowBoostModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all">
            <Zap size={16} fill="white" /> BOOSTER
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest shadow-xl active:scale-95 transition-all">
            <Plus size={16} strokeWidth={3} /> AJOUTER
          </button>
        </div>
      </div>

      {/* --- STATS CLÉS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenus" value={stats.totalRevenue.toLocaleString()} unit="FCFA" icon={<Wallet size={18} />} />
        
        {/* Carte Visiteurs cliquable vers la nouvelle section */}
        <Link to="/analytics" className="block group">
          <StatCard 
            label="Visiteurs" 
            value={analytics.views} 
            unit="VUES" 
            icon={<TrendingUp size={18} />} 
            isLink 
          />
        </Link>

        <StatCard label="Ventes (7j)" value={stats.salesCount} unit="COMMANDES" icon={<ShoppingBag size={18} />} />
        <StatCard label="Clients" value={stats.customersCount} unit="UNIQUES" icon={<Users size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* TRANSACTIONS RÉCENTES */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
               <div className="w-1.5 h-5 bg-orange-600 rounded-full"></div> 
               Flux de ventes
             </h2>
             <Link to="/revenus" className="text-[10px] font-black text-gray-400 hover:text-orange-600 flex items-center gap-1 uppercase tracking-widest">
               Tout voir <ChevronRight size={14} />
             </Link>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden divide-y-2 divide-gray-50">
            {orders.length > 0 ? orders.slice(0, 5).map(o => (
              <div key={o.id} className="p-6 flex justify-between items-center group hover:bg-gray-50/50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      {o.customer_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-black uppercase italic">{o.customer_name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{o.customer_phone}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black italic">{o.total_amount.toLocaleString()} <span className="text-[10px] text-orange-600">FCFA</span></p>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Payé</p>
                 </div>
              </div>
            )) : (
              <div className="p-20 text-center space-y-4">
                <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.3em]">En attente de commandes</p>
                <button onClick={() => setShowBoostModal(true)} className="text-[10px] font-black text-orange-600 underline uppercase tracking-widest">Lancer une campagne</button>
              </div>
            )}
          </div>
        </div>

        {/* RACCOURCIS & TOP STOCK */}
        <div className="lg:col-span-4 space-y-8">
          <Link to="/analytics" className="block bg-black p-8 rounded-[2.5rem] text-white shadow-2xl group relative overflow-hidden">
             <div className="relative z-10">
               <BarChart3 size={24} className="text-orange-600 mb-4" />
               <h3 className="text-lg font-black uppercase italic leading-tight">Voir les <br/>Analytiques</h3>
               <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mt-2 group-hover:opacity-100 transition-opacity">Analyser le trafic →</p>
             </div>
             <TrendingUp size={120} className="absolute -bottom-4 -right-4 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </Link>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest italic px-2">Top Inventaire</h2>
            <div className="space-y-3">
              {products.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border-2 border-gray-100 flex items-center gap-4 hover:border-black transition-all">
                  <img src={p.image_url} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase truncate italic">{p.name}</p>
                    <p className="text-[10px] font-black text-orange-600">{p.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="bg-gray-50 px-3 py-1 rounded-lg text-center">
                    <p className="text-xs font-black italic">{p.stock_quantity}</p>
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

function StatCard({ label, value, unit, icon, isLink = false }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-xl hover:border-orange-600 transition-all group relative">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-xl text-gray-900 group-hover:bg-orange-600 group-hover:text-white transition-all">
          {icon}
        </div>
        {isLink && <ArrowUpRight size={14} className="text-gray-300 group-hover:text-orange-600 transition-colors" />}
      </div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">{value}</span>
        <span className="text-[9px] font-black text-orange-600 uppercase italic">{unit}</span>
      </div>
    </div>
  );
}

// ... (Garder le composant AddProductModal identique au précédent)