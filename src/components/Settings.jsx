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
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
      // On récupère les infos étendues si elles existent
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
    
    if (!error) alert("Paramètres synchronisés");
    setUpdating(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gray-400 font-light">Accès au centre de contrôle...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 antialiased">
      
      {/* --- HEADER --- */}
      <header className="mb-16 border-b border-gray-100 pb-10 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[#0866FF] uppercase tracking-[0.4em] ml-1">Configuration</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Compte <span className="text-gray-300">&</span> Sécurité</h1>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </header>

      <div className="space-y-20">
        
        {/* --- SECTION 1 : PROFIL PERSONNEL --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em]">Identité</h2>
            <p className="text-[11px] text-gray-400 leading-relaxed font-light">Vos informations personnelles pour la gestion interne de Festisolde.</p>
          </div>
          
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-6">
              <InputGroup 
                label="Nom complet" 
                value={profile.full_name} 
                onChange={(v) => setProfile({...profile, full_name: v})} 
                placeholder="Ex: Jean Dupont"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup 
                  label="Email (Lecture seule)" 
                  value={user?.email} 
                  disabled 
                />
                <InputGroup 
                  label="WhatsApp Business" 
                  value={profile.whatsapp_number} 
                  onChange={(v) => setProfile({...profile, whatsapp_number: v})} 
                  placeholder="+237 ..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2 : PAIEMENTS & REVENUS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em]">Paiements</h2>
            <p className="text-[11px] text-gray-400 leading-relaxed font-light">Définissez comment vous souhaitez recevoir vos commissions de vente.</p>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between group cursor-pointer border-b border-gray-200/50 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm"><Smartphone size={18}/></div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-800">Orange Money / Moov</p>
                    <p className="text-[10px] text-gray-400">Transaction instantanée</p>
                  </div>
                </div>
                <div className="w-4 h-4 border-2 border-[#0866FF] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#0866FF] rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between group cursor-pointer opacity-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><ShieldCheck size={18}/></div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-800">Virement Bancaire</p>
                    <p className="text-[10px] text-gray-400 italic font-light tracking-tight">Prochainement disponible</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3 : SÉCURITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em]">Sécurité</h2>
            <p className="text-[11px] text-gray-400 leading-relaxed font-light">Protégez votre accès vendeur et vos données sensibles.</p>
          </div>
          
          <div className="md:col-span-2">
            <button className="text-[11px] font-bold text-gray-900 border border-gray-900 px-6 py-3 rounded-full hover:bg-gray-900 hover:text-white transition-all tracking-[0.2em] uppercase">
              Réinitialiser le mot de passe
            </button>
          </div>
        </section>

      </div>

      {/* --- FLOAT SAVE BUTTON --- */}
      <footer className="mt-24 pt-10 border-t border-gray-100 flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-full text-[11px] font-bold tracking-[0.3em] shadow-2xl hover:bg-[#0866FF] transition-all disabled:opacity-50"
        >
          {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {updating ? "SYNCHRONISATION..." : "SAUVEGARDER TOUT"}
        </button>
      </footer>
    </div>
  );
}

// Composant Interne pour les champs fins
function InputGroup({ label, value, onChange, placeholder, disabled = false }) {
  return (
    <div className="space-y-2 border-l-2 border-gray-100 pl-4 focus-within:border-[#0866FF] transition-all">
      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</label>
      <input 
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full text-sm font-light outline-none bg-transparent ${disabled ? 'text-gray-300 italic' : 'text-gray-900'}`}
      />
    </div>
  );
}