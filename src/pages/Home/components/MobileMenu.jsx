import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import {
  X, Home, LayoutGrid, PartyPopper, Boxes, Flame, ShoppingBag, LifeBuoy, ChevronRight, Store, LogIn, MessageCircle,
} from 'lucide-react';
import { FESTIVAL, festivalPhase } from '@/lib/festival';

const SUPPORT_WHATSAPP = '22670189912';

const LINKS = [
  { name: 'Accueil', path: '/', icon: Home, end: true },
  { name: 'Catalogue', path: '/products', icon: LayoutGrid },
  { name: 'Festival', path: '/festival', icon: PartyPopper, festival: true },
  { name: 'Vente en gros', path: '/grossistes', icon: Boxes },
  { name: 'Liquidation', path: '/liquidation', icon: Flame },
  { name: 'Aide', path: '/aide', icon: LifeBuoy },
];

// Menu latéral mobile de la vitrine.
export default function MobileMenu({ onClose, categories, onCategory, cartCount }) {
  const showFestival = festivalPhase() !== 'apres';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const item = ({ isActive }) =>
    `flex items-center gap-3.5 rounded-2xl px-3 py-3 text-[15px] font-semibold transition ${
      isActive ? 'bg-orange-50 text-orange-700' : 'text-ink active:bg-stone-100'
    }`;

  // Rendu dans <body> : le flou de l'en-tête (backdrop-filter) piégerait sinon le menu dans sa hauteur.
  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <style>{`
        @keyframes festi-drawer { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        @keyframes festi-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        style={{ animation: 'festi-fade .2s ease-out both' }}
        onClick={onClose}
      />

      <div
        className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl"
        style={{ animation: 'festi-drawer .28s cubic-bezier(.2,.8,.2,1) both', paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* En-tête */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <Link to="/" onClick={onClose} aria-label="FestiSolde, accueil">
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-8 w-auto" />
          </Link>
          <button onClick={onClose} className="-mr-2 rounded-full p-2.5 text-ink active:bg-stone-100" aria-label="Fermer le menu">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Mise en avant du festival */}
          {showFestival && (
            <Link
              to="/festival"
              onClick={onClose}
              className="relative mb-5 flex items-center gap-3 overflow-hidden rounded-2xl bg-ink p-4 text-white"
            >
              <img src="/festival/foule.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-ink">
                <PartyPopper size={20} aria-hidden="true" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-300">Festival de Noël</span>
                <span className="block truncate font-extrabold">{FESTIVAL.datesLabel.replace('Du ', '')}</span>
                <span className="block truncate text-xs text-stone-300">{FESTIVAL.place}</span>
              </span>
              <ChevronRight size={18} className="relative shrink-0" />
            </Link>
          )}

          {/* Navigation */}
          <nav aria-label="Navigation mobile" className="space-y-0.5">
            {LINKS.filter((l) => !l.festival || showFestival).map(({ name, path, icon: Icon, end }) => (
              <NavLink key={path} to={path} end={end} onClick={onClose} className={item}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-soft">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="flex-1">{name}</span>
                <ChevronRight size={16} className="text-stone-300" aria-hidden="true" />
              </NavLink>
            ))}
            <NavLink to="/panier" onClick={onClose} className={item}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-soft">
                <ShoppingBag size={18} aria-hidden="true" />
              </span>
              <span className="flex-1">Mon panier</span>
              {cartCount > 0 ? (
                <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">{cartCount}</span>
              ) : (
                <ChevronRight size={16} className="text-stone-300" aria-hidden="true" />
              )}
            </NavLink>
          </nav>

          {/* Catégories */}
          {categories.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Catégories</p>
              <div className="flex flex-wrap gap-2 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategory(cat)}
                    className="rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft active:bg-stone-100"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aide rapide */}
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            <MessageCircle size={18} className="shrink-0" aria-hidden="true" />
            Une question ? Écrivez-nous sur WhatsApp
          </a>
        </div>

        {/* Espace vendeur */}
        <div className="shrink-0 border-t border-stone-100 bg-cream p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Vous êtes commerçant ?</p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/auth" onClick={onClose} className="shop-btn whitespace-nowrap border border-stone-200 bg-white px-3 text-sm">
              <LogIn size={16} /> Connexion
            </Link>
            <Link to="/register" onClick={onClose} className="shop-btn-primary whitespace-nowrap px-3 text-sm">
              <Store size={16} /> Vendre
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
