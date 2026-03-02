import { Link } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  ShoppingBag, 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Watch, 
  Car, 
  Package 
} from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery }) {
  
  const categories = [
    { name: "Électronique", icon: <Smartphone size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
    { name: "Mode & Beauté", icon: <Shirt size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
    { name: "Maison", icon: <HomeIcon size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
    { name: "Accessoires", icon: <Watch size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
    { name: "Véhicules", icon: <Car size={16} strokeWidth={1.5} />, color: "bg-gray-900" },
    { name: "Gros Lots", icon: <Package size={16} strokeWidth={1.5} />, color: "bg-red-600" },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* --- TOP BAR : Logo & Actions --- */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo-festisolde.png" alt="Festisolde" className="h-10 md:h-12 object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {['Grossistes', 'Déstockage', 'Aide'].map((item) => (
            <span key={item} className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-red-600 cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/auth" className="hidden sm:block text-[10px] font-bold text-gray-900 uppercase tracking-widest hover:text-red-600 transition-all">
            Connexion
          </Link>
          <Link to="/auth" className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-600/10">
            Vendre un stock
          </Link>
          <Link to="/panier" className="relative p-2 text-gray-900 hover:text-red-600 transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute top-0 right-0 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </Link>
        </div>
      </div>

      {/* --- SEARCH BAR : Le bandeau rouge stylisé --- */}
      <div className="bg-red-600 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-4">
          <button className="bg-black text-white px-6 py-3.5 flex items-center justify-between gap-4 text-[10px] font-bold min-w-[220px] uppercase tracking-widest hover:bg-gray-800 transition-all">
            <div className="flex items-center gap-3">
              <Menu size={16} />
              <span>Catégories</span>
            </div>
          </button>

          <div className="flex-1 flex w-full bg-white relative">
            <input 
              type="text" 
              placeholder="Chercher un arrivage (iPhone, Ballots...)"
              className="flex-1 px-6 py-3.5 outline-none text-gray-700 text-[11px] font-medium uppercase tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-[#FF9F00] hover:bg-black text-white px-8 py-3.5 flex items-center gap-3 transition-all duration-300">
              <Search size={16} />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em]">Rechercher</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- QUICK LINKS : Catégories minimalistes --- */}
      <div className="bg-white border-b border-gray-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-between items-center">
          {categories.map((cat, index) => (
            <div key={index} className="flex items-center gap-3 group cursor-pointer">
              <div className={`${cat.color} w-8 h-8 rounded-lg flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                {cat.icon}
              </div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] group-hover:text-black transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}