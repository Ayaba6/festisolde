import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Store, 
  Flame, 
  Package, 
  MapPin, 
  Search,
  ArrowUpRight,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Liquidation() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiquidationStores();
  }, []);

  async function fetchLiquidationStores() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`*, products!inner(category)`)
        .eq('status', 'active')
        .ilike('products.category', 'Liquidation')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueStores = Array.from(
        new Map(data.map(store => [store.id, store])).values()
      );
      setStores(uniqueStores);
    } catch (err) {
      console.error("Erreur:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans antialiased text-slate-900 selection:bg-red-100">
      
      {/* --- HEADER ÉPURÉ (Fond Blanc) --- */}
      <header className="pt-12 pb-10 px-6 bg-white border-b border-slate-100 relative overflow-hidden">
        {/* Halo décoratif très subtil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-70 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-red-600 transition-all"
            >
              <ArrowLeft size={12} />
              Retour Accueil
            </Link>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <div className="h-[1px] w-4 bg-red-600"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Offres Flash</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-light uppercase tracking-tight text-slate-950 leading-tight">
                Zone <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-slate-950">Liquidation</span>
              </h1>
            </div>
          </div>

          {/* Recherche minimaliste style Retail */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="CHERCHER UNE BOUTIQUE..."
              className="w-full bg-slate-50 border border-slate-100 rounded-full py-4 pl-14 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-red-600/30 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* --- GRID (Sur fond légèrement grisé) --- */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="flex items-center gap-3 mb-12 border-b border-slate-100 pb-8 opacity-60">
          <LayoutGrid size={14} className="text-red-600" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Vendeurs Partenaires ({filteredStores.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStores.map((store) => (
            <div 
              key={store.id}
              onClick={() => navigate(`/${store.slug}`)}
              className="group relative bg-white rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5 border border-slate-50 cursor-pointer overflow-hidden shadow-sm"
            >
              {/* Effet au hover discret */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-50/0 to-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="p-9 relative z-10">
                <div className="flex justify-between items-start mb-9">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 p-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Store size={24} className="text-slate-300" />
                      )}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 bg-red-600 p-1.5 rounded-lg border-2 border-white shadow-lg shadow-red-500/20">
                      <Flame size={10} fill="white" className="text-white" />
                    </div>
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-md">
                    Vérifié
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold uppercase tracking-tighter text-slate-950 group-hover:text-red-600 transition-colors">
                    {store.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{store.location || 'Burkina Faso'}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2 pt-5 border-t border-slate-100 mt-5">
                    {store.description || "Destockage massif. Accédez aux inventaires liquidés de ce partenaire."}
                  </p>
                </div>

                <div className="mt-9 flex items-end justify-between border-t border-slate-100 pt-7">
                  <div className="space-y-1">
                    <span className="block text-[8px] font-black text-red-600 tracking-tighter uppercase">Remises Exceptionnelles</span>
                    <span className="text-2xl font-black italic tracking-tighter text-slate-950">-70% MIN.</span>
                  </div>
                  
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-red-600 transition-all duration-500 shadow-xl shadow-slate-900/10">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && <EmptyState />}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-32 text-center opacity-40">
      <Package size={40} className="mx-auto mb-4 text-slate-300" />
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Aucune boutique en liquidation</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-slate-100 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}