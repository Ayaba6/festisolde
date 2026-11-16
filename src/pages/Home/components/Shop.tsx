import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal } from 'lucide-react';

import Header from './Header';
import Footer from './Footer';
import { ProductCard, ProductCardSkeleton, } from '../../Store/ProductCard';
import { unitPrice } from '../../../context/CartContext';

type SortKey = 'recent' | 'price_asc' | 'price_desc' | 'promo';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'Tous';
  const searchFromUrl = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [sort, setSort] = useState<SortKey>('recent');

  // La recherche lancée depuis l'en-tête arrive par l'URL.
  useEffect(() => { setSearchQuery(searchFromUrl); }, [searchFromUrl]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, stores(name, slug, status)')
        .order('created_at', { ascending: false });
      if (!error) setProducts((data || []).filter((p) => p.stores?.status !== 'hidden'));
      else console.error('Erreur de chargement:', error);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(
    () => ['Tous', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'Tous') next.delete('category'); else next.set('category', cat);
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesSearch = !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchesCategory = categoryFromUrl === 'Tous' || p.category === categoryFromUrl;
      return matchesSearch && matchesCategory;
    });
    const isPromo = (p: any) => Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price);
    if (sort === 'price_asc') list.sort((a, b) => unitPrice(a) - unitPrice(b));
    if (sort === 'price_desc') list.sort((a, b) => unitPrice(b) - unitPrice(a));
    if (sort === 'promo') return list.filter(isPromo);
    return list;
  }, [products, searchQuery, categoryFromUrl, sort]);

  const title = searchFromUrl
    ? `Résultats pour « ${searchFromUrl} »`
    : categoryFromUrl !== 'Tous' ? categoryFromUrl : 'Tout le catalogue';

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="shop-container pb-20 pt-8 md:pt-12">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-ink-muted">
            {loading ? 'Chargement…' : `${filtered.length} article${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filtres */}
        <div className="z-30 -mx-4 mb-8 flex flex-col gap-3 border-b border-stone-100 bg-white/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 md:sticky md:top-[10.25rem] md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categoryFromUrl === cat ? 'bg-ink text-white' : 'bg-stone-100 text-ink-soft hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-soft">
            <SlidersHorizontal size={16} />
            <span className="sr-only">Trier par</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-stone-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-ink outline-none focus:border-orange-500"
            >
              <option value="recent">Plus récents</option>
              <option value="promo">En promotion</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-200 py-20 text-center">
            <SearchX size={40} className="text-stone-300" />
            <h2 className="mt-4 text-lg font-bold">Aucun produit trouvé</h2>
            <p className="mt-1 text-ink-muted">Essayez une autre catégorie ou un autre mot-clé.</p>
            <button
              onClick={() => { setSearchQuery(''); setSort('recent'); setSearchParams({}); }}
              className="shop-btn-ghost mt-6"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
