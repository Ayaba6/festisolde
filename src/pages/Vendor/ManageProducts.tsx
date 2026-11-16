import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil, Package, Search, ExternalLink } from 'lucide-react';
import AddProductModal from './AddProductModal';
import { PageHeader, Card, EmptyState, PageLoader, formatF } from '../../components/vendor/ui';

const priceOf = (p: any) => (Number(p.sale_price) > 0 ? Number(p.sale_price) : Number(p.price) || 0);

function StockPill({ stock }: { stock: number | null }) {
  if (stock === null || stock === undefined) return <span className="text-sm text-ink-muted">—</span>;
  const cls = stock <= 0 ? 'bg-red-50 text-red-700' : stock <= 2 ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-ink-soft';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{stock <= 0 ? 'Épuisé' : `${stock} en stock`}</span>;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
        if (store) {
          setStoreId(store.id);
          await fetchProducts(store.id);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts(sId = storeId) {
    if (!sId) return;
    const { data } = await supabase.from('products').select('*').eq('store_id', sId).order('created_at', { ascending: false });
    setProducts(data || []);
  }

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Supprimer « ${p.name} » ? Cette action est définitive.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) return alert('Suppression impossible : ' + error.message);
    setProducts((list) => list.filter((x) => x.id !== p.id));
  };

  const openNew = () => { setEditingProduct(null); setIsModalOpen(true); };
  const openEdit = (p: any) => { setEditingProduct(p); setIsModalOpen(true); };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name?.toLowerCase().includes(q)) return false;
      const s = p.stock_quantity;
      if (filter === 'low') return s !== null && s > 0 && s <= 2;
      if (filter === 'out') return s !== null && s <= 0;
      return true;
    });
  }, [products, query, filter]);

  if (loading) return <PageLoader label="Chargement de vos produits…" />;

  const counts = {
    all: products.length,
    low: products.filter((p) => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= 2).length,
    out: products.filter((p) => p.stock_quantity !== null && p.stock_quantity <= 0).length,
  };

  return (
    <div>
      <PageHeader
        title="Mes produits"
        subtitle={`${products.length} article${products.length > 1 ? 's' : ''} en vente`}
        actions={<button onClick={openNew} className="shop-btn-primary"><Plus size={18} /> Ajouter un produit</button>}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Votre boutique est vide"
          text="Ajoutez votre premier produit avec quelques photos : il sera visible tout de suite sur FestiSolde."
          action={<button onClick={openNew} className="shop-btn-primary"><Plus size={18} /> Ajouter un produit</button>}
        />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {([
                ['all', 'Tous'],
                ['low', 'Stock faible'],
                ['out', 'Épuisés'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === key ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-stone-200 hover:bg-stone-50'}`}
                >
                  {label} <span className="opacity-60">{counts[key]}</span>
                </button>
              ))}
            </div>
            <div className="relative sm:w-72">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit" className="shop-input py-2.5 pl-10" aria-label="Rechercher un produit" />
            </div>
          </div>

          {/* Mobile : cartes */}
          <ul className="space-y-3 md:hidden">
            {visible.map((p) => (
              <Card as="li" key={p.id} className="flex items-center gap-3 p-3">
                <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{p.name}</p>
                  <p className="text-sm font-bold text-ink">{formatF(priceOf(p))}</p>
                  <div className="mt-1"><StockPill stock={p.stock_quantity} /></div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-lg p-2.5 text-ink-soft hover:bg-stone-100" aria-label={`Modifier ${p.name}`}><Pencil size={17} /></button>
                  <button onClick={() => handleDelete(p)} className="rounded-lg p-2.5 text-ink-soft hover:bg-red-50 hover:text-red-600" aria-label={`Supprimer ${p.name}`}><Trash2 size={17} /></button>
                </div>
              </Card>
            ))}
          </ul>

          {/* Bureau : tableau */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-left">
              <thead className="border-b border-stone-100 bg-stone-50/60 text-sm text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Produit</th>
                  <th className="px-5 py-3 font-semibold">Prix</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Ventes</th>
                  <th className="px-5 py-3 font-semibold">Vues</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((p) => {
                  const promo = Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price);
                  return (
                    <tr key={p.id} className="transition hover:bg-stone-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                            {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-xs truncate font-semibold text-ink">{p.name}</p>
                            <p className="text-sm text-ink-muted">{p.category || 'Sans catégorie'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-ink">{formatF(priceOf(p))}</p>
                        {promo && <p className="text-sm text-stone-400 line-through">{formatF(p.price)}</p>}
                      </td>
                      <td className="px-5 py-3"><StockPill stock={p.stock_quantity} /></td>
                      <td className="px-5 py-3 text-ink-soft">{p.sold_count || 0}</td>
                      <td className="px-5 py-3 text-ink-soft">{p.views || 0}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/produit/${p.id}`} target="_blank" className="rounded-lg p-2 text-ink-muted hover:bg-stone-100 hover:text-ink" aria-label={`Voir ${p.name}`}><ExternalLink size={17} /></Link>
                          <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-ink-muted hover:bg-stone-100 hover:text-ink" aria-label={`Modifier ${p.name}`}><Pencil size={17} /></button>
                          <button onClick={() => handleDelete(p)} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600" aria-label={`Supprimer ${p.name}`}><Trash2 size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {visible.length === 0 && <p className="py-10 text-center text-ink-muted">Aucun produit ne correspond.</p>}
        </>
      )}

      {isModalOpen && (
        <AddProductModal
          storeId={storeId}
          productToEdit={editingProduct}
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
          onRefresh={() => fetchProducts()}
        />
      )}
    </div>
  );
}
