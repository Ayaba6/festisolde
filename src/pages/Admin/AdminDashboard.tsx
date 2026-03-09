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
    const adminIdFromEnv = import.meta.env.VITE_ADMIN_UID?.trim();
    const currentUserId = user?.id?.trim();

    if (!user || currentUserId !== adminIdFromEnv) {
      setUserStatus("unauthorized");
      setTimeout(() => { window.location.href = "/"; }, 3000);
      return;
    }

    // Charger Boutiques
    const { data: storesData } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    
    // Charger Retraits avec les infos du store associé
    const { data: withdrawalsData } = await supabase
      .from('withdrawal_requests')
      .select('*, stores(name)')
      .order('created_at', { ascending: false });

    setStores(storesData || []);
    setWithdrawals(withdrawalsData || []);
    setLoading(false);
  }

  const deleteStore = async (id, name) => {
    if (confirm(`Supprimer définitivement la boutique "${name}" ?`)) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) setStores(stores.filter(s => s.id !== id));
    }
  };

  const updateWithdrawalStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: newStatus, processed_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: newStatus } : w));
    } else {
      alert("Erreur lors de la mise à jour");
    }
  };

  if (userStatus === "unauthorized") return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full"><ShieldCheck size={24} /></div>
      <h1 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-900">Accès Refusé</h1>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-gray-200" size={20} />
      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Sync Administration...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center"><ShieldCheck className="text-white" size={18} /></div>
            <div>
              <h1 className="text-[12px] font-bold uppercase tracking-[0.3em] text-gray-900">Administration</h1>
              <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-1 italic">Festisolde Control Panel</p>
            </div>
          </div>
          <div className="flex gap-2">
             <TabButton active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} label="Boutiques" />
             <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} label="Retraits" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <div className="bg-white border border-gray-100 overflow-hidden rounded-sm shadow-sm">
          
          {activeTab === 'stores' ? (
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
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-gray-400"><Store size={14} /></div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-800">{store.name}</span>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-[10px] text-gray-400">/{store.slug}</td>
                    <td className="p-6 text-[11px] font-black italic">{store.balance?.toLocaleString()} F</td>
                    <td className="p-6">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => window.open(`/store/${store.slug}`, '_blank')} className="text-gray-400 hover:text-black transition-colors"><ExternalLink size={14} /></button>
                        <button onClick={() => deleteStore(store.id, store.name)} className="text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Date & Store</th>
                  <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Méthode & Numéro</th>
                  <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Montant</th>
                  <th className="p-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {withdrawals.map(w => (
                  <tr key={w.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{new Date(w.created_at).toLocaleDateString()}</p>
                      <p className="text-[11px] font-black uppercase tracking-tighter italic text-orange-600">{w.stores?.name || 'Inconnu'}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-[10px] font-bold uppercase text-gray-800">{w.payment_method}</p>
                      <p className="text-[10px] font-medium text-blue-600 font-mono">{w.payment_details}</p>
                    </td>
                    <td className="p-6 text-[12px] font-black italic">{w.amount?.toLocaleString()} CFA</td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        {w.status === 'en_cours' ? (
                          <>
                            <button onClick={() => updateWithdrawalStatus(w.id, 'valide')} className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase hover:bg-green-600 hover:text-white transition-all">
                              <CheckCircle2 size={12} /> Valider le transfert
                            </button>
                            <button onClick={() => updateWithdrawalStatus(w.id, 'rejete')} className="p-2 text-gray-300 hover:text-red-600"><XCircle size={16} /></button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${w.status === 'valide' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {w.status === 'valide' ? 'Transféré' : 'Rejeté'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeTab === 'stores' ? stores.length : withdrawals.length) === 0 && (
            <div className="py-20 text-center italic text-gray-300 text-[10px] font-bold uppercase tracking-widest">Aucune donnée enregistrée</div>
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
      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
    >
      {label}
    </button>
  );
}