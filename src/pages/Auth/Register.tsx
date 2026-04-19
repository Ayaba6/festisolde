import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Store, Sparkles } from 'lucide-react';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const slug = storeName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const { error: storeError } = await supabase
          .from('stores')
          .insert([
            { 
              name: storeName, 
              owner_id: authData.user.id,
              slug: slug 
            }
          ]);

        if (storeError) throw storeError;

        alert('Compte créé ! Vérifiez vos e-mails pour confirmer.');
        navigate('/auth');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 font-sans antialiased text-slate-900">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-[100px]"></div>
      </div>

      {/* Back Button */}
      <Link 
        to="/auth" 
        className="fixed top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors z-20"
      >
        <ArrowLeft size={18} />
        <span>Retour</span>
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl mb-6">
            <Sparkles size={22} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
            Créer votre studio
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Rejoignez l'aventure en quelques secondes.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Nom de la boutique</label>
              <input 
                type="text" 
                placeholder="Ex: Maison Minimaliste"
                className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email professionnel</label>
              <input 
                type="email" 
                placeholder="hello@votre-store.com"
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
                minLength={8}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 mt-6 hover:bg-orange-600 transition-all active:scale-[0.98] shadow-lg shadow-orange-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Lancer ma boutique"}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 mb-4 px-8 leading-relaxed">
            En créant un compte, vous acceptez nos <span className="text-slate-900 font-medium">Conditions d'Utilisation</span>.
          </p>
          <Link 
            to="/auth"
            className="text-sm font-medium text-slate-900 underline decoration-orange-500/30 underline-offset-4"
          >
            Déjà partenaire ? Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}