import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, Users, Download, Search, ShoppingBag, Clock, FileText, Info, Loader2, MapPin, Receipt } from 'lucide-react';
import { PageHeader, StatCard, Card, StatusBadge, EmptyState, PageLoader, Modal, Field, formatF } from '../../components/vendor/ui';
import { lineUnitPrice, orderReference, ordersToCsv, downloadCsv } from '../../lib/orders';

// La bibliothèque PDF n'est chargée qu'à l'ouverture d'une facture.
const InvoiceDownload = lazy(() => import('./InvoiceDownload'));

const COMMISSION = 0.1;
const STATUS_OPTIONS = [
  ['nouveau', 'Nouveau'],
  ['en cours', 'En cours'],
  ['livré', 'Livré'],
  ['annulé', 'Annulé'],
];

export default function Revenues() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [balance, setBalance] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchSalesData(); }, []);

  async function fetchSalesData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
      if (store) {
        const [{ data: wallet }, { data: salesData }] = await Promise.all([
          supabase.from('wallets').select('balance').eq('store_id', store.id).maybeSingle(),
          supabase.from('orders').select('*').eq('store_id', store.id).order('created_at', { ascending: false }),
        ]);
        setBalance(Number(wallet?.balance) || 0);
        setSales(salesData || []);
      }
    }
    setLoading(false);
  }

  const flash = (type: 'ok' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleStatusChange = async (order: any, newStatus: string) => {
    if (newStatus === 'annulé' && !window.confirm('Annuler cette commande ? Le stock des articles sera remis en vente.')) return;
    const previous = sales;
    setSales((list) => list.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    if (error) {
      setSales(previous);
      flash('error', error.message);
    } else {
      fetchSalesData(); // le solde peut avoir changé (commande payée livrée)
    }
  };

  const stats = useMemo(() => {
    const valid = sales.filter((s) => s.status !== 'annulé');
    const total = valid.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
    return {
      total,
      count: valid.length,
      customers: new Set(valid.map((s) => s.customer_phone)).size,
      average: valid.length ? total / valid.length : 0,
    };
  }, [sales]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return sales.filter(
      (s) =>
        (statusFilter === 'tous' || s.status === statusFilter) &&
        (!q || s.customer_name?.toLowerCase().includes(q) || s.customer_phone?.includes(q) || orderReference(s).toLowerCase().includes(q))
    );
  }, [sales, searchTerm, statusFilter]);

  if (loading) return <PageLoader label="Chargement de vos ventes…" />;

  return (
    <div>
      <PageHeader
        title="Ventes & finances"
        subtitle="Vos commandes, votre solde et vos retraits."
        actions={
          <>
            <Link to="/withdrawal-history" className="shop-btn-ghost"><Clock size={18} /> Mes retraits</Link>
            <button onClick={() => setShowExport(true)} className="shop-btn-ghost"><Download size={18} /> Exporter</button>
          </>
        }
      />

      {notice && (
        <p className={`mb-6 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`} role="status">
          {notice.text}
        </p>
      )}

      {/* Solde */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-ink p-6 text-white md:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-600/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-300">Solde disponible</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">{formatF(balance)}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-400">
              <Info size={14} /> Crédité quand une commande payée en ligne est livrée.
            </p>
          </div>
          <button onClick={() => setShowWithdraw(true)} disabled={balance < 500} className="shop-btn-primary px-7 py-3.5 text-[15px]">
            <Wallet size={18} /> Retirer mon argent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Chiffre d’affaires" value={formatF(stats.total)} hint="Hors annulées" icon={TrendingUp} tone="green" />
        <StatCard label="Commandes" value={stats.count} icon={ShoppingBag} tone="orange" />
        <StatCard label="Panier moyen" value={formatF(stats.average)} icon={Receipt} />
        <StatCard label="Clients" value={stats.customers} icon={Users} tone="blue" />
      </div>

      {/* Commandes */}
      <div className="mt-10 mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[['tous', 'Toutes'], ...STATUS_OPTIONS].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${statusFilter === key ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-stone-200 hover:bg-stone-50'}`}
            >
              {label} <span className="opacity-60">{key === 'tous' ? sales.length : sales.filter((s) => s.status === key).length}</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="search" placeholder="Client, téléphone, référence" aria-label="Rechercher une commande" className="shop-input py-2.5 pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {sales.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Aucune commande pour l’instant" text="Vos commandes apparaîtront ici dès qu’un client achètera dans votre boutique." />
      ) : (
        <Card as="ul" className="divide-y divide-stone-100">
          {filtered.map((sale) => (
            <li key={sale.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-ink-soft sm:flex">
                  {sale.customer_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{sale.customer_name}</p>
                  <p className="text-sm text-ink-muted">
                    #{orderReference(sale)} · {new Date(sale.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} ·{' '}
                    <a href={`tel:${sale.customer_phone}`} className="hover:text-orange-600">{sale.customer_phone}</a>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-left md:text-right">
                  <p className="font-bold text-ink">{formatF(sale.total_amount)}</p>
                  {sale.payment_status === 'paye' ? (
                    <p className="text-xs font-bold text-green-700">Payé en ligne</p>
                  ) : (
                    <p className="text-xs text-ink-muted">À encaisser</p>
                  )}
                </div>
                <select
                  value={sale.status || 'nouveau'}
                  onChange={(e) => handleStatusChange(sale, e.target.value)}
                  aria-label={`Statut de la commande ${orderReference(sale)}`}
                  className="rounded-xl border border-stone-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-ink outline-none focus:border-orange-500"
                >
                  {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button onClick={() => setSelectedOrder(sale)} className="rounded-xl p-2.5 text-ink-muted hover:bg-stone-100 hover:text-ink" aria-label="Voir le détail">
                  <FileText size={18} />
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className="p-8 text-center text-ink-muted">Aucune commande ne correspond.</li>}
        </Card>
      )}

      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          onClose={() => setShowWithdraw(false)}
          onDone={() => { setShowWithdraw(false); flash('ok', 'Demande de retrait envoyée. Vous serez payé après validation.'); fetchSalesData(); }}
        />
      )}
      {showExport && <ExportModal sales={sales} onClose={() => setShowExport(false)} />}
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

function WithdrawModal({ balance, onClose, onDone }: any) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Orange Money');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const value = parseFloat(amount) || 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (value < 500) return setError('Le montant minimum est de 500 FCFA.');
    if (value > balance) return setError('Montant supérieur à votre solde.');
    setBusy(true);
    const { error: rpcError } = await supabase.rpc('request_withdrawal', { p_amount: value, p_method: method, p_details: phone });
    setBusy(false);
    if (rpcError) return setError(rpcError.message);
    onDone();
  };

  return (
    <Modal title="Retirer mon argent" subtitle={`Solde disponible : ${formatF(balance)}`} onClose={onClose} size="max-w-md">
      <form onSubmit={submit} className="space-y-5 p-6">
        <Field label="Montant à retirer (FCFA)">
          <input type="number" min={500} max={balance} step={1} inputMode="numeric" required className="shop-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5 000" />
        </Field>
        {value >= 500 && (
          <dl className="space-y-1.5 rounded-2xl bg-stone-50 p-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Frais de service (10 %)</dt><dd>- {formatF(value * COMMISSION)}</dd></div>
            <div className="flex justify-between font-bold"><dt>Vous recevrez</dt><dd className="text-green-700">{formatF(value * (1 - COMMISSION))}</dd></div>
          </dl>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Réception par">
            <select className="shop-input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Orange Money</option>
              <option>Moov Money</option>
              <option>Wave</option>
            </select>
          </Field>
          <Field label="Numéro">
            <input type="tel" inputMode="tel" required className="shop-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="70 00 00 00" />
          </Field>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="shop-btn-primary w-full py-3.5">
          {busy && <Loader2 size={18} className="animate-spin" />} Confirmer la demande
        </button>
      </form>
    </Modal>
  );
}

function ExportModal({ sales, onClose }: any) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const selection = sales.filter((s: any) => {
    const d = new Date(s.created_at);
    if (from && d < new Date(from)) return false;
    if (to) { const end = new Date(to); end.setHours(23, 59, 59); if (d > end) return false; }
    return true;
  });
  const total = selection.filter((s: any) => s.status !== 'annulé').reduce((a: number, s: any) => a + (Number(s.total_amount) || 0), 0);

  return (
    <Modal title="Exporter mes ventes" subtitle="Fichier compatible Excel et Google Sheets" onClose={onClose} size="max-w-md">
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Du"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="shop-input" /></Field>
          <Field label="Au"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="shop-input" /></Field>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4 text-sm">
          <p><strong>{selection.length}</strong> commande{selection.length > 1 ? 's' : ''} · chiffre d’affaires <strong>{formatF(total)}</strong> (hors annulées)</p>
        </div>
        <button
          disabled={selection.length === 0}
          onClick={() => downloadCsv(`ventes-festisolde-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(selection))}
          className="shop-btn-dark w-full py-3.5"
        >
          <Download size={18} /> Télécharger le fichier
        </button>
      </div>
    </Modal>
  );
}

function OrderModal({ order, onClose }: any) {
  return (
    <Modal title={`Commande #${orderReference(order)}`} subtitle={new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })} onClose={onClose} size="max-w-lg">
      <div className="space-y-5 p-6">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          {order.payment_status === 'paye'
            ? <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">Payé en ligne</span>
            : <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-ink-soft">À encaisser à la livraison</span>}
        </div>

        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="font-bold text-ink">{order.customer_name}</p>
          <a href={`tel:${order.customer_phone}`} className="text-sm font-semibold text-orange-600">{order.customer_phone}</a>
          {order.customer_city && <p className="text-sm text-ink-muted">{order.customer_city}</p>}
          {order.customer_location && (
            <a href={order.customer_location} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-orange-600">
              <MapPin size={14} /> Voir la position GPS
            </a>
          )}
        </div>

        <ul className="divide-y divide-stone-100">
          {(order.items || []).map((item: any, i: number) => (
            <li key={i} className="flex justify-between gap-4 py-2.5 text-[15px]">
              <span className="min-w-0">
                <span className="font-semibold">{item.quantity} × {item.name}</span>
                {(item.size || item.selectedSize || item.color || item.selectedColor) && (
                  <span className="block text-sm text-ink-muted">
                    {[item.size || item.selectedSize, item.color || item.selectedColor].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-semibold">{formatF(lineUnitPrice(item) * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between border-t border-stone-100 pt-4">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-extrabold">{formatF(order.total_amount)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Suspense fallback={<button className="shop-btn-ghost w-full" disabled><Loader2 size={16} className="animate-spin" /> PDF</button>}>
            <InvoiceDownload order={order} />
          </Suspense>
          <a
            href={`https://wa.me/${String(order.customer_phone || '').replace(/[^\d]/g, '').replace(/^(?!226)(\d{8})$/, '226$1')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shop-btn w-full bg-[#25D366] text-white hover:bg-[#1fb857]"
          >
            Écrire au client
          </a>
        </div>
      </div>
    </Modal>
  );
}
