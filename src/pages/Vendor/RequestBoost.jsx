import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import { 
  Zap, 
  Megaphone, 
  Send, 
  LayoutGrid, 
  CheckCircle2, 
  MessageCircle, 
  Package, 
  ChevronDown 
} from 'lucide-react';

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
      color: 'border-gray-900 text-gray-900'
    }
  ];

  useEffect(() => {
    async function getMyProducts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: storeData } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();
        if (storeData) {
          const { data: productsData, error } = await supabase
            .from('products')
            .select('id, name')
            .eq('store_id', storeData.id)
            .order('name', { ascending: true });
          if (!error && productsData) setUserProducts(productsData);
        }
      }
    }
    getMyProducts();
  }, []);

  const generateWhatsAppLink = () => {
    const phoneNumber = "22670189912"; 
    const pack = packs.find(p => p.id === selectedPack);
    const product = userProducts.find(p => p.id === selectedProductId);
    const message = `Bonjour Festisolde ! 👋\nJe souhaite activer un boost.\n\n🚀 Produit : ${product?.name}\n💎 Pack : ${pack?.name}\n💰 Montant : ${pack?.price} CFA`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const currentPack = packs.find(p => p.id === selectedPack);

    if (!user || !selectedProductId) {
        alert("Sélectionnez un produit.");
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('marketing_requests').insert([{ 
      seller_id: user.id,
      product_id: selectedProductId,
      pack_type: selectedPack,
      price: parseInt(currentPack.price.replace(/\s/g, '')),
      status: 'en_attente'
    }]);

    if (!error) setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] text-center space-y-8 shadow-2xl border-2 border-gray-100">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={40} strokeWidth={3} />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Demande Transmise</h3>
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black italic">Validation en cours</p>
        </div>
        
        <div className="flex flex-col gap-3">
            <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-green-100"
            >
              <MessageCircle size={18} fill="white" /> Activer via WhatsApp
            </a>
            <button onClick={() => setSubmitted(false)} className="py-4 text-[9px] font-black uppercase text-gray-400 hover:text-black tracking-widest">
              Retour au Studio
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12 bg-white rounded-[3rem] shadow-2xl border-2 border-gray-100 font-sans">
      <div className="mb-12 text-center space-y-2">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
          Propulser mon <span className="text-orange-600">Arrivage</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">
          Visibilité premium pour vos stocks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Grille des Packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div 
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`relative p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 group ${
                selectedPack === pack.id 
                ? `${pack.color} bg-white shadow-2xl scale-[1.03] ring-4 ring-orange-50` 
                : 'border-gray-100 bg-gray-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-white shadow-sm transition-transform group-hover:rotate-12`}>
                  {pack.icon}
                </div>
                {/* JOURS EN NOIR FONCÉ INTENSE */}
                <span className="text-[10px] font-black uppercase bg-black text-white px-3 py-1.5 rounded-xl shadow-lg tracking-widest">
                  {pack.duration}
                </span>
              </div>
              
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-1">{pack.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-black italic">{pack.price}</span>
                <span className="text-[9px] font-black opacity-40 uppercase tracking-tighter text-gray-900">CFA</span>
              </div>
              
              <ul className="space-y-3">
                {pack.features.map((f, i) => (
                  <li key={i} className="text-[9px] font-black uppercase tracking-tight flex items-center gap-2 text-gray-500">
                    <div className="w-1 h-1 bg-orange-600 rounded-full" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sélection du produit */}
        <div className="space-y-4 max-w-xl mx-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2 italic">
            <Package size={14} className="text-orange-600" /> Article à mettre en avant
          </label>
          <div className="relative group">
            <select 
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white border-2 border-gray-900 p-5 rounded-[1.5rem] text-[11px] font-black uppercase outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer tracking-widest text-black shadow-sm"
            >
              <option value="" disabled className="text-gray-300">-- Choisir dans mon stock --</option>
              {userProducts.map(p => (
                <option key={p.id} value={p.id} className="text-black font-black">{p.name}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-black group-hover:text-orange-600 transition-colors">
                <ChevronDown size={20} strokeWidth={4} />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!selectedPack || !selectedProductId || loading}
          className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 ${
            selectedPack && selectedProductId && !loading
            ? 'bg-black text-white hover:bg-orange-600 shadow-orange-100' 
            : 'bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-gray-50 shadow-none'
          }`}
        >
          {loading ? "TRAITEMENT EN COURS..." : "VALIDER LE BOOST"} <Send size={18} strokeWidth={3} />
        </button>
      </form>
    </div>
  );
}