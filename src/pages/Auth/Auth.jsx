import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Store } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 font-sans antialiased text-slate-900">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Header section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-100 mb-6">
            <Store size={24} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
            Studio Pro
          </h1>
          <p className="text-slate-500 font-medium">Heureux de vous revoir.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email</label>
              <input 
                type="email" 
                placeholder="nom@exemple.com"
                className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-950 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 mt-6 hover:bg-orange-600 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Se connecter"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link 
            to="/register"
            className="text-sm font-medium text-slate-400 hover:text-orange-500 transition-colors"
          >
            Pas encore de compte ? <span className="text-slate-900 underline decoration-orange-500/30 underline-offset-4">Créer un profil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}