import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store, Smartphone, Save, Loader2, LogOut, CheckCircle2, Wallet } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [storeData, setStoreData] = useState({
    name: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // On récupère les infos directement dans la table 'stores'
      const { data, error } = await supabase
        .from('stores')
        .select('name, whatsapp_number')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setStoreData({
          name: data.name || '',
          whatsapp_number: data.whatsapp_number || ''
        });
      }
    }
    setLoading(false);
  }

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Mise à jour de la table STORES directement
      const { error } = await supabase
        .from('stores')
        .update({ 
          name: storeData.name,
          whatsapp_number: storeData.whatsapp_number 
        })
        .eq('owner_id', user.id);

      if (error) throw error;

      setMessage("Boutique mise à jour !");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      alert("Erreur : Vérifiez que la colonne whatsapp_number existe dans la table stores.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 antialiased text-black font-sans">
      <header className="mb-8 flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-2xl font-black uppercase italic italic tracking-tighter">
          Réglages <span className="text-orange-600">Boutique</span>
        </h1>
        {message && <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 border border-green-200">{message}</span>}
      </header>

      <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* NOM DE LA BOUTIQUE */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Store size={14} /> Nom de l'enseigne
            </label>
            <input 
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({...storeData, name: e.target.value})}
              placeholder="Ex: Ma Boutique Studio"
              className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-black text-sm outline-none focus:border-black focus:bg-white transition-all"
            />
          </div>

          {/* NUMÉRO WHATSAPP */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Smartphone size={14} /> Numéro WhatsApp (Ventes)
            </label>
            <input 
              type="text"
              value={storeData.whatsapp_number}
              onChange={(e) => setStoreData({...storeData, whatsapp_number: e.target.value})}
              placeholder="Ex: 22670000000"
              className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-black text-sm outline-none focus:border-black focus:bg-white transition-all"
            />
          </div>

        </div>

        <div className="pt-6 border-t border-gray-100">
           <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
             Note : Ce numéro sera utilisé pour générer les liens de commande directe vers votre WhatsApp. Assurez-vous d'inclure l'indicatif (ex: 226).
           </p>
        </div>
      </div>

      <footer className="mt-10 flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-2xl text-[11px] font-black tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-orange-600"
        >
          {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {updating ? "ENREGISTREMENT..." : "SAUVEGARDER LES MODIFS"}
        </button>
      </footer>
    </div>
  );
}