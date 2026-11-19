import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingBag, Menu, X, User, ShieldCheck, ArrowRight, PartyPopper } from 'lucide-react';
import { FESTIVAL, festivalPhase } from '@/lib/festival';

const NAV_LINKS = [
  { name: 'Catalogue', path: '/products' },
  { name: 'Festival', path: '/festival' },
  { name: 'Grossistes', path: '/grossistes' },
  { name: 'Liquidation', path: '/liquidation' },
  { name: 'Aide', path: '/aide' },
];

// Catégories gérées sur des pages dédiées : pas dans les raccourcis.
const HIDDEN_CATEGORIES = ['Grossiste', 'Grossistes', 'Liquidation'];

export default function Header({ searchQuery, setSearchQuery }) {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeCategory = params.get('category');
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Le parent peut piloter la recherche (Shop) ; sinon on la gère localement.
  const query = searchQuery ?? localQuery;
  const setQuery = setSearchQuery ?? setLocalQuery;

  useEffect(() => {
    supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .then(({ data }) => {
        if (!data) return;
        const unique = [...new Set(data.map((p) => p.category))].filter((c) => c && !HIDDEN_CATEGORIES.includes(c));
        setCategories(unique.sort((a, b) => a.localeCompare(b, 'fr')));
      });
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    setIsMenuOpen(false);
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const goToCategory = (cat) => {
    setIsMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(cat)}`);
  };

  // Fonction de rendu (et non composant) : l'input garde le focus pendant la saisie.
  const renderSearch = (className = '') => (
    <form onSubmit={submitSearch} role="search" className={`relative ${className}`}>
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un produit, une marque…"
        aria-label="Rechercher un produit"
        className="w-full rounded-full border border-stone-200 bg-stone-50 py-3 pl-11 pr-28 text-[15px] text-ink placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
      />
      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600">
        Chercher
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md">
      {/* Bandeau de réassurance */}
      <div className="bg-ink text-white">
        <div className="shop-container flex h-9 items-center justify-between gap-4 text-xs font-medium">
          {festivalPhase() !== 'apres' ? (
            <Link to="/festival" className="flex items-center gap-2 truncate font-semibold text-white hover:text-orange-300">
              <PartyPopper size={14} className="shrink-0 text-orange-400" />
              <span className="truncate">Festival FestiSolde · {FESTIVAL.datesLabel.replace('Du ', 'du ')} à {FESTIVAL.place.split(',')[0]}</span>
            </Link>
          ) : (
            <p className="flex items-center gap-2 truncate text-stone-300">
              <ShieldCheck size={14} className="shrink-0 text-orange-400" />
              <span className="truncate">Paiement Orange Money, Moov Money ou à la livraison</span>
            </p>
          )}
          <Link to="/auth" className="hidden shrink-0 items-center gap-1 font-semibold text-white hover:text-orange-300 sm:flex">
            Vendre sur FestiSolde <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Barre principale */}
      <div className="border-b border-stone-100">
        <div className="shop-container flex h-16 items-center gap-4 md:h-20 md:gap-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="-ml-2 rounded-full p-2 text-ink hover:bg-stone-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="shrink-0" aria-label="FestiSolde, accueil">
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-9 w-auto md:h-11" />
          </Link>

          {renderSearch('hidden flex-1 md:block')}

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {NAV_LINKS.slice(1).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-semibold transition ${isActive ? 'text-orange-600' : 'text-ink-soft hover:text-ink hover:bg-stone-100'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link to="/auth" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-stone-100 hover:text-ink sm:flex">
              <User size={18} /> <span className="hidden xl:inline">Espace vendeur</span>
            </Link>
            <Link to="/panier" className="relative rounded-full p-2.5 text-ink hover:bg-stone-100" aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}>
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Recherche mobile */}
        <div className="shop-container pb-3 md:hidden">
          {renderSearch()}
        </div>
      </div>

      {/* Raccourcis catégories */}
      {categories.length > 0 && (
        <div className="hidden border-b border-stone-100 md:block">
          <div className="shop-container flex h-12 items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.slice(0, 12).map((cat) => (
              <button
                key={cat}
                onClick={() => goToCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  activeCategory === cat ? 'bg-ink text-white' : 'text-ink-soft hover:bg-stone-100 hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-stone-100 px-5">
              <img src="/logo-festisolde.png" alt="FestiSolde" className="h-8 w-auto" />
              <button onClick={() => setIsMenuOpen(false)} className="rounded-full p-2 hover:bg-stone-100" aria-label="Fermer le menu">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <nav className="space-y-1" aria-label="Navigation mobile">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-3 text-base font-semibold ${isActive ? 'bg-orange-50 text-orange-600' : 'text-ink hover:bg-stone-50'}`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>
              {categories.length > 0 && (
                <>
                  <p className="mb-3 mt-8 px-3 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Catégories</p>
                  <div className="flex flex-wrap gap-2 px-1">
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => goToCategory(cat)} className="rounded-full border border-stone-200 px-3.5 py-2 text-sm font-medium text-ink-soft">
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-stone-100 p-5">
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="shop-btn-primary w-full">
                Vendre sur FestiSolde
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
