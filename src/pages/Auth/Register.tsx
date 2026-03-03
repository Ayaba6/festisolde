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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 antialiased">
      
      {/* Bouton Retour */}
      <Link to="/auth" className="absolute top-10 left-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">
        <ArrowLeft size={14} /> Retour
      </Link>

      <div className="w-full max-w-[380px] space-y-12">
        
        {/* Header de la page */}
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store size={22} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-light uppercase tracking-[0.4em] text-gray-900">
            Nouveau <span className="font-medium">Vendeur</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
            Lancez votre boutique digitale aujourd'hui
          </p>
        </div>

        {/* Formulaire Register */}
        <form className="space-y-8" onSubmit={handleRegister}>
          <div className="space-y-6">
            
            <div className="group relative">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Nom de l'enseigne</label>
              <input 
                type="text" 
                placeholder="EX: MAISON VINTAGE" 
                className="w-full border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[0.2em] outline-none focus:border-orange-600 transition-colors bg-transparent placeholder:text-gray-200"
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                required
              />
            </div>

            <div className="group relative">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Email professionnel</label>
              <input 
                type="email" 
                placeholder="PRO@EMAIL.COM" 
                className="w-full border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[0.2em] outline-none focus:border-orange-600 transition-colors bg-transparent placeholder:text-gray-200"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="group relative">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Sécurité (8 caractères)</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[0.2em] outline-none focus:border-orange-600 transition-colors bg-transparent placeholder:text-gray-200"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all duration-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Créer ma boutique"}
            </button>
          </div>
        </form>

        {/* Footer info & Connexion */}
        <div className="text-center space-y-8">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
            En cliquant sur créer, vous acceptez nos <br/>
            <span className="text-gray-900 border-b border-gray-900 cursor-pointer">Conditions Partenaires</span>
          </p>

          <div className="pt-4 border-t border-gray-50">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Déjà partenaire ?{' '}
              <Link to="/auth" className="text-orange-600 font-black hover:underline ml-2 transition-all">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}