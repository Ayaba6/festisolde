import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Flame, Search, PackageOpen } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { ProductCard, ProductCardSkeleton } from '../../Store/ProductCard';

const discountOf = (p: any) => {
  const price = Number(p.price) || 0;
  const sale = Number(p.sale_price) || 0;
  return price > 0 && sale > 0 && sale < price ? (price - sale) / price : 0;
};

export default function Liquidation() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, stores(name, slug, status)')
        .ilike('category', 'Liquidation')
        .order('created_at', { ascending: false });
      // Les plus fortes réductions d'abord
      const list = (data || []).filter((p) => p.stores?.status !== 'hidden');
      list.sort((a, b) => discountOf(b) - discountOf(a));
      setProducts(list);
      setLoading(false);
    })();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => p.name?.toLowerCase().includes(q) || p.stores?.name?.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const bestDiscount = Math.round(Math.max(0, ...products.map(discountOf)) * 100);

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      <section className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
        <div className="shop-container flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Flame size={14} /> Liquidation de stock
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Derniers stocks, prix cassés</h1>
            <p className="mt-3 text-lg text-white/85">
              Fins de séries et déstockages : quand c’est parti, c’est parti.
              {bestDiscount > 0 && <> Jusqu’à <strong>-{bestDiscount} %</strong> en ce moment.</>}
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produit ou boutique"
              aria-label="Rechercher dans la liquidation"
              className="shop-input rounded-full border-transparent py-3 pl-11"
            />
          </div>
        </div>
      </section>

      <main className="shop-container py-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : visible.length > 0 ? (
          <>
            <p className="mb-6 text-ink-muted">{visible.length} article{visible.length > 1 ? 's' : ''} en liquidation</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {visible.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-200 py-20 text-center">
            <PackageOpen size={40} className="text-stone-300" />
            <p className="mt-4 text-lg font-bold">Pas de liquidation en cours</p>
            <p className="mt-1 text-ink-muted">Découvrez les autres promotions du moment.</p>
            <Link to="/products" className="shop-btn-dark mt-6">Voir le catalogue</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
