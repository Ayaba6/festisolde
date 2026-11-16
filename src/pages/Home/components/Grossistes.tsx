import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Store, Search, ArrowRight, BadgeCheck, Package, Truck } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const GROS_CATEGORIES = ['Grossistes', 'Grossiste'];

export default function Grossistes() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Boutiques ayant au moins un produit dans une catégorie "gros"
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, logo_url, banner_url, description, is_verified, status, products!inner(category)')
        .in('products.category', GROS_CATEGORIES)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const unique = Array.from(new Map(data.map((s) => [s.id, { ...s, count: 0 }])).values());
        data.forEach((s) => { const u = unique.find((x) => x.id === s.id); if (u) u.count += s.products?.length || 0; });
        setStores(unique.filter((s) => s.status !== 'hidden'));
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => stores.filter((s) => s.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())),
    [stores, searchTerm]
  );

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      <section className="bg-cream">
        <div className="shop-container flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-xl">
            <p className="shop-eyebrow">Vente en gros</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">Les grossistes FestiSolde</h1>
            <p className="mt-3 text-lg text-ink-soft">Achetez en lots, au meilleur prix, directement auprès des fournisseurs du Burkina.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Chercher un fournisseur"
              aria-label="Chercher un fournisseur"
              className="shop-input rounded-full py-3 pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="shop-container py-12">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-stone-100" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((store) => (
              <Link
                key={store.id}
                to={`/${store.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative h-28 bg-gradient-to-br from-orange-500 to-ink">
                  {store.banner_url && <img src={store.banner_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="flex flex-1 flex-col p-6 pt-0">
                  <span className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-stone-100 shadow-card">
                    {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store size={26} className="text-stone-400" />}
                  </span>
                  <h2 className="mt-4 flex items-center gap-1.5 text-lg font-bold">
                    <span className="truncate group-hover:text-orange-600">{store.name}</span>
                    {store.is_verified && <BadgeCheck size={18} className="shrink-0 text-orange-600" aria-label="Vérifié" />}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-[15px] text-ink-muted">
                    {store.description || 'Lots et arrivages en vente de gros.'}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                    <span className="font-semibold text-ink-soft">{store.count} lot{store.count > 1 ? 's' : ''} en gros</span>
                    <span className="flex items-center gap-1 font-bold text-orange-600">
                      Voir le catalogue <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-200 py-20 text-center">
            <Package size={40} className="text-stone-300" />
            <p className="mt-4 text-lg font-bold">Aucun grossiste pour le moment</p>
            <p className="mt-1 text-ink-muted">Revenez bientôt : de nouveaux fournisseurs arrivent régulièrement.</p>
          </div>
        )}

        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-ink p-8 text-white md:flex-row md:p-12">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Vous vendez en gros ?</h2>
            <p className="mt-2 text-stone-300">Ajoutez vos lots dans la catégorie « Grossistes » pour apparaître sur cette page.</p>
          </div>
          <Link to="/register" className="shop-btn-primary shrink-0 px-7 py-3.5">
            <Truck size={18} /> Ouvrir ma boutique
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
