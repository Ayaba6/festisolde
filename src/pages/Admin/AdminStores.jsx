import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Store, BadgeCheck, ChevronRight, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PageHeader, Card, EmptyState, PageLoader, formatF } from '../../components/vendor/ui';

const FILTERS = [
  ['toutes', 'Toutes'],
  ['actives', 'Actives'],
  ['suspendues', 'Suspendues'],
  ['verifiees', 'Vérifiées'],
  ['sans-whatsapp', 'Sans WhatsApp'],
  ['vides', 'Sans produit'],
];

export default function AdminStores() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filtre') || 'toutes';
  const [stores, setStores] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('stores')
        .select('id, name, slug, logo_url, status, is_verified, whatsapp_number, created_at, wallets(balance), products(count)')
        .order('created_at', { ascending: false });
      setStores(
        (data || []).map(({ wallets, products, ...s }) => ({
          ...s,
          balance: Number(Array.isArray(wallets) ? wallets[0]?.balance : wallets?.balance) || 0,
          productCount: products?.[0]?.count ?? 0,
        })),
      );
    })();
  }, []);

  const visible = useMemo(() => {
    if (!stores) return [];
    const q = query.trim().toLowerCase();
    return stores.filter((s) => {
      if (q && !`${s.name} ${s.slug} ${s.whatsapp_number || ''}`.toLowerCase().includes(q)) return false;
      if (filter === 'actives') return s.status !== 'hidden';
      if (filter === 'suspendues') return s.status === 'hidden';
      if (filter === 'verifiees') return s.is_verified;
      if (filter === 'sans-whatsapp') return !s.whatsapp_number && s.status !== 'hidden';
      if (filter === 'vides') return s.productCount === 0;
      return true;
    });
  }, [stores, query, filter]);

  if (!stores) return <PageLoader />;

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Boutiques" subtitle={`${stores.length} boutique${stores.length > 1 ? 's' : ''} inscrite${stores.length > 1 ? 's' : ''}`} />

      <div className="relative mb-4">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, adresse ou numéro"
          aria-label="Rechercher une boutique"
          className="shop-input rounded-full py-3 pl-11"
        />
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setParams(k === 'toutes' ? {} : { filtre: k })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === k ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-stone-200'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Store} title="Aucune boutique" text="Aucune boutique ne correspond à ce filtre." />
      ) : (
        <Card className="divide-y divide-stone-100 overflow-hidden">
          {visible.map((s) => (
            <Link key={s.id} to={`/admin/boutiques/${s.id}`} className="flex items-center gap-3 p-4 transition hover:bg-stone-50">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink text-sm font-bold text-white">
                {s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full object-cover" /> : s.name?.charAt(0)?.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="truncate">{s.name}</span>
                  {s.is_verified && <BadgeCheck size={16} className="shrink-0 text-orange-600" aria-label="Vérifiée" />}
                  {s.status === 'hidden' && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                      <EyeOff size={12} /> Suspendue
                    </span>
                  )}
                </span>
                <span className="block truncate text-sm text-ink-muted">
                  {s.productCount} produit{s.productCount > 1 ? 's' : ''} · inscrite le {new Date(s.created_at).toLocaleDateString('fr-FR')}
                  {!s.whatsapp_number && <span className="text-red-600"> · pas de WhatsApp</span>}
                </span>
              </span>
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-bold">{formatF(s.balance)}</span>
                <span className="block text-xs text-ink-muted">solde</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-stone-300" />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
