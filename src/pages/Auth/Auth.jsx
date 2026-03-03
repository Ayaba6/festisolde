import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        const currentUserId = data.user.id.trim();
        const adminUid = import.meta.env.VITE_ADMIN_UID?.trim();

        // Redirection intelligente
        if (adminUid && currentUserId === adminUid) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Erreur:", error.message);
      alert("Identifiants incorrects ou compte inexistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 antialiased">
      
      {/* --- BACK LINK --- */}
      <Link 
        to="/" 
        className="absolute top-10 left-6 md:left-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 hover:text-black transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour
      </Link>

      <div className="w-full max-w-[400px] space-y-12">
        
        {/* --- LOGO & HEADER --- */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-black italic text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-xl">
              F
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-gray-900 italic">
              ESPACE <span className="text-orange-600 italic-none">PRO</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
              Connectez-vous à votre terminal de vente
            </p>
          </div>
        </div>

        {/* --- FORMULAIRE --- */}
        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="space-y-1">
            
            {/* EMAIL */}
            <div className="group relative border-b-2 border-gray-100 focus-within:border-orange-600 transition-all duration-500">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600" size={16} />
              <input 
                type="email" 
                placeholder="ADRESSE EMAIL" 
                className="w-full pl-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] outline-none bg-transparent placeholder:text-gray-200"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="group relative border-b-2 border-gray-100 focus-within:border-orange-600 transition-all duration-500">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="MOT DE PASSE" 
                className="w-full pl-8 pr-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] outline-none bg-transparent placeholder:text-gray-200"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-orange-100 disabled:bg-gray-100 disabled:text-gray-400 italic"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Lancer la session"}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-50"></div></div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest text-gray-300 bg-white px-4">Ou</div>
            </div>

            <Link 
              to="/register" 
              className="w-full border-2 border-gray-900 py-5 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all duration-300 italic"
            >
              Devenir Partenaire
            </Link>
          </div>
        </form>

        {/* --- FOOTER --- */}
        <div className="pt-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-gray-200">
            <ShieldCheck size={16} strokeWidth={2} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Accès Crypté & Sécurisé</span>
          </div>
          <p className="text-[10px] text-gray-300 font-medium italic">
            Festisolde &copy; 2026 — Terminal Vendeur v2.0
          </p>
        </div>
      </div>
    </div>
  );
}