import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { 
  Search, 
  Menu, 
  ShoppingBag, 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Watch, 
  Car, 
  Package,
  ChevronDown,
  X,
  Tag,
  Users 
} from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [globalViews, setGlobalViews] = useState(0);
  const navigate = useNavigate();
  const location = useLocation(); // Pour détecter la page active

  useEffect(() => {
    // 1. Récupérer les catégories
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (!error && data) {
        const uniqueNames = [...new Set(data.map(item => item.category))];
        setDbCategories(uniqueNames);
      }
    }

    // 2. Récupérer le total des vues
    async function fetchGlobalViews() {
      const { data } = await supabase.from('products').select('views');
      if (data) {
        const total = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        // Petit bonus pour le compteur visuel
        setGlobalViews(total + 1250); 
      }
    }

    fetchCategories();
    fetchGlobalViews();

    const interval = setInterval(fetchGlobalViews, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryStyle = (catName) => {
    const registry = {
      "Électronique": { icon: <Smartphone size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
      "Mode & Beauté": { icon: <Shirt size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
      "Maison": { icon: <HomeIcon size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
      "Accessoires": { icon: <Watch size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
      "Véhicules": { icon: <Car size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
      "Gros Lots": { icon: <Package size={16} strokeWidth={1.5} />, color: "bg-red-600" },
    };
    return registry[catName] || { icon: <Tag size={16} strokeWidth={1.5} />, color: "bg-gray-400" };
  };

  const handleCategoryClick = (categoryName) => {
    setIsMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  // Liste des liens de navigation
  const navLinks = [
    { name: 'Grossistes', path: '/grossistes' },
    { name: 'Liquidation', path: '/liquidation' },
    { name: 'Aide', path: '/aide' },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm font-sans">
      {/* --- TOP BAR --- */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/logo-festisolde.png" 
            alt="Festisolde" 
            className="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105" 
          />
        </Link>

        {/* --- NAVIGATION & COMPTEUR LIVE --- */}
        <nav className="hidden lg:flex items-center gap-10">
          {/* COMPTEUR DE VISITEURS LIVE */}
          <div className="flex items-center gap-2.5 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span className="text-black">{globalViews.toLocaleString()}</span> Visiteurs
            </span>
          </div>

          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                location.pathname === link.path 
                ? 'text-orange-600' 
                : 'text-gray-400 hover:text-orange-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/auth" className="hidden sm:block text-[10px] font-bold text-gray-900 uppercase tracking-widest hover:text-orange-500 transition-all">
            Connexion
          </Link>
          <Link to="/auth" className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-600/10 rounded-sm">
            Vendre un stock
          </Link>
          <Link to="/panier" className="relative p-2 text-gray-900 hover:text-orange-500 transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute top-0 right-0 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </Link>
        </div>
      </div>

      {/* --- SEARCH BAR & DROPDOWN --- */}
      <div className="bg-red-600 py-4 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-auto">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-black text-white px-6 py-3.5 flex items-center justify-between gap-4 text-[10px] font-bold w-full md:min-w-[220px] uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-3">
                {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                <span>Catégories</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-gray-100 z-[60] py-4 max-h-[70vh] overflow-y-auto">
                {dbCategories.map((catName, index) => {
                  const style = getCategoryStyle(catName);
                  return (
                    <div 
                      key={index}
                      onClick={() => handleCategoryClick(catName)}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-orange-50 cursor-pointer transition-colors group"
                    >
                      <div className={`${style.color} w-8 h-8 rounded flex items-center justify-center text-white group-hover:bg-orange-500 transition-colors`}>
                        {style.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-orange-600">
                        {catName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form 
            className="flex-1 flex w-full bg-white relative"
            onSubmit={(e) => { e.preventDefault(); navigate(`/products?search=${searchQuery}`); }}
          >
            <input 
              type="text" 
              placeholder="Chercher un arrivage..."
              className="flex-1 px-6 py-3.5 outline-none text-gray-700 text-[11px] font-medium uppercase tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-[#FF9F00] hover:bg-black text-white px-8 py-3.5 flex items-center gap-3 transition-all duration-300">
              <Search size={16} />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em]">Rechercher</span>
            </button>
          </form>
        </div>
      </div>

      {/* --- QUICK LINKS : Catégories du bas --- */}
      <div className="bg-white border-b border-gray-50 hidden md:block overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-8 overflow-x-auto no-scrollbar">
          {dbCategories.slice(0, 10).map((catName, index) => {
            const style = getCategoryStyle(catName);
            return (
              <button 
                key={index} 
                onClick={() => handleCategoryClick(catName)}
                className="flex items-center gap-2 group cursor-pointer whitespace-nowrap"
              >
                <div className={`${style.color} w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-300 group-hover:bg-orange-500 group-hover:scale-110`}>
                  {style.icon}
                </div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em] group-hover:text-orange-600 transition-colors">
                  {catName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}