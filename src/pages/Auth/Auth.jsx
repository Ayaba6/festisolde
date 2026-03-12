import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Store, BarChart3, Fingerprint } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Orange Vibrant & Élégant
  const brandOrange = "#F97316"; 

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
      alert("Accès refusé. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans antialiased text-slate-900">
      
      {/* --- SECTION HAUTE : Valeurs & Élégance (Fond clair) --- */}
      <div className="flex-[1.1] flex flex-col justify-center px-10 relative overflow-hidden">
        {/* Grain de texture léger ou halo pour le luxe */}
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40"></div>
        
        <div className="relative z-10 max-w-sm space-y-12">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              Studio v2.0
            </span>
            <h1 className="text-4xl font-light tracking-tight leading-[1.1] text-slate-900">
              Transformez votre passion en un <span className="font-serif italic text-orange-600">empire</span>.
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                <Store size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Gestion Intuitive</h4>
                <p className="text-xs text-slate-400 font-medium">Contrôlez vos stocks avec précision.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 hover:text-orange-600 transition-colors">
                <BarChart3 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-400">Performances</h4>
                <p className="text-xs text-slate-300 font-medium">Suivez vos revenus en temps réel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION BASSE : Le Terminal (Orange Vibrant) --- */}
      <div className="relative bg-[#F97316] pt-16 pb-8 px-8 rounded-t-[4rem] shadow-[0_-20px_60px_rgba(249,115,22,0.25)]">
        
        {/* Logo Badge Flottant */}
        <div className="absolute -top-10 left-12">
            <div className="w-20 h-20 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl border-[6px] border-[#F97316] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-white text-3xl font-black italic">F</span>
            </div>
        </div>

        <div className="mb-10 pl-2">
          <h2 className="text-black text-3xl font-black tracking-tighter uppercase italic leading-none mb-1">
            Connexion
          </h2>
          <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.3em]">
            Accès sécurisé réservé aux partenaires
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-2">
            <input 
              type="email" 
              placeholder="Email professionnel"
              className="w-full bg-white/10 border border-black/5 rounded-3xl py-5 px-7 text-black placeholder:text-black/30 font-bold focus:bg-white focus:shadow-inner outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Clé de sécurité"
              className="w-full bg-white/10 border border-black/5 rounded-3xl py-5 px-7 text-black placeholder:text-black/30 font-bold focus:bg-white focus:shadow-inner outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-3xl py-5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Ouvrir la session"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <Link 
              to="/register"
              className="w-full py-4 text-center text-black/40 text-[9px] font-black uppercase tracking-[0.4em] hover:text-black transition-colors"
            >
              Demander un accès boutique
            </Link>
          </div>
        </form>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-black/5 pt-6">
            <div className="flex items-center gap-2 opacity-30">
                <Fingerprint size={14} className="text-black" />
                <span className="text-[8px] font-black text-black uppercase tracking-widest">Biometric Encrypted Terminal</span>
            </div>
            <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest">FestiSolde Studio &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}