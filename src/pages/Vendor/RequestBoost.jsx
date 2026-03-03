import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Zap, Megaphone, Send, LayoutGrid, CheckCircle2, MessageCircle, Package } from 'lucide-react';

export default function RequestBoost() {
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [userProducts, setUserProducts] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const packs = [
    {
      id: 'flash',
      name: 'Pack Flash',
      price: '2 500',
      duration: '3 jours',
      features: ['Badge "Top Deal"', 'Priorité catégorie'],
      icon: <Zap size={20} />,
      color: 'border-yellow-400 text-yellow-600'
    },
    {
      id: 'boost',
      name: 'Pack Boost',
      price: '7 500',
      duration: '7 jours',
      features: ['Badge "Sponsorisé"', '1 Story WhatsApp', 'Top catalogue'],
      icon: <Megaphone size={20} />,
      color: 'border-orange-500 text-orange-600'
    },
    {
      id: 'leader',
      name: 'Pack Leader',
      price: '15 000',
      duration: '14 jours',
      features: ['Bannière Accueil', 'Diffusion WhatsApp Pro', 'Support dédié'],
      icon: <LayoutGrid size={20} />,
      color: 'border-black text-black'
    }
  ];

  // --- LOGIQUE DE RÉCUPÉRATION DES PRODUITS CORRIGÉE ---
  useEffect(() => {
    async function getMyProducts() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. On récupère d'abord l'ID de la boutique du vendeur
        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (storeData) {
          // 2. On récupère les produits liés à ce store_id
          const { data: productsData, error } = await supabase
            .from('products')
            .select('id, name')
            .eq('store_id', storeData.id)
            .order('name', { ascending: true });

          if (!error && productsData) {
            setUserProducts(productsData);
          }
        }
      }
    }
    getMyProducts();
  }, []);

  const generateWhatsAppLink = () => {
    const phoneNumber = "22670189912"; 
    const pack = packs.find(p => p.id === selectedPack);
    const product = userProducts.find(p => p.id === selectedProductId);
    
    const message = `Bonjour Festisolde ! 👋 
Je souhaite activer un boost pour mon arrivage.

🚀 Produit : ${product?.name || 'ID: ' + selectedProductId}
💎 Pack : ${pack?.name}
💰 Montant : ${pack?.price} CFA

Merci de m'indiquer la marche à suivre pour le règlement.`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const currentPack = packs.find(p => p.id === selectedPack);

    if (!user || !selectedProductId) {
        alert("Erreur : Veuillez sélectionner un produit dans la liste.");
        setLoading(false);
        return;
    }

    const { error } = await supabase
      .from('marketing_requests')
      .insert([
        { 
          seller_id: user.id,
          product_id: selectedProductId,
          pack_type: selectedPack,
          price: parseInt(currentPack.price.replace(/\s/g, '')),
          status: 'en_attente'
        }
      ]);

    if (!error) {
      setSubmitted(true);
    } else {
      console.error("Erreur Supabase:", error);
      alert("Erreur lors de l'enregistrement. Vérifiez votre connexion.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] text-center space-y-6 shadow-2xl border border-gray-50">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Demande Envoyée !</h3>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold leading-relaxed">
          Votre demande est en attente. Pour une activation immédiate, contactez-nous sur WhatsApp.
        </p>
        
        <div className="flex flex-col gap-3 pt-4">
            <a 
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-green-200"
            >
              <MessageCircle size={18} /> Finaliser sur WhatsApp
            </a>
            <button onClick={() => setSubmitted(false)} className="text-[9px] font-black uppercase text-gray-400 hover:text-black">
              Retour au formulaire
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white rounded-[3rem] shadow-2xl border border-gray-50">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">
          Propulsez vos <span className="text-orange-600">Arrivages</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mt-2">
          Visibilité maximale auprès des revendeurs Festisolde
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Grille des Packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div 
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                selectedPack === pack.id 
                ? `${pack.color} bg-white shadow-xl scale-105` 
                : 'border-gray-100 bg-gray-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white shadow-sm">{pack.icon}</div>
                <span className="text-[10px] font-black">{pack.duration}</span>
              </div>
              <h4 className="text-[12px] font-black uppercase tracking-widest mb-1">{pack.name}</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-xl font-black italic">{pack.price}</span>
                <span className="text-[8px] font-bold uppercase">CFA</span>
              </div>
              <ul className="space-y-2">
                {pack.features.map((f, i) => (
                  <li key={i} className="text-[9px] font-bold uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1 h-1 bg-current rounded-full" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sélection du produit (CORRIGÉ) */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
            <Package size={14} /> Quel arrivage souhaitez-vous booster ?
          </label>
          <div className="relative">
            <select 
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>-- Sélectionner un produit dans mon catalogue --</option>
              {userProducts.length > 0 ? (
                userProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              ) : (
                <option disabled>Aucun produit trouvé dans votre stock</option>
              )}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <LayoutGrid size={16} />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!selectedPack || !selectedProductId || loading}
          className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${
            selectedPack && selectedProductId && !loading
            ? 'bg-black text-white hover:bg-orange-600 shadow-xl' 
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {loading ? "Enregistrement..." : "Confirmer le boost"} <Send size={16} />
        </button>
      </form>
    </div>
  );
}