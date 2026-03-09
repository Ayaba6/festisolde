import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Trash2, ExternalLink, ShieldCheck, Store, Loader2, 
  Wallet, CheckCircle2, Clock, XCircle, TrendingUp,
  Activity, Search, EyeOff, Eye, Percent
} from 'lucide-react';

// --- CONFIGURATION : TA COMMISSION (0.10 = 10%) ---
const COMMISSION_RATE = 0.10;

export default function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('stores');
  const [searchTerm, setSearchTerm] = useState('');

  const [globalStats, setGlobalStats] = useState({
    totalBalance: 0,
    activeStores: 0,
    pendingWithdrawals: 0,
    totalWithdrawals: 0,
    totalCommissions: 0 // Stat pour tes gains
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
    
    // Calcul des statistiques
    const validatedWithdrawals = wData.filter(w => w.status === 'valide');
    const totalWithdrawnBrut = validatedWithdrawals.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    setGlobalStats({
      totalBalance: sData.reduce((acc, curr) => acc + (curr.balance || 0), 0),
      activeStores: sData.filter(s => s.status !== 'hidden').length,
      pendingWithdrawals: wData.filter(w => w.status === 'en_cours').length,
      totalWithdrawals: totalWithdrawnBrut,
      totalCommissions: totalWithdrawnBrut * COMMISSION_RATE // Ce que tu as gagné au total
    });

    setLoading(false);
  }

  // --- LOGIQUE : CACHER / AFFICHER ---
  const toggleStoreVisibility = async (id, currentStatus) => {
    const newStatus = currentStatus === 'hidden' ? 'active' : 'hidden';
    const { error } = await supabase.from('stores').update({ status: newStatus }).eq('id', id);
    if (!error) setStores(stores.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  // --- LOGIQUE : SUPPRESSION ---
  const deleteStore = async (id, name) => {
    if (!window.confirm(`🚨 SUPPRESSION DÉFINITIVE\n\nÊtes-vous sûr de vouloir supprimer "${name}" ?`)) return;
    try {
      await supabase.from('products').delete().eq('store_id', id);
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) setStores(stores.filter(s => s.id !== id));
    } catch (err) { alert("Erreur de suppression"); }
  };

  const updateWithdrawalStatus = async (id, newStatus) => {
    const { error } = await supabase.from('withdrawal_requests').update({ 
      status: newStatus, 
      processed_at: new Date().toISOString() 
    }).eq('id', id);

    if (!error) {
      setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: newStatus } : w));
    }
  };

  const filteredData = activeTab === 'stores' 
    ? stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : withdrawals.filter(w => w.stores?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (userStatus === "unauthorized") return <UnauthorizedScreen />;
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans antialiased text-slate-900">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-orange-50/50 to-transparent -z-10" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg rotate-3">
              <ShieldCheck className="text-orange-500" size={20} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-tighter">Command <span className="text-orange-600">Center</span></h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <TabButton active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} label="Boutiques" icon={<Store size={14}/>} />
            <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} label="Retraits" icon={<Wallet size={14}/>} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AdminStatCard label="Liquidité Totale" value={globalStats.totalBalance} unit="FCFA" icon={<Activity className="text-orange-600"/>} color="bg-orange-50" />
          <AdminStatCard label="Commission (10%)" value={globalStats.totalCommissions} unit="FCFA" icon={<Percent className="text-blue-600"/>} color="bg-blue-50" />
          <AdminStatCard label="En Attente" value={globalStats.pendingWithdrawals} unit="Demandes" icon={<Clock className="text-amber-600"/>} color="bg-amber-50" />
          <AdminStatCard label="Volume Sortant" value={globalStats.totalWithdrawals} unit="FCFA" icon={<TrendingUp className="text-green-600"/>} color="bg-green-50" />
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {activeTab === 'stores' ? (
                  <>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Boutique</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Solde</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Origine</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Détails Calcul</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Net à verser</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Décision</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  {activeTab === 'stores' ? (
                    <StoreRow store={item} onToggle={toggleStoreVisibility} onDelete={deleteStore} />
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

// --- SOUS-COMPOSANTS ---

function WithdrawalRow({ withdrawal, onStatusUpdate }) {
  const isPending = withdrawal.status === 'en_cours';
  
  // Calcul de la commission
  const brut = withdrawal.amount || 0;
  const commission = brut * COMMISSION_RATE;
  const net = brut - commission;

  return (
    <>
      <td className="p-6">
        <p className="text-xs font-black uppercase text-orange-600 italic leading-none">{withdrawal.stores?.name}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{withdrawal.payment_method} : {withdrawal.payment_details}</p>
      </td>
      <td className="p-6">
        <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex justify-between w-28 text-slate-400">
            <span>Brut:</span>
            <span>{brut.toLocaleString()}</span>
          </div>
          <div className="flex justify-between w-28 text-blue-600">
            <span>Com (10%):</span>
            <span>-{commission.toLocaleString()}</span>
          </div>
        </div>
      </td>
      <td className="p-6 text-center">
        <div className="inline-block bg-slate-900 text-white px-4 py-2 rounded-xl">
          <span className="text-lg font-black tracking-tighter italic">{net.toLocaleString()}</span>
          <span className="text-[8px] ml-1 uppercase text-orange-400 font-black">FCFA</span>
        </div>
      </td>
      <td className="p-6 text-right">
        {isPending ? (
          <div className="flex justify-end gap-2">
            <button onClick={() => onStatusUpdate(withdrawal.id, 'valide')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all shadow-lg active:scale-95">Valider</button>
            <button onClick={() => onStatusUpdate(withdrawal.id, 'rejete')} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><XCircle size={20} /></button>
          </div>
        ) : (
          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${withdrawal.status === 'valide' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {withdrawal.status === 'valide' ? '✅ Payé' : '❌ Rejeté'}
          </span>
        )}
      </td>
    </>
  );
}

function StoreRow({ store, onToggle, onDelete }) {
  const isHidden = store.status === 'hidden';
  return (
    <>
      <td className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHidden ? 'bg-slate-100 text-slate-400' : 'bg-black text-white'}`}>
            <Store size={18} />
          </div>
          <div>
            <p className={`text-xs font-black uppercase ${isHidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{store.name}</p>
            <button onClick={() => window.open(`/${store.slug}`, '_blank')} className="text-[9px] font-bold text-orange-600 uppercase hover:underline">Voir boutique ↗</button>
          </div>
        </div>
      </td>
      <td className="p-6 text-center">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${isHidden ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {isHidden ? 'Caché' : 'Visible'}
        </span>
      </td>
      <td className="p-6 font-black italic text-slate-900 text-sm">
        {store.balance?.toLocaleString()} <span className="text-[9px] not-italic text-slate-400">FCFA</span>
      </td>
      <td className="p-6 text-right">
        <div className="flex justify-end gap-2">
          <button onClick={() => onToggle(store.id, store.status)} className={`p-2.5 rounded-xl transition-all ${isHidden ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
            {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button onClick={() => onDelete(store.id, store.name)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </>
  );
}

// Les composants restants (AdminStatCard, TabButton, etc.) sont identiques
function AdminStatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>{icon}</div>
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

function TabButton({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon} {label}
    </button>
  );
}

function EmptyState() {
  return <div className="py-20 text-center text-[10px] font-black uppercase text-slate-300">Aucune donnée</div>;
}

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initialisation...</span>
    </div>
  );
}

function UnauthorizedScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <ShieldCheck size={48} className="text-red-500 mb-4" />
      <h1 className="text-xl font-black uppercase italic mb-2">Accès Non Autorisé</h1>
    </div>
  );
}