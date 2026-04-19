import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import RequestBoost from './RequestBoost';
import AddProductModal from './AddProductModal';
import { 
  Plus, ShoppingBag, Users, Wallet, ArrowUpRight, Zap, X, TrendingUp, 
  Loader2, BarChart3, ChevronRight 
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

    // Souscription temps réel optimisée
    const productsChannel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .single();
    
    if (storeData) {
      setStore(storeData);

      // Récupération parallèle pour gagner en vitesse
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false })
      ]);

      if (productsRes.data) {
        setProducts(productsRes.data);
        const totalViews = productsRes.data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        setAnalytics({ views: totalViews });
      }
      
      if (ordersRes.data) {
        setOrders(ordersRes.data);
        const totalRevenue = ordersRes.data.reduce((acc, order) => acc + (order.total_amount || 0), 0);
        const uniqueCustomers = new Set(ordersRes.data.map(o => o.customer_phone)).size;
        const recentSales = ordersRes.data.filter(o => 
          new Date(o.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        setStats({ totalRevenue, salesCount: recentSales, customersCount: uniqueCustomers });
      }
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 p-6 antialiased">
      
      {/* --- MODALS --- */}
      {isAddModalOpen && (
        <AddProductModal 
          storeId={store?.id} 
          onClose={() => setIsAddModalOpen(false)} 
          onRefresh={fetchDashboardData} 
        />
      )}

      {showBoostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 rounded-[3rem] bg-white shadow-2xl">
            <button onClick={() => setShowBoostModal(false)} className="absolute top-8 right-8 z-10 p-3 bg-slate-900 text-white rounded-full hover:scale-110 active:scale-90 transition-all"><X size={20}/></button>
            <RequestBoost />
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Dashboard</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            {store?.name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowBoostModal(true)} className="group relative flex items-center justify-center gap-3 bg-orange-600 text-white px-8 py-5 rounded-[2rem] text-[11px] font-black tracking-widest shadow-2xl shadow-orange-200 hover:bg-orange-500 transition-all active:scale-95">
            <Zap size={18} fill="currentColor" className="group-hover:animate-bounce" /> BOOSTER L'ENSEIGNE
          </button>
          
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[2rem] text-[11px] font-black tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> AJOUTER UN PRODUIT
          </button>
        </div>
      </div>

      {/* --- STATS CLÉS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Revenus Totaux" 
          value={stats.totalRevenue.toLocaleString()} 
          unit="FCFA" 
          icon={<Wallet size={20} />} 
        />
        
        <Link to="/analytics" className="block group">
          <StatCard 
            label="Visiteurs" 
            value={analytics.views} 
            unit="VUES" 
            icon={<TrendingUp size={20} />} 
            isLink 
            isLive 
          />
        </Link>

        <StatCard 
          label="Ventes (7j)" 
          value={stats.salesCount} 
          unit="COMMANDES" 
          icon={<ShoppingBag size={20} />} 
        />
        
        <StatCard 
          label="Clients" 
          value={stats.customersCount} 
          unit="UNIQUES" 
          icon={<Users size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FLUX DE VENTES */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-3 text-slate-900">
               <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div> 
               Flux de ventes récent
             </h2>
             <Link to="/revenus" className="text-[10px] font-black text-slate-400 hover:text-orange-600 flex items-center gap-1 uppercase tracking-widest transition-colors">
               Voir tout l'historique <ChevronRight size={14} />
             </Link>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {orders.length > 0 ? orders.slice(0, 5).map(o => (
              <div key={o.id} className="p-8 flex justify-between items-center group hover:bg-slate-50/50 transition-colors">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-100 rounded-[1.2rem] flex items-center justify-center font-black text-sm text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:rotate-6">
                      {o.customer_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[15px] font-black uppercase italic text-slate-900 leading-none mb-1">{o.customer_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{o.customer_phone}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-black italic text-slate-900">{o.total_amount?.toLocaleString()} <span className="text-[10px] text-orange-600 font-black tracking-normal">CFA</span></p>
                    <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-tighter rounded-md">Payé</div>
                 </div>
              </div>
            )) : (
              <div className="py-32 text-center flex flex-col items-center justify-center">
                <ShoppingBag size={48} className="text-slate-100 mb-4" />
                <p className="text-slate-300 font-black text-xs uppercase tracking-[0.3em]">Aucune vente pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* RACCOURCIS & TOP STOCK */}
        <div className="lg:col-span-4 space-y-10">
          <Link to="/analytics" className="block bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl group relative overflow-hidden transition-all hover:translate-y-[-5px]">
             <div className="relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                 <BarChart3 size={24} className="text-orange-500" />
               </div>
               <h3 className="text-2xl font-black uppercase italic leading-[1.1] tracking-tighter">Performance <br/>Globale</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-4 group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">Découvrir les insights <ChevronRight size={14}/></p>
             </div>
             <TrendingUp size={160} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12 group-hover:rotate-0 transition-all duration-700" />
          </Link>

          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest italic px-4 text-slate-900">Top Inventaire</h2>
            <div className="space-y-4">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="bg-white p-4 rounded-[1.8rem] border border-slate-100 flex items-center gap-4 hover:border-orange-500 transition-all hover:shadow-lg group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black uppercase truncate italic text-slate-900 leading-tight mb-1">{p.name}</p>
                    <p className="text-[11px] font-black text-orange-600 tracking-tighter">{p.sale_price?.toLocaleString() || p.price?.toLocaleString()} FCFA</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Stock</p>
                    <p className="text-sm font-black italic text-slate-900">{p.stock_quantity || 0}</p>
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

function StatCard({ label, value, unit, icon, isLink = false, isLive = false }) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-500 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className={`p-3 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 ${isLive ? 'ring-8 ring-orange-50' : ''}`}>
          {icon}
        </div>
        {isLink && (
          <ArrowUpRight size={18} className="text-slate-200 group-hover:text-orange-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 leading-none">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
            {value}
          </span>
          <span className="text-[11px] font-black text-orange-600 uppercase italic tracking-widest">
            {unit}
          </span>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12 scale-[2.5]">
        {icon}
      </div>
    </div>
  );
}