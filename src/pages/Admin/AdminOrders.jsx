import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Download, MessageCircle, MapPin, Store } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { cleanPhone } from '../../lib/whatsapp';
import { orderReference, lineUnitPrice, ordersToCsv, downloadCsv } from '../../lib/orders';
import { PageHeader, Card, EmptyState, PageLoader, StatusBadge, Modal, formatF } from '../../components/vendor/ui';

const LIMIT = 300; // shortcut: les 300 dernières commandes, à paginer quand le volume grandira

const FILTERS = [
  ['toutes', 'Toutes'],
  ['a-traiter', 'À traiter'],
  ['bloquees', 'Bloquées +48 h'],
  ['livrees', 'Livrées'],
  ['annulees', 'Annulées'],
  ['payees', 'Payées en ligne'],
];
const H48 = 48 * 3600 * 1000;

const waLink = (raw, text) => {
  let p = cleanPhone(raw || '');
  if (!p) return null;
  if (p.length === 8) p = `226${p}`;
  return `https://wa.me/${p}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filtre') || 'toutes';
  const storeFilter = params.get('boutique');
  const [orders, setOrders] = useState(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from('orders')
        .select('*, stores(id, name, slug, whatsapp_number)')
        .order('created_at', { ascending: false })
        .limit(LIMIT);
      if (storeFilter) q = q.eq('store_id', storeFilter);
      const { data } = await q;
      setOrders(data || []);
    })();
  }, [storeFilter]);

  const visible = useMemo(() => {
    if (!orders) return [];
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return orders.filter((o) => {
      if (q && !`${orderReference(o)} ${o.customer_name} ${o.customer_phone} ${o.stores?.name}`.toLowerCase().includes(q)) return false;
      const open = ['nouveau', 'en_attente'].includes(o.status);
      if (filter === 'a-traiter') return open || o.status === 'en cours';
      if (filter === 'bloquees') return open && now - new Date(o.created_at).getTime() > H48;
      if (filter === 'livrees') return o.status === 'livré';
      if (filter === 'annulees') return o.status === 'annulé';
      if (filter === 'payees') return o.payment_status === 'paye';
      return true;
    });
  }, [orders, query, filter]);

  if (!orders) return <PageLoader />;

  const total = visible.filter((o) => o.status !== 'annulé').reduce((n, o) => n + Number(o.total_amount || 0), 0);
  const setFilter = (k) => {
    const next = new URLSearchParams(params);
    if (k === 'toutes') next.delete('filtre'); else next.set('filtre', k);
    setParams(next);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Commandes"
        subtitle={`${visible.length} commande${visible.length > 1 ? 's' : ''} · ${formatF(total)} hors annulations`}
        actions={
          <button
            onClick={() => downloadCsv(`commandes-festisolde-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(visible))}
            disabled={visible.length === 0}
            className="shop-btn-ghost"
          >
            <Download size={16} /> Export CSV
          </button>
        }
      />

      {storeFilter && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-sky-50 p-3 text-sm font-semibold text-sky-900">
          <Store size={16} /> Commandes de {orders[0]?.stores?.name || 'cette boutique'}
          <button onClick={() => { const n = new URLSearchParams(params); n.delete('boutique'); setParams(n); }} className="underline">
            Voir toutes les boutiques
          </button>
        </p>
      )}

      <div className="relative mb-4">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Référence, client, téléphone ou boutique"
          aria-label="Rechercher une commande"
          className="shop-input rounded-full py-3 pl-11"
        />
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === k ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-stone-200'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Aucune commande" text="Aucune commande ne correspond à ce filtre." />
      ) : (
        <Card className="divide-y divide-stone-100 overflow-hidden">
          {visible.map((o) => {
            const late = ['nouveau', 'en_attente'].includes(o.status) && Date.now() - new Date(o.created_at).getTime() > H48;
            return (
              <button key={o.id} onClick={() => setOpen(o)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-stone-50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{o.customer_name} <span className="font-normal text-ink-muted">· {o.stores?.name}</span></span>
                  <span className="block text-xs text-ink-muted">
                    #{orderReference(o)} · {new Date(o.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {late && <span className="font-bold text-red-600"> · en attente depuis +48 h</span>}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold">{formatF(o.total_amount)}</span>
                  <span className="mt-1 flex justify-end gap-1">
                    {o.payment_status === 'paye' && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Payé</span>}
                    <StatusBadge status={o.status} />
                  </span>
                </span>
              </button>
            );
          })}
        </Card>
      )}
      {orders.length === LIMIT && <p className="mt-3 text-center text-xs text-ink-muted">Affichage des {LIMIT} commandes les plus récentes.</p>}

      {open && <OrderModal order={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OrderModal({ order, onClose }) {
  const ref = orderReference(order);
  const clientWa = waLink(order.customer_phone, `Bonjour ${order.customer_name}, c'est FestiSolde au sujet de votre commande #${ref}.`);
  const storeWa = waLink(order.stores?.whatsapp_number, `Bonjour ${order.stores?.name}, c'est FestiSolde au sujet de la commande #${ref} de ${order.customer_name}.`);
  // La position est enregistrée sous forme de lien Google Maps.
  const gps = typeof order.customer_location === 'string' && /^https:\/\//.test(order.customer_location) ? order.customer_location : null;

  return (
    <Modal title={`Commande #${ref}`} subtitle={new Date(order.created_at).toLocaleString('fr-FR')} onClose={onClose}>
      <div className="space-y-5 p-6">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${order.payment_status === 'paye' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-ink-soft'}`}>
            {order.payment_status === 'paye' ? 'Payée en ligne' : 'Paiement à la livraison'}
          </span>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-ink-muted">Client</dt><dd className="font-semibold">{order.customer_name}</dd></div>
          <div><dt className="text-ink-muted">Téléphone</dt><dd className="font-semibold">{order.customer_phone}</dd></div>
          <div><dt className="text-ink-muted">Ville / quartier</dt><dd className="font-semibold">{order.customer_city || '—'}</dd></div>
          <div>
            <dt className="text-ink-muted">Boutique</dt>
            <dd className="font-semibold">
              {order.stores?.id ? <Link to={`/admin/boutiques/${order.stores.id}`} onClick={onClose} className="text-orange-700 underline">{order.stores.name}</Link> : '—'}
            </dd>
          </div>
        </dl>

        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {(order.items || []).map((i, k) => (
            <li key={k} className="flex justify-between gap-3 p-3 text-sm">
              <span>{i.quantity} × {i.name}{i.size ? ` (${i.size})` : ''}</span>
              <span className="font-semibold">{formatF(lineUnitPrice(i) * (i.quantity || 1))}</span>
            </li>
          ))}
          <li className="flex justify-between p-3 font-bold"><span>Total</span><span>{formatF(order.total_amount)}</span></li>
        </ul>

        <div className="grid gap-2 sm:grid-cols-3">
          {clientWa && <a href={clientWa} target="_blank" rel="noopener noreferrer" className="shop-btn bg-[#25d366] text-sm text-ink"><MessageCircle size={16} /> Client</a>}
          {storeWa && <a href={storeWa} target="_blank" rel="noopener noreferrer" className="shop-btn border border-stone-200 text-sm"><MessageCircle size={16} /> Vendeur</a>}
          {gps && <a href={gps} target="_blank" rel="noopener noreferrer" className="shop-btn border border-stone-200 text-sm"><MapPin size={16} /> Position</a>}
        </div>
      </div>
    </Modal>
  );
}
