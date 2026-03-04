import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, Lock, Smartphone, ShieldCheck, Save, Loader2, LogOut, ChevronRight, CheckCircle2, Wallet 
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
      setMessage("Profil à jour");
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 antialiased text-black font-sans">
      
      {/* HEADER COMPACT */}
      <header className="mb-8 flex justify-between items-center border-b-4 border-black pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
            Settings <span className="text-gray-400">Hub</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {message && (
            <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 border border-green-200">
              {message}
            </span>
          )}
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-[9px] font-black text-gray-400 hover:text-black uppercase tracking-widest flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={12} strokeWidth={3} /> Logout
          </button>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* SECTION IDENTITÉ - GRID SERRÉE */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="md:col-span-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-2">
              <User size={12} /> Profil
            </h2>
          </div>
          <div className="md:col-span-3 bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                label="Nom Commercial" 
                value={profile.full_name} 
                onChange={(v) => setProfile({...profile, full_name: v})} 
                placeholder="Nom du store"
              />
              <InputGroup 
                label="WhatsApp Finance" 
                value={profile.whatsapp_number} 
                onChange={(v) => setProfile({...profile, whatsapp_number: v})} 
                placeholder="+226..."
              />
              <div className="md:col-span-2 opacity-50">
                <InputGroup label="Email (Lecture seule)" value={user?.email} disabled />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION RETRAITS - CARTES COMPACTES */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="md:col-span-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-2">
              <Wallet size={12} /> Paiements
            </h2>
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border-2 border-black p-4 rounded-xl flex items-center gap-4 bg-white relative overflow-hidden">
                <div className="bg-black text-white p-1 rounded-full absolute -top-1 -right-1 scale-75">
                  <CheckCircle2 size={16} />
                </div>
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                  <Smartphone size={20} strokeWidth={3}/>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase">Mobile Money</p>
                  <p className="text-[9px] font-bold text-orange-600 italic">Orange/Moov/Wave</p>
                </div>
            </div>
            <div className="border border-gray-200 p-4 rounded-xl flex items-center gap-4 bg-gray-50 opacity-40 grayscale">
                <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={20}/>
                </div>
                <p className="text-[11px] font-black uppercase">Virement Bancaire</p>
            </div>
          </div>
        </section>

        {/* SECTION SÉCURITÉ - SIMPLE LIGNE */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-t border-gray-100 pt-6">
          <div className="md:col-span-1 italic">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-red-500">Sécurité</h2>
          </div>
          <div className="md:col-span-3">
            <button className="text-[9px] font-black text-black border border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-all uppercase tracking-widest">
              Réinitialiser Pass
            </button>
          </div>
        </section>

      </div>

      {/* FOOTER FIXÉ OU SERRÉ */}
      <footer className="mt-12 flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="w-full md:w-auto bg-black text-white px-10 py-4 rounded-xl text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} strokeWidth={3} />}
          {updating ? "SYNC..." : "VALIDER LES MODIFS"}
        </button>
      </footer>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, disabled = false }) {
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border-b-2 border-gray-100 py-1 text-xs font-black outline-none transition-colors focus:border-black ${disabled ? 'text-gray-300' : 'text-black'}`}
      />
    </div>
  );
}