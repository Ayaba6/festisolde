import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Trash2, ExternalLink, ShieldCheck, Store, Loader2, 
  Wallet, CheckCircle2, Clock, XCircle, TrendingUp,
  Users, Activity, Search, Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('stores');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats globales
  const [globalStats, setGlobalStats] = useState({
    totalBalance: 0,
    activeStores: 0,
    pendingWithdrawals: 0,
    totalWithdrawals: 0
  });

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const adminIdFromEnv = import.meta.env.VITE_ADMIN_UID?.trim();
    const currentUserId = user?.id?.trim();

    if (!user || currentUserId !== adminIdFromEnv) {
      setUserStatus("unauthorized");
      setTimeout(() => { window.location.href = "/"; }, 3000);
      return;
    }

    const { data: storesData } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    const { data: withdrawalsData } = await supabase.from('withdrawal_requests').select('*, stores(name)').order('created_at', { ascending: false });

    const sData = storesData || [];
    const wData = withdrawalsData || [];

    setStores(sData);
    setWithdrawals(wData);
    
    // Calcul des stats
    setGlobalStats({
      totalBalance: sData.reduce((acc, curr) => acc + (curr.balance || 0), 0),
      activeStores: sData.length,
      pendingWithdrawals: wData.filter(w => w.status === 'en_cours').length,
      totalWithdrawals: wData.filter(w => w.status === 'valide').reduce((acc, curr) => acc + (curr.amount || 0), 0)
    });

    setLoading(false);
  }

  const updateWithdrawalStatus = async (id, newStatus) => {
    const { error } = await supabase.from('withdrawal_requests').update({ 
      status: newStatus, 
      processed_at: new Date().toISOString() 
    }).eq('id', id);

    if (!error) {
      setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: newStatus } : w));
      // Optionnel : recalculer les stats ici
    }
  };

  const filteredData = activeTab === 'stores' 
    ? stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : withdrawals.filter(w => w.stores?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (userStatus === "unauthorized") return <UnauthorizedScreen />;
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans antialiased text-slate-900">
      {/* GLOW EFFECT BACKGROUND */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-orange-50/50 to-transparent -z-10" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg rotate-3">
              <ShieldCheck className="text-orange-500" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter">Command <span className="text-orange-600">Center</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <TabButton active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} label="Boutiques" icon={<Store size={14}/>} />
            <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} label="Retraits" icon={<Wallet size={14}/>} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AdminStatCard label="Liquidité Totale" value={globalStats.totalBalance} unit="CFA" icon={<Activity className="text-orange-600"/>} color="bg-orange-50" />
          <AdminStatCard label="Écosystème" value={globalStats.activeStores} unit="Boutiques" icon={<Store className="text-blue-600"/>} color="bg-blue-50" />
          <AdminStatCard label="En Attente" value={globalStats.pendingWithdrawals} unit="Demandes" icon={<Clock className="text-amber-600"/>} color="bg-amber-50" />
          <AdminStatCard label="Volume Sortant" value={globalStats.totalWithdrawals} unit="CFA" icon={<TrendingUp className="text-green-600"/>} color="bg-green-50" />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrer les données..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {activeTab === 'stores' ? (
                  <>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Informations Boutique</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Lien Public</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Solde Actuel</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Gestion</th>
                  </>
                ) : (
                  <>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Origine & Date</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Méthode de Paiement</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Montant</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Décision</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  {activeTab === 'stores' ? (
                    <StoreRow store={item} />
                  ) : (
                    <WithdrawalRow withdrawal={item} onStatusUpdate={updateWithdrawalStatus} />
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && <EmptyState />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AdminStatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black italic tracking-tighter">{value?.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreRow({ store }) {
  return (
    <>
      <td className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <Store size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight text-slate-900">{store.name}</p>
            <p className="text-[10px] font-mono text-slate-400 tracking-tighter">ID: {store.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="p-6 text-center">
        <button onClick={() => window.open(`/store/${store.slug}`, '_blank')} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-black hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">
          <ExternalLink size={12} /> Voir la boutique
        </button>
      </td>
      <td className="p-6 font-black italic text-orange-600">
        {store.balance?.toLocaleString()} <span className="text-[9px] not-italic text-slate-400">CFA</span>
      </td>
      <td className="p-6 text-right">
        <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
          <Trash2 size={16} />
        </button>
      </td>
    </>
  );
}

function WithdrawalRow({ withdrawal, onStatusUpdate }) {
  const isPending = withdrawal.status === 'en_cours';
  
  return (
    <>
      <td className="p-6">
        <p className="text-xs font-black uppercase text-orange-600 italic tracking-tight">{withdrawal.stores?.name}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
      </td>
      <td className="p-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100">{withdrawal.payment_method}</span>
          <span className="text-[10px] font-mono font-bold text-slate-500">{withdrawal.payment_details}</span>
        </div>
      </td>
      <td className="p-6 text-center font-black italic text-lg tracking-tighter">
        {withdrawal.amount?.toLocaleString()} <span className="text-[9px] not-italic text-slate-400">CFA</span>
      </td>
      <td className="p-6 text-right">
        {isPending ? (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => onStatusUpdate(withdrawal.id, 'valide')}
              className="px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:bg-green-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Approuver
            </button>
            <button 
              onClick={() => onStatusUpdate(withdrawal.id, 'rejete')}
              className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${
            withdrawal.status === 'valide' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {withdrawal.status === 'valide' ? '✅ Traité' : '❌ Rejeté'}
          </span>
        )}
      </td>
    </>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
        ? 'bg-white text-black shadow-sm' 
        : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// --- UTILS SCREENS ---

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
        <Activity size={32} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Silence radio... aucune donnée détectée</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin" />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900" size={24} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Auth Security Check...</span>
    </div>
  );
}

function UnauthorizedScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/50 animate-bounce">
        <ShieldCheck size={40} />
      </div>
      <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">ACCÈS RESTREINT</h1>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-xs">
        Votre ID ne figure pas sur la liste blanche des administrateurs. Redirection automatique...
      </p>
    </div>
  );
}