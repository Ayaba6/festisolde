import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Store, 
  ChevronRight, 
  ShieldCheck, 
  Package, 
  MapPin, 
  Star,
  Search,
  ArrowUpRight,
  Truck,
  ArrowLeft 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Grossistes() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrossistes();
  }, []);

  async function fetchGrossistes() {
    setLoading(true);
    try {
      // On récupère les boutiques qui ont au moins un produit dans la catégorie 'Grossistes'
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          products!inner(category)
        `)
        .eq('status', 'active')
        .eq('products.category', 'Grossistes')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase peut renvoyer des doublons si la boutique a plusieurs produits correspondants
      // On filtre pour n'avoir que des boutiques uniques
      const uniqueStores = Array.from(
        new Map(data.map(store => [store.id, store])).values()
      );

      setStores(uniqueStores);
    } catch (err) {
      console.error("Erreur lors de la récupération des grossistes:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans antialiased text-slate-900">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-slate-100 py-12 px-6 relative">
        
        <div className="max-w-7xl mx-auto mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour Accueil
          </Link>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[9px] font-black uppercase rounded-lg tracking-widest">B2B Network</span>
               <span className="w-12 h-[1px] bg-slate-200"></span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              Annuaire <br /> <span className="text-orange-600">Grossistes</span>
            </h1>
          </div>
          
          <div className="max-w-md w-full relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Chercher un fournisseur..."
              className="w-full pl-14 pr-6 py-5 bg-slate-100 border-none rounded-[1.5rem] text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* --- GRID DE GROSSISTES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStores.map((store) => (
            <div 
              key={store.id}
              onClick={() => navigate(`/${store.slug}`)}
              className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="h-24 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-600 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              <div className="px-8 pb-8 flex-1">
                <div className="relative -mt-10 mb-6">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-16 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                    <ShieldCheck size={12} strokeWidth={3} />
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">{store.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={10} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{store.location || 'Burkina Faso'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2">
                  {store.description || "Partenaire grossiste certifié. Retrouvez des lots exclusifs et arrivages réguliers en vente de gros."}
                </p>

                <div className="flex items-center justify-between py-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Statut</span>
                    <span className="text-[10px] font-black italic text-orange-600 uppercase tracking-tighter">Grossiste Actif</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Fiabilité</span>
                    <div className="flex gap-0.5 text-orange-500">
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 py-4 bg-slate-50 group-hover:bg-black group-hover:text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest">Voir le catalogue gros</span>
                  <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="py-40 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Aucune boutique grossiste disponible</p>
          </div>
        )}
      </main>

      {/* --- BANNER CTA --- */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-orange-600 rounded-[3rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-600/20 text-white">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">
              Vendez vos <br /> <span className="text-black">stocks en gros ?</span>
            </h2>
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.2em]">Ajoutez vos articles dans la catégorie Grossistes pour apparaître ici.</p>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="relative z-10 px-10 py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-4"
          >
            <Truck size={16} /> Mon compte vendeur
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Chargement du réseau B2B...</span>
    </div>
  );
}