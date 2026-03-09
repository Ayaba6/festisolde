import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Zap, 
  TrendingDown, 
  Timer, 
  ShoppingBag, 
  ArrowRight,
  Flame,
  Filter,
  PackageCheck,
  ArrowLeft // Import ajouté
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // Import de Link ajouté

export default function Liquidation() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiquidationProducts();
  }, []);

  async function fetchLiquidationProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, stores(name)')
      .eq('status', 'active')
      .order('discount_price', { ascending: true })
      .limit(20);

    if (!error) setProducts(data);
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 font-sans text-white">
      {/* --- FLASH HEADER --- */}
      <div className="bg-red-600 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-4 mx-8 text-[10px] font-black uppercase italic tracking-[0.3em]">
              <Zap size={14} fill="white" /> Déstockage Massif - Jusqu'à -80% - Vente Flash en cours
            </span>
          ))}
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* BOUTON RETOUR ACCUEIL */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour Accueil
          </Link>

          <div className="flex items-center gap-3 mb-6 text-red-500">
            <Flame size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Offres à durée limitée</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] mb-8">
            Zone de <br /> <span className="text-red-600">Liquidation</span>
          </h1>
          <p className="max-w-xl text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Les arrivages les moins chers du marché. Stocks limités, 
            <span className="text-white"> premiers arrivés, premiers servis.</span>
          </p>
        </div>
        
        {/* Déco Arrière-plan */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-20"></div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* --- GRID PRODUITS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const discount = Math.round(((product.price - product.discount_price) / product.price) * 100);
            
            return (
              <div 
                key={product.id}
                onClick={() => navigate(`/produit/${product.id}`)} // Corrigé le chemin pour correspondre à tes routes
                className="group relative bg-[#141414] border border-white/5 rounded-3xl overflow-hidden hover:border-red-600/50 transition-all duration-500 cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {/* Badge de Réduction */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-black italic shadow-2xl">
                    -{discount}%
                  </div>
                </div>

                {/* Infos */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{product.stores?.name}</span>
                    <div className="flex items-center gap-1 text-red-500">
                      <Timer size={10} />
                      <span className="text-[9px] font-black uppercase">Urgent</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black uppercase tracking-tight mb-4 line-clamp-1 group-hover:text-red-500 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 line-through font-bold">{product.price.toLocaleString()} F</p>
                      <p className="text-xl font-black italic text-white leading-none">
                        {product.discount_price?.toLocaleString()} <span className="text-[10px] not-italic">FCFA</span>
                      </p>
                    </div>
                    
                    <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>

                {/* Barre de stock restant (visuel) */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                   <div className="h-full bg-red-600 w-1/4 animate-pulse"></div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && <EmptyState />}
      </main>

      {/* --- FOOTER BANNER --- */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-[3rem] p-12 flex flex-col items-center text-center gap-8 relative overflow-hidden shadow-2xl">
           <TrendingDown size={64} className="opacity-20 absolute -left-10 bottom-0 rotate-12" />
           <div className="relative z-10">
             <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Alerte Nouveaux Stocks</h2>
             <p className="text-red-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Rejoignez notre groupe WhatsApp pour ne rater aucun arrivage</p>
             <button className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                S'abonner aux alertes
             </button>
           </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-40 text-center">
      <PackageCheck size={48} className="mx-auto text-white/10 mb-4" />
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Aucune liquidation en cours</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-10 h-10 border-4 border-white/5 border-t-red-600 rounded-full animate-spin mb-4" />
      <span className="text-[9px] font-black uppercase text-red-600 tracking-widest animate-pulse">Scan des prix cassés...</span>
    </div>
  );
}