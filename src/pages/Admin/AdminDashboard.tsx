import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sécurité renforcée : on nettoie les IDs pour éviter les erreurs d'espaces
  const isAdmin = (user) => {
    const currentUserId = user?.id?.trim();
    const adminIdFromEnv = import.meta.env.VITE_ADMIN_UID?.trim();
    
    // Debug : Ces logs s'afficheront dans ta console (F12)
    console.log("ID Connecté:", currentUserId);
    console.log("ID Attendu (Admin):", adminIdFromEnv);

    return currentUserId === adminIdFromEnv;
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  async function fetchGlobalData() {
    // On récupère la session actuelle
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !isAdmin(user)) {
      console.error("Accès refusé : L'ID ne correspond pas.");
      alert("Accès refusé ! Vous n'êtes pas l'administrateur.");
      window.location.href = "/"; // Redirection vers l'accueil
      return;
    }

    // Si c'est l'admin, on charge toutes les boutiques
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur de chargement des boutiques:", error.message);
    } else {
      setStores(data || []);
    }
    
    setLoading(false);
  }

  // Fonction pour supprimer une boutique (Super Admin power ⚡)
  const deleteStore = async (id, name) => {
    if (confirm(`Voulez-vous vraiment supprimer définitivement la boutique "${name}" ?`)) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) {
        alert("Erreur lors de la suppression");
      } else {
        setStores(stores.filter(s => s.id !== id));
        alert("Boutique supprimée");
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen font-bold text-gray-500 italic">
      Vérification des droits d'accès... 👑
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600">Panneau Super Admin 👑</h1>
          <p className="text-gray-500 italic text-sm">Contrôle total de la plateforme Festisolde</p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200 text-sm">
          Session Admin Active
        </div>
      </div>
      
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Boutique</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Lien (Slug)</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Date de création</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.map(store => (
              <tr key={store.id} className="hover:bg-red-50/30 transition">
                <td className="p-4 font-bold text-gray-800">{store.name}</td>
                <td className="p-4">
                   <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">/{store.slug}</span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(store.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button 
                    onClick={() => window.open(`/store/${store.slug}`, '_blank')}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm font-medium"
                  >
                    Voir
                  </button>
                  <button 
                    onClick={() => deleteStore(store.id, store.name)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-medium transition"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stores.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            Aucune boutique n'a encore été créée sur Festisolde.
          </div>
        )}
      </div>
    </div>
  );
}