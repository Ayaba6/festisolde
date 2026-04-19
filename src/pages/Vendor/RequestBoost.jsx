import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Megaphone, 
  Send, 
  LayoutGrid, 
  CheckCircle2, 
  MessageCircle, 
  Package, 
  ChevronDown,
  ChevronLeft,
  Loader2
} from 'lucide-react';

export default function RequestBoost() {
  const navigate = useNavigate();
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
      icon: <Zap size={18} />,
      color: 'border-amber-400 text-amber-600'
    },
    {
      id: 'boost',
      name: 'Pack Boost',
      price: '7 500',
      duration: '7 jours',
      features: ['Badge "Sponsorisé"', '1 Story WhatsApp', 'Top catalogue'],
      icon: <Megaphone size={18} />,
      color: 'border-orange-500 text-orange-600'
    },
    {
      id: 'leader',
      name: 'Pack Leader',
      price: '15 000',
      duration: '14 jours',
      features: ['Bannière Accueil', 'Diffusion WhatsApp Pro', 'Support dédié'],
      icon: <LayoutGrid size={18} />,
      color: 'border-slate-900 text-slate-900'
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
      <div className="max-w-md mx-auto mt-12 bg-white p-12 rounded-[2.5rem] text-center space-y-8 shadow-2xl border border-slate-100">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Demande Transmise</h3>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">En attente de validation</p>
        </div>
        
        <div className="flex flex-col gap-3">
            <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-green-100"
            >
              <MessageCircle size={18} fill="currentColor" /> Finaliser sur WhatsApp
            </a>
            <button onClick={() => navigate('/dashboard')} className="py-4 text-[9px] font-bold uppercase text-slate-400 hover:text-slate-900 tracking-widest">
              Retour au Dashboard
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 pb-20">
      
      {/* HEADER AVEC RETOUR */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all w-fit"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketing & Boost</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Propulsez vos produits en haut de liste</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* GRILLE DES PACKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packs.map((pack) => (
            <div 
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`relative p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer group ${
                selectedPack === pack.id 
                ? `border-orange-500 bg-white shadow-xl shadow-orange-50 scale-[1.02]` 
                : 'border-slate-100 bg-slate-50/50 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-3 rounded-xl bg-white shadow-sm text-slate-900 transition-transform group-hover:scale-110`}>
                  {pack.icon}
                </div>
                <span className="text-[9px] font-bold uppercase bg-slate-900 text-white px-3 py-1.5 rounded-lg tracking-widest shadow-sm">
                  {pack.duration}
                </span>
              </div>
              
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{pack.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold tracking-tighter text-slate-900">{pack.price}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">CFA</span>
              </div>
              
              <ul className="space-y-3">
                {pack.features.map((f, i) => (
                  <li key={i} className="text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 text-slate-500">
                    <div className="w-1 h-1 bg-orange-500 rounded-full shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              {selectedPack === pack.id && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-full shadow-lg">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SÉLECTION PRODUIT STYLE STUDIO */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
              <Package size={16} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Article à mettre en avant</p>
          </div>

          <div className="relative">
            <select 
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer tracking-widest text-slate-900"
            >
              <option value="" disabled>-- Choisir dans mon stock --</option>
              {userProducts.map(p => (
                <option key={p.id} value={p.id} className="text-slate-900 font-bold">{p.name}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* BOUTON VALIDATION */}
        <div className="max-w-2xl mx-auto">
          <button 
            type="submit"
            disabled={!selectedPack || !selectedProductId || loading}
            className={`w-full py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] ${
              selectedPack && selectedProductId && !loading
              ? 'bg-slate-950 text-white hover:bg-orange-600 shadow-slate-200' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-50 shadow-none'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirmer la demande"} 
            {!loading && <Send size={16} />}
          </button>
          <p className="text-center mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Un administrateur validera votre demande sous 24h
          </p>
        </div>
      </form>
    </div>
  );
}