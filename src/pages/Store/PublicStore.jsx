import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { Share2, Check, ShoppingBag, BadgeCheck, MessageCircle, Search, PackageOpen, ArrowRight, PartyPopper } from 'lucide-react';

export default function PublicStore() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const { cart } = useCart();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState('Tout');
  const [query, setQuery] = useState('');
  const [festivalStand, setFestivalStand] = useState(null);

  const cartCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    if (storeSlug) fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  useEffect(() => {
    if (store?.name) document.title = `${store.name} — FestiSolde`;
  }, [store]);

  async function fetchStoreData() {
    setLoading(true);
    try {
      let { data: storeData } = await supabase.from('stores').select('*').eq('slug', storeSlug).maybeSingle();

      // Ancien lien basé sur le nom de la boutique
      if (!storeData) {
        const decodedName = decodeURIComponent(storeSlug).replace(/-/g, ' ');
        const { data: fallbackData } = await supabase.from('stores').select('*').ilike('name', decodedName).maybeSingle();
        storeData = fallbackData;
      }

      if (storeData) {
        setStore(storeData);
        // Badge « Exposant Festival » (stand avec acompte ou payé)
        supabase.rpc('get_festival_exhibitors').then(({ data }) =>
          setFestivalStand(data?.find((e) => e.store_id === storeData.id)?.category ?? null));
        const { data: productsData } = await supabase
          .from('products')
          .select('*, stores(name, slug)')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Erreur de chargement:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(
    () => ['Tout', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (category === 'Tout' || p.category === category) && (!q || p.name?.toLowerCase().includes(q))
    );
  }, [products, category, query]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: store.name, text: `Découvrez ${store.name} sur FestiSolde`, url });
      } catch { /* partage annulé */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* presse-papiers indisponible */ }
  };

  const whatsapp = (store?.whatsapp_number || '').replace(/[^\d]/g, '');

  // Barre du haut : la vitrine reste celle du vendeur, FestiSolde reste discret.
  const topBar = (
    <div className="sticky top-0 z-40 border-b border-stone-100 bg-white/90 backdrop-blur-md">
      <div className="shop-container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
          <img src="/logo-festisolde.png" alt="FestiSolde" className="h-7 w-auto" />
        </Link>
        <Link to="/panier" className="relative rounded-full p-2.5 text-ink hover:bg-stone-100" aria-label={`Panier, ${cartCount} article(s)`}>
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {topBar}
        <div className="shop-container pt-4">
          <div className="h-40 animate-pulse rounded-3xl bg-stone-100 md:h-64" />
          <div className="mt-24 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-white">
        {topBar}
        <div className="shop-container flex flex-col items-center py-32 text-center">
          <PackageOpen size={48} className="text-stone-300" />
          <h1 className="mt-6 text-2xl font-extrabold text-ink">Boutique introuvable</h1>
          <p className="mt-2 max-w-sm text-ink-muted">Ce lien n’est plus valide ou la boutique n’est pas encore ouverte.</p>
          <button onClick={() => navigate('/')} className="shop-btn-dark mt-8">
            Découvrir FestiSolde <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      {topBar}

      {/* Bannière */}
      <div className="shop-container pt-4">
        <div className="relative h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-ink sm:h-52 md:h-72">
          {store.banner_url && <img src={store.banner_url} alt="" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>

      {/* Identité boutique */}
      <div className="shop-container">
        <div className="flex flex-col gap-5 border-b border-stone-100 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4 pl-4 md:pl-8">
            <div className="relative z-10 -mt-10 h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-stone-100 shadow-lift md:-mt-14 md:h-32 md:w-32">
              {store.logo_url ? (
                <img src={store.logo_url} alt={`Logo ${store.name}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-ink text-3xl font-extrabold text-white">
                  {store.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                <span className="truncate">{store.name}</span>
                {store.is_verified && (
                  <BadgeCheck size={22} className="shrink-0 text-orange-600" aria-label="Boutique vérifiée" />
                )}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {products.length} article{products.length > 1 ? 's' : ''}
                {store.is_verified ? ' · Vendeur vérifié' : ''}
              </p>
              {festivalStand && (
                <Link to="/festival" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white hover:bg-ink-soft">
                  <PartyPopper size={13} className="text-orange-400" /> Exposant Festival FestiSolde · {festivalStand}
                </Link>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour ${store.name}, je viens de votre boutique FestiSolde.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shop-btn flex-1 bg-[#25D366] text-white hover:bg-[#1fb857] md:flex-none"
              >
                <MessageCircle size={18} /> Contacter
              </a>
            )}
            <button onClick={handleShare} className="shop-btn-ghost flex-1 md:flex-none">
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              {copied ? 'Lien copié' : 'Partager'}
            </button>
          </div>
        </div>

        {store.description && (
          <p className="max-w-3xl pt-6 text-[15px] leading-relaxed text-ink-soft">{store.description}</p>
        )}

        {/* Filtres */}
        {products.length > 0 && (
          <div className="sticky top-14 z-30 -mx-4 mt-6 flex flex-col gap-3 bg-white/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    category === c ? 'bg-ink text-white' : 'bg-stone-100 text-ink-soft hover:bg-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher dans la boutique"
                aria-label="Rechercher dans la boutique"
                className="shop-input rounded-full py-2.5 pl-10"
              />
            </div>
          </div>
        )}

        {/* Produits */}
        <div className="pb-28 pt-6">
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-200 py-20 text-center">
              <PackageOpen size={40} className="mx-auto text-stone-300" />
              <p className="mt-4 font-semibold text-ink">
                {products.length === 0 ? 'La boutique prépare ses premiers articles.' : 'Aucun article ne correspond.'}
              </p>
              {products.length > 0 && (
                <button onClick={() => { setCategory('Tout'); setQuery(''); }} className="mt-3 text-sm font-bold text-orange-600">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-stone-100 bg-stone-50">
        <div className="shop-container flex flex-col items-center gap-3 py-10 text-center text-sm text-ink-muted md:flex-row md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} {store.name}</p>
          <Link to="/" className="inline-flex items-center gap-2 font-semibold hover:text-ink">
            Boutique propulsée par <img src="/logo-festisolde.png" alt="FestiSolde" className="h-5 w-auto" />
          </Link>
        </div>
      </footer>

      {/* Panier flottant (mobile) */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
          <button onClick={() => navigate('/panier')} className="shop-btn-primary w-full justify-between rounded-2xl px-5 py-4 text-[15px]">
            <span className="flex items-center gap-2">
              <ShoppingBag size={20} /> Voir mon panier
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-sm">{cartCount}</span>
          </button>
        </div>
      )}
    </div>
  );
}
