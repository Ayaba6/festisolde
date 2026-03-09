import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Trash2, ShieldCheck, Store, Loader2, 
  Wallet, CheckCircle2, Clock, XCircle, TrendingUp,
  Activity, EyeOff, Eye, Percent, ArrowLeft, Bell
} from 'lucide-react';

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
    totalCommissions: 0 
  });

  useEffect(() => {
    checkAdminAndFetchData();

    // --- CONFIGURATION TEMPS RÉEL ---
    const channel = supabase
      .channel('admin_realtime')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'withdrawal_requests' }, 
        (payload) => {
          handleIncomingWithdrawal(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function checkAdminAndFetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const adminIdFromEnv = import.meta.env.VITE_ADMIN_UID?.trim();
    const currentUserId = user?.id?.trim();

    if (!user || currentUserId !== adminIdFromEnv) {
      setUserStatus("unauthorized");
      return;
    }

    const { data: storesData } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    const { data: withdrawalsData } = await supabase.from('withdrawal_requests').select('*, stores(name)').order('created_at', { ascending: false });

    setStores(storesData || []);
    setWithdrawals(withdrawalsData || []);
    calculateStats(storesData || [], withdrawalsData || []);
    setLoading(false);
  }

  // Fonction pour gérer une nouvelle demande en direct
  const handleIncomingWithdrawal = async (newRecord) => {
    // Récupérer le nom de la boutique pour l'affichage
    const { data: storeInfo } = await supabase
      .from('stores')
      .select('name')
      .eq('id', newRecord.store_id)
      .single();

    const formattedRecord = { ...newRecord, stores: storeInfo, isNew: true };

    setWithdrawals(prev => [formattedRecord, ...prev]);
    
    // Jouer un son de notification (optionnel)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.play().catch(() => {}); // Éviter erreur si interaction utilisateur manquante

    // Recalculer les compteurs en attente
    setGlobalStats(prev => ({
      ...prev,
      pendingWithdrawals: prev.pendingWithdrawals + 1
    }));
  };

  const calculateStats = (sData, wData) => {
    const validatedWithdrawals = wData.filter(w => w.status === 'valide');
    const totalWithdrawnBrut = validatedWithdrawals.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    setGlobalStats({
      totalBalance: sData.reduce((acc, curr) => acc + (curr.balance || 0), 0),
      activeStores: sData.filter(s => s.status !== 'hidden').length,
      pendingWithdrawals: wData.filter(w => w.status === 'en_cours').length,
      totalWithdrawals: totalWithdrawnBrut,
      totalCommissions: totalWithdrawnBrut * COMMISSION_RATE
    });
  };

  const toggleStoreVisibility = async (id, currentStatus) => {
    const newStatus = currentStatus === 'hidden' ? 'active' : 'hidden';
    const { error } = await supabase.from('stores').update({ status: newStatus }).eq('id', id);
    if (!error) setStores(stores.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const deleteStore = async (id, name) => {
    if (!window.confirm(`🚨 SUPPRESSION DÉFINITIVE\n\nÊtes-vous sûr de vouloir supprimer "${name}" ?`)) return;
    try {
      await supabase.from('products').delete().eq('store_id', id);
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) setStores(stores.filter(s => s.id !== id));
    } catch (err) { alert("Erreur de suppression"); }
  };

  const handleWithdrawalDecision = async (withdrawal, newStatus) => {
    const confirmMsg = newStatus === 'valide' 
      ? `Confirmer le PAIEMENT de ${withdrawal.amount * 0.9} CFA ?` 
      : `REJETER et REMBOURSER le vendeur ?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ status: newStatus, processed_at: new Date().toISOString() })
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      if (newStatus === 'rejete') {
        const { error: rpcError } = await supabase.rpc('increment_balance', {
          vendor_id: withdrawal.vendor_id,
          amount_to_add: withdrawal.amount
        });
        if (rpcError) throw rpcError;
      }

      const updatedWithdrawals = withdrawals.map(w => w.id === withdrawal.id ? { ...w, status: newStatus, isNew: false } : w);
      setWithdrawals(updatedWithdrawals);
      calculateStats(stores, updatedWithdrawals);
      
      alert(newStatus === 'valide' ? "✅ Paiement validé !" : "❌ Retrait rejeté.");
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const filteredData = activeTab === 'stores' 
    ? stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : withdrawals.filter(w => w.stores?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (userStatus === "unauthorized") return <UnauthorizedScreen />;
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans antialiased text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-orange-500" size={20} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-tighter">Command <span className="text-orange-600">Center</span></h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl relative">
            <TabButton active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} label="Boutiques" icon={<Store size={14}/>} />
            <TabButton active={activeTab === 'withdrawals'} onClick={() => { setActiveTab('withdrawals'); setSearchTerm(''); }} label="Retraits" icon={<Wallet size={14}/>} />
            {globalStats.pendingWithdrawals > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white animate-bounce">
                {globalStats.pendingWithdrawals}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AdminStatCard label="Liquidité Totale" value={globalStats.totalBalance} unit="FCFA" icon={<Activity className="text-orange-600"/>} color="bg-orange-50" />
          <AdminStatCard label="Mes Gains (10%)" value={globalStats.totalCommissions} unit="FCFA" icon={<Percent className="text-blue-600"/>} color="bg-blue-50" />
          <AdminStatCard label="En Attente" value={globalStats.pendingWithdrawals} unit="Demandes" icon={<Clock className="text-amber-600"/>} color="bg-amber-50" />
          <AdminStatCard label="Total Sorti" value={globalStats.totalWithdrawals} unit="FCFA" icon={<TrendingUp className="text-green-600"/>} color="bg-green-50" />
        </div>

        <div className="mb-6 max-w-md">
           <input 
             type="text" 
             placeholder={`Rechercher ${activeTab === 'stores' ? 'une boutique' : 'un vendeur'}...`}
             className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm outline-none focus:border-orange-500 text-xs font-bold uppercase transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {activeTab === 'stores' ? (
                  <>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Boutique</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Statut</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Solde Actuel</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-orange-600 flex items-center gap-2 italic"> <Bell size={12}/> Vendeur</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Détails Frais</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center text-orange-600 font-black">Net à verser</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Décision</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className={`group transition-all duration-700 ${item.isNew ? 'bg-orange-50/50 animate-pulse' : 'hover:bg-slate-50/50'}`}>
                  {activeTab === 'stores' ? (
                    <StoreRow store={item} onToggle={toggleStoreVisibility} onDelete={deleteStore} />
                  ) : (
                    <WithdrawalRow withdrawal={item} onStatusUpdate={handleWithdrawalDecision} />
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
  const brut = withdrawal.amount || 0;
  const commission = brut * COMMISSION_RATE;
  const net = brut - commission;

  return (
    <>
      <td className="p-6">
        <p className="text-xs font-black uppercase text-slate-900 leading-none">{withdrawal.stores?.name || 'Inconnue'}</p>
        <p className="text-[9px] font-black text-orange-600 uppercase mt-2 italic">{withdrawal.payment_method} : {withdrawal.payment_details}</p>
      </td>
      <td className="p-6">
        <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex justify-between w-32 text-slate-400">
            <span>Brut:</span>
            <span>{brut.toLocaleString()} F</span>
          </div>
          <div className="flex justify-between w-32 text-blue-600">
            <span>Frais (10%):</span>
            <span>-{commission.toLocaleString()} F</span>
          </div>
        </div>
      </td>
      <td className="p-6 text-center">
        <div className="inline-block bg-orange-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-orange-600/20">
          <span className="text-lg font-black tracking-tighter italic">{net.toLocaleString()}</span>
          <span className="text-[8px] ml-1 uppercase font-black">FCFA</span>
        </div>
      </td>
      <td className="p-6 text-right">
        {isPending ? (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => onStatusUpdate(withdrawal, 'valide')} 
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all shadow-md active:scale-95"
            >
              Valider le Paiement
            </button>
            <button 
              onClick={() => onStatusUpdate(withdrawal, 'rejete')} 
              className="p-2.5 text-slate-300 hover:text-red-600 transition-colors"
            >
              <XCircle size={22} />
            </button>
          </div>
        ) : (
          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${withdrawal.status === 'valide' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {withdrawal.status === 'valide' ? '✅ Payé' : '❌ Refusé'}
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
      <td className="p-6 text-xs font-black uppercase">{store.name}</td>
      <td className="p-6 text-center">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${isHidden ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {isHidden ? 'Invisible' : 'Actif'}
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

// HELPERS
function AdminStatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black italic tracking-tighter">{value?.toLocaleString()}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">{unit}</span>
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
  return <div className="py-20 text-center text-[10px] font-black uppercase text-slate-300">Aucune donnée trouvée</div>;
}

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Chargement du Centre de Commande...</span>
    </div>
  );
}

function UnauthorizedScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <ShieldCheck size={48} className="text-red-500 mb-4 animate-pulse" />
      <h1 className="text-xl font-black uppercase italic mb-2 tracking-tighter">Accès Restreint</h1>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Zone réservée aux administrateurs</p>
      <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all">
        Retour à l'accueil
      </button>
    </div>
  );
}