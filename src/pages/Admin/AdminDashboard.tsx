import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Trash2, ExternalLink, ShieldCheck, Store, Loader2, 
  Wallet, CheckCircle2, Clock, XCircle, ChevronRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' ou 'withdrawals'

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Nettoyage des IDs pour éviter les erreurs d'espaces
    const adminIdFromEnv = import.meta.env.VITE_ADMIN_UID?.trim();
    const currentUserId = user?.id?.trim();

    if (!user || currentUserId !== adminIdFromEnv) {
      setUserStatus("unauthorized");
      setTimeout(() => { window.location.href = "/"; }, 3000);
      return;
    }

    // 1. Charger les Boutiques
    const { data: storesData } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 2. Charger les Retraits avec la jointure stores via store_id
    const { data: withdrawalsData } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        stores (
          name
        )
      `)
      .order('created_at', { ascending: false });

    setStores(storesData || []);
    setWithdrawals(withdrawalsData || []);
    setLoading(false);
  }

  const deleteStore = async (id, name) => {
    if (confirm(`⚠️ Supprimer définitivement la boutique "${name}" ? Cette action est irréversible.`)) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) {
        setStores(stores.filter(s => s.id !== id));
      } else {
        alert("Erreur lors de la suppression : " + error.message);
      }
    }
  };

  const updateWithdrawalStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ 
        status: newStatus, 
        processed_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (!error) {
      // Mise à jour locale de l'état pour un feedback instantané
      setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: newStatus } : w));
    } else {
      alert("Erreur lors de la mise à jour : " + error.message);
    }
  };

  if (userStatus === "unauthorized") return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full">
        <ShieldCheck size={24} />
      </div>
      <h1 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-900">Accès Refusé</h1>
      <p className="text-[9px] text-gray-400">Redirection en cours...</p>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-orange-600" size={24} />
      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Sync Administration...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 mb-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center rounded-lg shadow-xl">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-[12px] font-bold uppercase tracking-[0.3em] text-gray-900">Administration</h1>
              <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-1 italic">Dashboard de Contrôle</p>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-50 p-1 rounded-full">
             <TabButton active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} label="Boutiques" />
             <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} label="Retraits" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <div className="bg-white border border-gray-100 overflow-hidden rounded-[1.5rem] shadow-sm">
          
          {activeTab === 'stores' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Boutique</th>
                    <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Slug</th>
                    <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Solde (CFA)</th>
                    <th className="p-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stores.map(store => (
                    <tr key={store.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                            <Store size={14} />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-800">{store.name}</span>
                        </div>
                      </td>
                      <td className="p-6 font-mono text-[10px] text-gray-400">/{store.slug}</td>
                      <td className="p-6 text-[11px] font-black italic">{store.balance?.toLocaleString()} F</td>
                      <td className="p-6">
                        <div className="flex justify-end gap-4">
                          <button onClick={() => window.open(`/store/${store.slug}`, '_blank')} className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all shadow-sm">
                            <ExternalLink size={14} />
                          </button>
                          <button onClick={() => deleteStore(store.id, store.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Date & Boutique</th>
                    <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Paiement</th>
                    <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Montant</th>
                    <th className="p-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{new Date(w.created_at).toLocaleDateString()}</p>
                        <p className="text-[11px] font-black uppercase tracking-tighter italic text-orange-600">
                          {w.stores?.name || 'Boutique Inconnue'}
                        </p>
                      </td>
                      <td className="p-6">
                        <p className="text-[10px] font-bold uppercase text-gray-800">{w.payment_method}</p>
                        <p className="text-[10px] font-medium text-blue-600 font-mono tracking-tighter">{w.payment_details}</p>
                      </td>
                      <td className="p-6 text-[12px] font-black italic">{w.amount?.toLocaleString()} CFA</td>
                      <td className="p-6">
                        <div className="flex justify-end gap-2">
                          {w.status === 'en_cours' ? (
                            <>
                              <button 
                                onClick={() => updateWithdrawalStatus(w.id, 'valide')} 
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase hover:bg-orange-600 transition-all shadow-md active:scale-95"
                              >
                                <CheckCircle2 size={12} /> Valider
                              </button>
                              <button 
                                onClick={() => updateWithdrawalStatus(w.id, 'rejete')} 
                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          ) : (
                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 ${
                              w.status === 'valide' 
                              ? 'bg-green-50 text-green-600 border-green-100' 
                              : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                              {w.status === 'valide' ? '✅ Transféré' : '❌ Rejeté'}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'stores' ? stores.length : withdrawals.length) === 0 && (
            <div className="py-32 text-center">
              <div className="inline-flex w-12 h-12 bg-gray-50 text-gray-200 items-center justify-center rounded-full mb-4">
                <Clock size={24} />
              </div>
              <p className="italic text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                Aucune donnée enregistrée pour le moment
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
        active 
        ? 'bg-black text-white shadow-xl scale-105' 
        : 'text-gray-400 hover:text-black hover:bg-white'
      }`}
    >
      {label}
    </button>
  );
}