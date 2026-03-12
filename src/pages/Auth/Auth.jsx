import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Store, BarChart3, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      });
      if (error) throw error;
      if (data?.user) {
        const adminUid = import.meta.env.VITE_ADMIN_UID?.trim();
        navigate(adminUid && data.user.id === adminUid ? '/admin' : '/dashboard');
      }
    } catch (error) {
      alert("Accès refusé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans antialiased overflow-hidden">
      
      {/* --- SECTION HAUTE : Ajustée (Moins de vide) --- */}
      <div className="h-[35%] flex flex-col justify-end px-8 pb-12 relative">
        <div className="absolute top-8 right-8 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Store size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Studio Pro</span>
          </div>
          
          <h1 className="text-3xl font-light tracking-tighter leading-tight text-slate-900">
            Prenez le contrôle <br />
            <span className="font-serif italic text-orange-500">de votre boutique.</span>
          </h1>
        </div>
      </div>

      {/* --- SECTION BASSE : Le Terminal (Ajusté & Compact) --- */}
      <div className="flex-1 bg-[#F97316] relative rounded-t-[3.5rem] shadow-[0_-15px_40px_rgba(249,115,22,0.2)] px-8 pt-12 flex flex-col">
        
        {/* Logo Badge (Plus petit et mieux centré sur la bordure) */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 md:left-16 md:translate-x-0">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#F97316]">
                <span className="text-white text-2xl font-black italic">F</span>
            </div>
        </div>

        <div className="mb-8 text-center md:text-left">
          <h2 className="text-black text-2xl font-black uppercase tracking-tighter italic">Connexion</h2>
          <div className="h-1 w-8 bg-black/20 mx-auto md:mx-0 mt-1"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 flex-1">
          <div className="space-y-2">
            <input 
              type="email" 
              placeholder="Email"
              className="w-full bg-black/5 border border-black/5 rounded-2xl py-4 px-6 text-black placeholder:text-black/30 font-bold focus:bg-white outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Mot de passe"
              className="w-full bg-black/5 border border-black/5 rounded-2xl py-4 px-6 text-black placeholder:text-black/30 font-bold focus:bg-white outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 mt-4 hover:bg-slate-900 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Lancer le Dashboard"}
            {!loading && <ArrowRight size={16} />}
          </button>

          <Link 
            to="/register"
            className="w-full py-4 text-center text-black/40 text-[9px] font-black uppercase tracking-[0.3em] block"
          >
            Créer un compte partenaire
          </Link>
        </form>

        {/* Footer ajusté en bas de l'écran */}
        <div className="pb-8 pt-4 flex flex-col items-center gap-2 border-t border-black/5">
            <div className="flex items-center gap-1.5 opacity-20 text-black">
                <ShieldCheck size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Secured Terminal 2.0</span>
            </div>
        </div>
      </div>
    </div>
  );
}