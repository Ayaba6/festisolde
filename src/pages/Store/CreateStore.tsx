import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateStore() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction pour transformer le nom en URL (slug)
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté !");
      return;
    }

    const slug = generateSlug(name);

    // 2. Insérer la boutique dans Supabase
    const { data, error } = await supabase
      .from('stores')
      .insert([
        { 
          name, 
          slug, 
          description, 
          owner_id: user.id 
        }
      ])
      .select();

    if (error) {
      alert(error.message);
      if (error.code === '23505') alert("Ce nom de boutique est déjà pris !");
    } else {
      alert("Boutique créée avec succès !");
      navigate('/dashboard'); // On redirige vers le tableau de bord du vendeur
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Créer ma boutique Festisolde</h2>
      <form onSubmit={handleCreateStore} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nom de la boutique (ex: Ma Super Promo)"
          className="p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Décrivez ce que vous vendez..."
          className="p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
        >
          {loading ? "Création..." : "Lancer ma boutique"}
        </button>
      </form>
    </div>
  );
}