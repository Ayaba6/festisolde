import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Wallet, Store, Package, AlertTriangle, Clock, PartyPopper, MessageCircleOff, ChevronRight, RefreshCw, PackageX,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PageHeader, Card, SectionTitle, StatCard, PageLoader, formatF } from '../../components/vendor/ui';

const PERIODS = [['today', 'Aujourd’hui'], ['week', '7 jours'], ['month', '30 jours']];

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');

  const load = async () => {
    setError('');
    const { data: d, error: err } = await supabase.rpc('admin_overview');
    if (err) setError(err.message);
    else setData(d);
  };

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <Card className="p-6">
        <p className="font-bold text-red-700">Impossible de charger le tableau de bord.</p>
        <p className="mt-1 text-sm text-ink-muted">{error}</p>
        <p className="mt-3 text-sm text-ink-muted">Si le message parle de « admin_overview », la migration 20261121000000_admin_pilotage.sql n’est pas encore exécutée.</p>
      </Card>
    );
  }
  if (!data) return <PageLoader />;

  const { orders, revenue, stores, products, todo, money, series } = data;
  const todos = [
    todo.withdrawals > 0 && { to: '/admin/retraits', icon: Wallet, tone: 'bg-orange-50 text-orange-900', text: `${todo.withdrawals} retrait${todo.withdrawals > 1 ? 's' : ''} à valider (${formatF(todo.withdrawals_amount)})` },
    todo.stuck_orders > 0 && { to: '/admin/commandes?filtre=bloquees', icon: Clock, tone: 'bg-red-50 text-red-900', text: `${todo.stuck_orders} commande${todo.stuck_orders > 1 ? 's' : ''} non traitée${todo.stuck_orders > 1 ? 's' : ''} depuis plus de 48 h` },
    todo.stands_unpaid > 0 && { to: '/admin/festival', icon: PartyPopper, tone: 'bg-amber-50 text-amber-900', text: `${todo.stands_unpaid} stand${todo.stands_unpaid > 1 ? 's' : ''} réservé${todo.stands_unpaid > 1 ? 's' : ''} sans acompte` },
    todo.stands_balance > 0 && { to: '/admin/festival', icon: PartyPopper, tone: 'bg-sky-50 text-sky-900', text: `${todo.stands_balance} stand${todo.stands_balance > 1 ? 's' : ''} avec solde à encaisser` },
    stores.no_whatsapp > 0 && { to: '/admin/boutiques?filtre=sans-whatsapp', icon: MessageCircleOff, tone: 'bg-stone-100 text-ink', text: `${stores.no_whatsapp} boutique${stores.no_whatsapp > 1 ? 's' : ''} sans numéro WhatsApp (commandes perdues)` },
    stores.no_product > 0 && { to: '/admin/boutiques?filtre=vides', icon: PackageX, tone: 'bg-stone-100 text-ink', text: `${stores.no_product} boutique${stores.no_product > 1 ? 's' : ''} sans aucun produit` },
  ].filter(Boolean);

  const max = Math.max(1, ...series.map((d) => Number(d.revenue)));
  const periodLabel = PERIODS.find(([k]) => k === period)[1].toLowerCase();

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Vue d’ensemble"
        subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          <button onClick={() => { setData(null); load(); }} className="shop-btn-ghost">
            <RefreshCw size={16} /> Actualiser
          </button>
        }
      />

      {/* À traiter */}
      <SectionTitle>À traiter</SectionTitle>
      {todos.length > 0 ? (
        <div className="mb-8 grid gap-2 md:grid-cols-2">
          {todos.map(({ to, icon: Icon, tone, text }) => (
            <Link key={text} to={to} className={`flex items-center gap-3 rounded-2xl p-4 transition hover:brightness-95 ${tone}`}>
              <Icon size={20} className="shrink-0" aria-hidden="true" />
              <span className="flex-1 text-[15px] font-semibold">{text}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mb-8 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">Rien d’urgent : tout est à jour.</p>
      )}

      {/* Activité */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Activité</h2>
        <div className="flex rounded-full bg-white p-1 ring-1 ring-stone-200" role="tablist" aria-label="Période">
          {PERIODS.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={period === k}
              onClick={() => setPeriod(k)}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ${period === k ? 'bg-ink text-white' : 'text-ink-muted'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Commandes" value={orders[period]} hint={`${orders.total} au total`} icon={ShoppingBag} tone="orange" to="/admin/commandes" />
        <StatCard label="Ventes des boutiques" value={formatF(revenue[period])} hint={`sur ${periodLabel}, hors annulations`} icon={Wallet} tone="green" />
        <StatCard label="Boutiques" value={stores.total} hint={`+${stores.new_week} cette semaine · ${stores.hidden} suspendue${stores.hidden > 1 ? 's' : ''}`} icon={Store} tone="blue" to="/admin/boutiques" />
        <StatCard label="Produits" value={products.total} hint={`+${products.new_week} cette semaine · ${products.out_of_stock} épuisé${products.out_of_stock > 1 ? 's' : ''}`} icon={Package} />
      </div>

      {/* Courbe 30 jours */}
      <Card className="mt-6 p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">Ventes des 30 derniers jours</h2>
          <p className="text-sm text-ink-muted">{formatF(revenue.month)} · {orders.month} commandes</p>
        </div>
        <div className="mt-5 flex h-40 items-end gap-[3px]" role="img" aria-label="Ventes par jour sur 30 jours">
          {series.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-[3px] ${Number(d.revenue) > 0 ? 'bg-orange-500 group-hover:bg-orange-600' : 'bg-stone-100'}`}
                style={{ height: `${Math.max(3, (Number(d.revenue) / max) * 100)}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-semibold text-white group-hover:block">
                {new Date(d.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {d.orders} cmd · {formatF(d.revenue)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-muted">
          <span>{new Date(series[0]?.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          <span>Aujourd’hui</span>
        </div>
      </Card>

      {/* Argent */}
      <div className="mt-8"><SectionTitle>Argent</SectionTitle></div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Soldes des vendeurs" value={formatF(money.wallets)} hint="dû aux vendeurs" icon={Wallet} />
        <StatCard label="Retraits versés" value={formatF(money.withdrawn)} hint="depuis le début" icon={Wallet} to="/admin/retraits" />
        <StatCard label="Commissions" value={formatF(money.commissions)} hint="10 % des retraits" icon={Wallet} tone="green" />
        <StatCard label="Stands encaissés" value={formatF(money.stands)} hint="festival" icon={PartyPopper} tone="orange" to="/admin/festival" />
      </div>

      {stores.verified === 0 && stores.total > 0 && (
        <p className="mt-8 flex items-start gap-2 rounded-2xl bg-stone-100 p-4 text-sm text-ink-soft">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          Aucune boutique n’est certifiée. Le badge « Vérifié » rassure les clients : attribuez-le depuis la fiche d’une boutique.
        </p>
      )}
    </div>
  );
}
