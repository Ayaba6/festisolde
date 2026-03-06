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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 antialiased py-6">
      
      {/* --- BACK LINK - Ultra compact --- */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all z-50"
      >
        <ArrowLeft size={14} strokeWidth={3} /> <span className="hidden sm:inline">Retour</span>
      </Link>

      <div className="w-full max-w-[340px] space-y-6 md:space-y-8">
        
        {/* --- HEADER - Marges réduites --- */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black italic text-xl shadow-xl rounded-xl transform -rotate-2">
              F
            </div>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-black italic leading-none">
            ESPACE <span className="text-orange-600">PRO</span>
          </h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Terminal de gestion
          </p>
        </div>

        {/* --- FORMULAIRE - Texte Noir & Marges Serrées --- */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            
            {/* EMAIL */}
            <div className="group relative border-b-2 border-gray-100 focus-within:border-orange-600 transition-all">
              <label className="text-[9px] font-black text-black uppercase tracking-widest block mb-0.5">
                Identifiant Email
              </label>
              <div className="flex items-center">
                <Mail className="text-black group-focus-within:text-orange-600 transition-colors" size={14} strokeWidth={2.5} />
                <input 
                  type="email" 
                  placeholder="NOM@EMAIL.COM" 
                  className="w-full pl-3 py-3 text-[11px] font-black uppercase tracking-widest outline-none bg-transparent placeholder:text-gray-200 text-black"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="group relative border-b-2 border-gray-100 focus-within:border-orange-600 transition-all">
              <label className="text-[9px] font-black text-black uppercase tracking-widest block mb-0.5">
                Mot de passe
              </label>
              <div className="flex items-center">
                <Lock className="text-black group-focus-within:text-orange-600 transition-colors" size={14} strokeWidth={2.5} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full pl-3 pr-10 py-3 text-[11px] font-black uppercase tracking-widest outline-none bg-transparent placeholder:text-gray-200 text-black"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-gray-300 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-600 active:scale-95 transition-all duration-300 shadow-lg shadow-orange-50 disabled:bg-gray-100 italic"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Lancer la session"}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-50"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-gray-200 bg-white px-2">Ou</div>
            </div>

            <Link 
              to="/register" 
              className="w-full border-2 border-black py-3.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black hover:text-white active:scale-95 transition-all duration-300 italic"
            >
              Devenir Partenaire
            </Link>
          </div>
        </form>

        {/* --- FOOTER --- */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-black px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
            <ShieldCheck size={12} className="text-orange-600" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">SSL Secured Terminal</span>
          </div>
          <p className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.2em] text-center italic">
            Festisolde &copy; 2026 — v2.0
          </p>
        </div>
      </div>
    </div>
  );
}