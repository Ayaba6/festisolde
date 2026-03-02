import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Tentative de connexion
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      });

      if (error) throw error;

      if (data?.user) {
        // 2. Récupération et nettoyage des IDs pour la redirection
        const currentUserId = data.user.id.trim();
        const adminUid = import.meta.env.VITE_ADMIN_UID?.trim();

        console.log("Connexion réussie. ID:", currentUserId);

        // 3. Redirection conditionnelle
        if (adminUid && currentUserId === adminUid) {
          console.log("Direction : Espace Admin");
          navigate('/admin');
        } else {
          console.log("Direction : Espace Vendeur");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Erreur de connexion:", error.message);
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 antialiased font-sans">
      
      {/* Retour à l'accueil du site public */}
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-orange-600 transition-all">
        <ArrowLeft size={14} /> Accueil Festisolde
      </Link>

      <div className="w-full max-w-[380px] space-y-12">
        
        {/* En-tête du formulaire */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
             <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black italic text-xl shadow-lg">F</div>
          </div>
          <h1 className="text-xl font-light uppercase tracking-[0.4em] text-gray-900">
            Espace <span className="font-medium">Pro</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
            Gérez votre catalogue et vos ventes
          </p>
        </div>

        {/* Formulaire de connexion */}
        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="space-y-6">
            {/* Champ Email */}
            <div className="relative group">
              <input 
                type="email" 
                placeholder="VOTRE EMAIL" 
                className="w-full border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[0.2em] outline-none focus:border-orange-600 transition-colors bg-transparent placeholder:text-gray-200"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            {/* Champ Password */}
            <div className="relative group">
              <input 
                type="password" 
                placeholder="MOT DE PASSE" 
                className="w-full border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[0.2em] outline-none focus:border-orange-600 transition-colors bg-transparent placeholder:text-gray-200"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {/* Bouton Principal : Connexion */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all duration-500 shadow-sm disabled:bg-gray-50 disabled:text-gray-300"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Accéder à mon espace"}
            </button>

            {/* Bouton Secondaire : Redirection vers l'inscription */}
            <Link 
              to="/register" 
              className="w-full border border-gray-100 py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:border-black transition-all duration-300 text-gray-400 hover:text-black text-center"
            >
              Devenir Vendeur Partenaire
            </Link>
          </div>
        </form>

        {/* Footer de sécurité */}
        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-3 text-gray-200">
            <ShieldCheck size={14} strokeWidth={1.5} />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Protocole sécurisé Festisolde</span>
          </div>
        </div>
      </div>
    </div>
  );
}