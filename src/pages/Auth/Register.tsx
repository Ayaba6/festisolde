import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Store } from 'lucide-react';

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

        alert('Compte créé avec succès ! Vérifiez vos e-mails pour confirmer.');
        navigate('/auth');
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 antialiased py-8">
      
      {/* Bouton Retour - Ajusté pour mobile */}
      <Link to="/auth" className="fixed top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors z-50">
        <ArrowLeft size={14} strokeWidth={3} /> <span className="hidden sm:inline">Retour</span>
      </Link>

      <div className="w-full max-w-[360px] space-y-8 md:space-y-10">
        
        {/* Header - Plus compact */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Store size={22} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900 italic">
            Nouveau <span className="text-orange-600">Vendeur</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] leading-tight">
            Lancez votre boutique aujourd'hui
          </p>
        </div>

        {/* Formulaire - Marges réduites */}
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="space-y-5">
            
            <div className="group relative">
              <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 block group-focus-within:text-orange-600 transition-colors">
                Nom de la boutique
              </label>
              <input 
                type="text" 
                placeholder="EX: MAISON VINTAGE" 
                className="w-full border-b-2 border-gray-100 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-orange-600 transition-all bg-transparent placeholder:text-gray-200 text-gray-900"
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                required
              />
            </div>

            <div className="group relative">
              <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 block group-focus-within:text-orange-600 transition-colors">
                Email 
              </label>
              <input 
                type="email" 
                placeholder="PRO@EMAIL.COM" 
                className="w-full border-b-2 border-gray-100 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-orange-600 transition-all bg-transparent placeholder:text-gray-200 text-gray-900"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="group relative">
              <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 block group-focus-within:text-orange-600 transition-colors">
                Mot de passe (8+ car.)
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full border-b-2 border-gray-100 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-orange-600 transition-all bg-transparent placeholder:text-gray-200 text-gray-900"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 md:py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-600 active:scale-95 transition-all duration-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Créer ma boutique"}
            </button>
          </div>
        </form>

        {/* Footer info & Connexion */}
        <div className="text-center space-y-6">
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            En cliquant sur créer, vous acceptez nos <br/>
            <span className="text-black border-b border-black cursor-pointer">Conditions Partenaires</span>
          </p>

          <div className="pt-4 border-t border-gray-50">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Déjà partenaire ?{' '}
              <Link to="/auth" className="text-orange-600 font-black hover:underline block mt-1 sm:inline sm:mt-0 transition-all">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}