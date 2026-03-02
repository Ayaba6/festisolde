import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom'; // Ajouté pour la redirection

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialisation

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('Vérifie tes emails pour confirmer ton compte !');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
    } else {
      // REDIRECTION INTELLIGENTE
      if (data.user.id === import.meta.env.VITE_ADMIN_UID) {
        navigate('/admin'); // Si c'est toi, direct au panneau de contrôle
      } else {
        navigate('/dashboard'); // Si c'est un vendeur, vers son garage
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">Rejoindre Festisolde</h1>
      <form className="flex flex-col gap-4">
        <input 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          type="email" 
          placeholder="Ton email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <input 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          type="password" 
          placeholder="Ton mot de passe" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        <div className="flex flex-col gap-2 mt-2">
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="bg-orange-600 text-white p-3 rounded-lg font-bold hover:bg-orange-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <button 
            onClick={handleSignUp} 
            disabled={loading}
            className="text-orange-600 border border-orange-600 p-3 rounded-lg font-semibold hover:bg-orange-50 disabled:border-gray-400 disabled:text-gray-400 transition"
          >
            S'inscrire comme vendeur
          </button>
        </div>
      </form>
    </div>
  );
}