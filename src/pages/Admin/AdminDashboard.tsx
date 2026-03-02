import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, ExternalLink, ShieldCheck, Store, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    setLoading(true);
    
    // 1. Récupérer l'utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    const adminIdFromEnv = import.meta.env.VITE_ADMIN_UID?.trim();
    const currentUserId = user?.id?.trim();

    // Debugging (Regarde ta console F12 si ça bloque)
    console.log("DEBUG AUTH:", { connecté: currentUserId, attendu: adminIdFromEnv });

    if (!user || currentUserId !== adminIdFromEnv) {
      setUserStatus("unauthorized");
      setTimeout(() => { window.location.href = "/"; }, 3000); // Redirige après 3s
      return;
    }

    // 2. Si Admin, charger les boutiques
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setStores(data || []);
    setLoading(false);
  }

  const deleteStore = async (id, name) => {
    if (confirm(`Supprimer définitivement la boutique "${name}" ?`)) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) setStores(stores.filter(s => s.id !== id));
    }
  };

  // --- ÉCRANS D'ÉTAT (STYLÉS) ---
  if (userStatus === "unauthorized") return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full">
        <ShieldCheck size={24} />
      </div>
      <h1 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-900">Accès Refusé</h1>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
        Identifiant admin non reconnu.<br/>Redirection vers l'accueil...
      </p>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-gray-200" size={20} strokeWidth={1.5} />
      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 italic">Vérification Super-Admin</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* Header Minimaliste */}
      <header className="bg-white border-b border-gray-100 mb-12">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <ShieldCheck className="text-white" size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-[12px] font-bold uppercase tracking-[0.3em] text-gray-900 leading-none">Administration</h1>
              <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-1">Superuser Control Panel</p>
            </div>
          </div>
          <div className="text-[9px] font-bold text-green-500 uppercase tracking-widest border border-green-100 px-4 py-2 rounded-full">
            ● Session Active
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <div className="bg-white border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Boutique</th>
                <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Slug</th>
                <th className="p-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Création</th>
                <th className="p-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stores.map(store => (
                <tr key={store.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                        <Store size={14} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-800">{store.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-medium text-gray-400 font-mono tracking-tighter">/{store.slug}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      {new Date(store.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-6">
                      <button 
                        onClick={() => window.open(`/store/${store.slug}`, '_blank')}
                        className="text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                      >
                        <ExternalLink size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Voir</span>
                      </button>
                      <button 
                        onClick={() => deleteStore(store.id, store.name)}
                        className="text-gray-300 hover:text-red-600 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {stores.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 italic">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}