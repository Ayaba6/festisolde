import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, 
  Lock, 
  Smartphone, 
  Bell, 
  ShieldCheck, 
  Save, 
  Loader2, 
  LogOut,
  ChevronRight,
  CheckCircle2,
  Wallet
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    whatsapp_number: '',
    payout_method: 'Orange Money'
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    setLoading(false);
  }

  const handleUpdate = async () => {
    setUpdating(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date()
    });
    
    if (!error) {
      setMessage("Profil synchronisé");
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 font-light">Accès au centre de contrôle...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 antialiased text-gray-900">
      
      {/* --- HEADER --- */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] ml-1">Configuration</p>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">
            COMPTE <span className="text-gray-300 italic-none">&</span> SÉCURITÉ
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {message && (
            <div className="flex items-center gap-2 text-[#25D366] text-[9px] font-black uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100">
              <CheckCircle2 size={12} /> {message}
            </div>
          )}
          <button 
            onClick={() => supabase.auth.signOut()}
            className="group flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-all"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Déconnexion
          </button>
        </div>
      </header>

      <div className="space-y-24">
        
        {/* --- SECTION 1 : IDENTITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <User size={14} className="text-orange-600"/> Identité
            </h2>
            <p className="text-[11px] text-gray-400 leading-relaxed font-bold uppercase tracking-tighter italic">
              Informations privées pour la gestion de vos revenus.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-10">
            <div className="grid grid-cols-1 gap-10">
              <InputGroup 
                label="Nom complet ou Raison Sociale" 
                value={profile.full_name} 
                onChange={(v) => setProfile({...profile, full_name: v})} 
                placeholder="Ex: Boutique Horizon"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputGroup 
                  label="Email de gestion" 
                  value={user?.email} 
                  disabled 
                />
                <InputGroup 
                  label="WhatsApp Finance" 
                  value={profile.whatsapp_number} 
                  onChange={(v) => setProfile({...profile, whatsapp_number: v})} 
                  placeholder="+226 ..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2 : PAIEMENTS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Wallet size={14} className="text-orange-600"/> Retraits
            </h2>
            <p className="text-[11px] text-gray-400 leading-relaxed font-bold uppercase tracking-tighter italic">
              Comment souhaitez-vous encaisser vos ventes ?
            </p>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
              {/* Option Active */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-orange-500 shadow-sm shadow-orange-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <Smartphone size={20} strokeWidth={2.5}/>
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-gray-900 uppercase">Mobile Money</p>
                    <p className="text-[10px] font-bold text-orange-600 italic">Orange / Moov / Wave</p>
                  </div>
                </div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Option Grisée */}
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border-2 border-transparent opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                    <ShieldCheck size={20}/>
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-gray-900 uppercase">Virement Bancaire</p>
                    <p className="text-[10px] font-bold text-gray-400 italic">Bientôt disponible</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3 : SÉCURITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock size={14} className="text-orange-600"/> Sécurité
            </h2>
            <p className="text-[11px] text-gray-400 leading-relaxed font-bold uppercase tracking-tighter italic">
              Gestion des accès et protection des données.
            </p>
          </div>
          
          <div className="md:col-span-2">
            <button className="text-[10px] font-black text-gray-900 border-2 border-gray-900 px-8 py-4 rounded-2xl hover:bg-black hover:text-white transition-all tracking-[0.2em] uppercase italic">
              Réinitialiser le mot de passe
            </button>
          </div>
        </section>

      </div>

      {/* --- BOTTON SAVE --- */}
      <footer className="mt-32 pt-10 border-t border-gray-100 flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="flex items-center gap-4 bg-black text-white px-12 py-5 rounded-[2rem] text-[11px] font-black tracking-[0.3em] shadow-2xl hover:bg-orange-600 transition-all disabled:opacity-50 uppercase italic"
        >
          {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {updating ? "SYNCHRONISATION..." : "ENREGISTRER LES PARAMÈTRES"}
        </button>
      </footer>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, disabled = false }) {
  return (
    <div className="space-y-3 group">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className={`border-b-2 transition-all duration-500 ${disabled ? 'border-gray-100' : 'border-gray-200 group-focus-within:border-orange-500'}`}>
        <input 
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-3 text-sm font-bold outline-none bg-transparent ${disabled ? 'text-gray-300 italic' : 'text-gray-900'}`}
        />
      </div>
    </div>
  );
}