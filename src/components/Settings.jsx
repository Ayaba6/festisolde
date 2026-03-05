import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store, Smartphone, Save, Loader2, CheckCircle2 } from 'lucide-react';

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
      const { data } = await supabase
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
      alert("Erreur de mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 antialiased text-black font-sans pb-40">
      
      {/* --- HEADER --- */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            Réglages <span className="text-orange-600">Boutique</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gérez vos informations de contact</p>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-600 bg-green-50 px-4 py-2 border-2 border-green-200 rounded-xl animate-bounce">
            <CheckCircle2 size={14} /> {message}
          </div>
        )}
      </header>

      {/* --- FORMULAIRE --- */}
      <div className="bg-white border-2 border-black p-6 md:p-10 rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          
          {/* NOM DE LA BOUTIQUE */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
              <Store size={14} /> Nom de l'enseigne
            </label>
            <input 
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({...storeData, name: e.target.value})}
              placeholder="Ex: Ma Boutique Studio"
              className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-2xl font-bold text-base md:text-sm outline-none focus:border-black focus:bg-white transition-all shadow-sm"
            />
          </div>

          {/* NUMÉRO WHATSAPP */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
              <Smartphone size={14} /> Numéro WhatsApp (Ventes)
            </label>
            <input 
              type="tel"
              inputMode="tel"
              value={storeData.whatsapp_number}
              onChange={(e) => setStoreData({...storeData, whatsapp_number: e.target.value})}
              placeholder="Ex: 22670000000"
              className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-2xl font-bold text-base md:text-sm outline-none focus:border-black focus:bg-white transition-all shadow-sm"
            />
          </div>

        </div>

        <div className="pt-6 border-t-2 border-dashed border-gray-100">
           <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
             <p className="text-[10px] font-bold text-orange-800 uppercase leading-relaxed italic">
               💡 Conseil : Indiquez votre numéro avec l'indicatif pays (ex: 226...) sans le "+" pour que les clients tombent directement sur votre discussion WhatsApp.
             </p>
           </div>
        </div>
      </div>

      {/* --- BOUTON DE SAUVEGARDE --- */}
      <footer className="mt-8">
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="w-full md:w-auto md:ml-auto bg-black text-white px-8 py-5 rounded-2xl text-[11px] font-black tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-orange-600 shadow-xl"
        >
          {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {updating ? "ENREGISTREMENT..." : "SAUVEGARDER LES RÉGLAGES"}
        </button>
      </footer>

    </div>
  );
}