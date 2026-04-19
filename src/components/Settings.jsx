import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Smartphone, 
  Save, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft,
  Info
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
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

      setMessage("Réglages mis à jour");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 antialiased pb-40">
      
      {/* HEADER AVEC RETOUR */}
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Informations de contact & boutique</p>
          </div>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={14} strokeWidth={3} /> {message.toUpperCase()}
          </div>
        )}
      </header>

      {/* SECTION PRINCIPALE */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* NOM DE LA BOUTIQUE */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Store size={14} className="text-slate-900" /> Nom de l'enseigne
              </label>
              <input 
                type="text"
                value={storeData.name}
                onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                placeholder="Ex: Ma Boutique Studio"
                className="w-full bg-slate-50 border border-transparent p-5 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-200 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* NUMÉRO WHATSAPP */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Smartphone size={14} className="text-slate-900" /> WhatsApp (Ventes)
              </label>
              <input 
                type="tel"
                inputMode="tel"
                value={storeData.whatsapp_number}
                onChange={(e) => setStoreData({...storeData, whatsapp_number: e.target.value})}
                placeholder="Ex: 22670000000"
                className="w-full bg-slate-50 border border-transparent p-5 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-200 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          {/* CONSEIL PRATIQUE */}
          <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
               <Info size={20} />
            </div>
            <p className="text-[11px] font-medium text-orange-900 leading-relaxed">
              <span className="font-bold uppercase block mb-1 tracking-tight">Format Recommandé</span>
              Utilisez le format international sans le "+" (ex: <span className="underline decoration-orange-300">22670112233</span>). 
              Cela permet une ouverture automatique de la discussion dès qu'un client clique sur "Acheter".
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
          
          <button 
            onClick={handleUpdate}
            disabled={updating}
            className="w-full md:w-auto bg-slate-950 text-white px-10 py-5 rounded-2xl text-[11px] font-bold tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300"
          >
            {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {updating ? "ENREGISTREMENT..." : "SAUVEGARDER LES RÉGLAGES"}
          </button>
        </div>
      </div>

    </div>
  );
}