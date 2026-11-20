import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, EyeOff, Eye, ExternalLink, MessageCircle, Mail, Trash2, Package, ShoppingBag, Wallet, PartyPopper, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { cleanPhone } from '../../lib/whatsapp';
import { removeProductImages } from '../../lib/storage';
import { orderReference } from '../../lib/orders';
import { Card, SectionTitle, StatCard, StatusBadge, PageLoader, formatF } from '../../components/vendor/ui';

const STAND = { reserve: 'Réservé, non payé', acompte: 'Acompte payé', paye: 'Payé', annule: 'Annulé' };
const dateFr = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function AdminStoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [detail, setDetail] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState('');
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const [{ data: s }, { data: d }, { data: o }, { data: p }] = await Promise.all([
      supabase.from('stores').select('*').eq('id', storeId).maybeSingle(),
      supabase.rpc('admin_store_detail', { p_store_id: storeId }),
      supabase.from('orders').select('id, customer_name, total_amount, status, payment_status, created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('id, name, price, sale_price, stock_quantity, image_url, images').eq('store_id', storeId).order('created_at', { ascending: false }),
    ]);
    if (!s) setNotFound(true);
    setStore(s);
    setDetail(d || {});
    setOrders(o || []);
    setProducts(p || []);
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const update = async (patch, label) => {
    setBusy(label);
    const { error } = await supabase.from('stores').update(patch).eq('id', storeId);
    setBusy('');
    if (error) return window.alert(error.message);
    setStore((s) => ({ ...s, ...patch }));
  };

  const toggleSuspend = () => {
    const suspended = store.status === 'hidden';
    const msg = suspended
      ? `Réactiver « ${store.name} » ? La boutique et ses produits redeviennent visibles.`
      : `Suspendre « ${store.name} » ? La boutique et ses produits disparaissent du site (le vendeur garde l’accès à son espace).`;
    if (window.confirm(msg)) update({ status: suspended ? 'active' : 'hidden' }, 'suspend');
  };

  const deleteStore = async () => {
    const typed = window.prompt(`Suppression DÉFINITIVE de « ${store.name} », de ses ${products.length} produits et de leurs photos.\nCette action est irréversible.\n\nTapez le nom de la boutique pour confirmer :`);
    if (typed === null) return;
    if (typed.trim() !== store.name.trim()) return window.alert('Le nom ne correspond pas : rien n’a été supprimé.');
    setBusy('delete');
    await removeProductImages(products.flatMap((p) => [p.image_url, ...(Array.isArray(p.images) ? p.images : [])]));
    await supabase.from('products').delete().eq('store_id', storeId);
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    setBusy('');
    if (error) return window.alert(`Suppression impossible : ${error.message}`);
    navigate('/admin/boutiques', { replace: true });
  };

  if (notFound) {
    return (
      <Card className="p-8 text-center">
        <p className="font-bold">Boutique introuvable.</p>
        <Link to="/admin/boutiques" className="shop-btn-dark mt-4 inline-flex">Retour aux boutiques</Link>
      </Card>
    );
  }
  if (!store || !detail) return <PageLoader />;

  let phone = cleanPhone(store.whatsapp_number || '');
  if (phone.length === 8) phone = `226${phone}`;
  const suspended = store.status === 'hidden';

  return (
    <div>
      <Link to="/admin/boutiques" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> Boutiques
      </Link>

      {/* En-tête */}
      <Card className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-ink text-xl font-bold text-white">
            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : store.name?.charAt(0)?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight md:text-2xl">
              <span className="truncate">{store.name}</span>
              {store.is_verified && <BadgeCheck size={20} className="shrink-0 text-orange-600" aria-label="Vérifiée" />}
            </h1>
            <p className="text-sm text-ink-muted">festisolde.com/{store.slug}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${suspended ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {suspended ? 'Suspendue' : 'Active'}
              </span>
              {detail.stand && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">
                  <PartyPopper size={12} /> Festival : {detail.stand.category} · {STAND[detail.stand.status]}
                </span>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-stone-100 pt-5 text-sm sm:grid-cols-3">
          <div><dt className="text-ink-muted">Propriétaire</dt><dd className="truncate font-semibold">{detail.owner_email || '—'}</dd></div>
          <div><dt className="text-ink-muted">Inscrite le</dt><dd className="font-semibold">{dateFr(store.created_at)}</dd></div>
          <div><dt className="text-ink-muted">Dernière connexion</dt><dd className="font-semibold">{dateFr(detail.last_sign_in_at)}</dd></div>
          <div><dt className="text-ink-muted">WhatsApp</dt><dd className={`font-semibold ${phone ? '' : 'text-red-600'}`}>{phone ? `+${phone}` : 'Non renseigné'}</dd></div>
          {store.description && <div className="sm:col-span-2"><dt className="text-ink-muted">Description</dt><dd className="line-clamp-2">{store.description}</dd></div>}
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="shop-btn border border-stone-200 text-sm">
            <ExternalLink size={16} /> Voir
          </a>
          {phone && (
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="shop-btn bg-[#25d366] text-sm text-ink">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          {detail.owner_email && (
            <a href={`mailto:${detail.owner_email}`} className="shop-btn border border-stone-200 text-sm">
              <Mail size={16} /> E-mail
            </a>
          )}
          <button onClick={() => update({ is_verified: !store.is_verified }, 'verify')} disabled={!!busy} className="shop-btn border border-orange-200 bg-orange-50 text-sm text-orange-800">
            {busy === 'verify' ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
            {store.is_verified ? 'Retirer « Vérifié »' : 'Certifier'}
          </button>
          <button onClick={toggleSuspend} disabled={!!busy} className={`shop-btn text-sm ${suspended ? 'bg-emerald-600 text-white' : 'border border-red-200 bg-red-50 text-red-700'}`}>
            {busy === 'suspend' ? <Loader2 size={16} className="animate-spin" /> : suspended ? <Eye size={16} /> : <EyeOff size={16} />}
            {suspended ? 'Réactiver' : 'Suspendre'}
          </button>
        </div>
      </Card>

      {/* Chiffres */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Ventes" value={formatF(detail.revenue)} hint="hors annulations" icon={Wallet} tone="green" />
        <StatCard label="Commandes" value={detail.orders ?? 0} hint={`${detail.orders_open ?? 0} en cours`} icon={ShoppingBag} tone="orange" />
        <StatCard label="Produits" value={detail.products ?? 0} icon={Package} />
        <StatCard label="Solde" value={formatF(detail.balance)} hint={`${formatF(detail.withdrawn)} déjà retirés`} icon={Wallet} tone="blue" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Dernières commandes */}
        <div>
          <SectionTitle action={<Link to={`/admin/commandes?boutique=${store.id}`} className="text-sm font-semibold text-orange-600">Tout voir</Link>}>
            Dernières commandes
          </SectionTitle>
          <Card className="divide-y divide-stone-100 overflow-hidden">
            {orders.length === 0 && <p className="p-5 text-sm text-ink-muted">Aucune commande.</p>}
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{o.customer_name}</p>
                  <p className="text-xs text-ink-muted">#{orderReference(o)} · {dateFr(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatF(o.total_amount)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Produits */}
        <div>
          <SectionTitle>Produits ({products.length})</SectionTitle>
          <Card className="divide-y divide-stone-100 overflow-hidden">
            {products.length === 0 && <p className="p-5 text-sm text-ink-muted">Aucun produit en ligne.</p>}
            {products.slice(0, 8).map((p) => {
              const img = p.image_url || (Array.isArray(p.images) ? p.images[0] : null);
              const promo = Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price);
              return (
                <Link key={p.id} to={`/produit/${p.id}`} target="_blank" className="flex items-center gap-3 p-3 hover:bg-stone-50">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className={`text-xs ${Number(p.stock_quantity) > 0 ? 'text-ink-muted' : 'font-bold text-red-600'}`}>
                      {Number(p.stock_quantity) > 0 ? `Stock : ${p.stock_quantity}` : 'Épuisé'}
                    </span>
                  </span>
                  <span className="text-right text-sm">
                    <span className="block font-bold">{formatF(promo ? p.sale_price : p.price)}</span>
                    {promo && <span className="block text-xs text-ink-muted line-through">{formatF(p.price)}</span>}
                  </span>
                </Link>
              );
            })}
            {products.length > 8 && (
              <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="block p-3 text-center text-sm font-semibold text-orange-600">
                Voir les {products.length} produits sur la boutique
              </a>
            )}
          </Card>
        </div>
      </div>

      {/* Zone sensible */}
      <Card className="mt-10 border-red-100 p-5">
        <p className="font-bold text-red-700">Zone sensible</p>
        <p className="mt-1 text-sm text-ink-muted">
          Préférez « Suspendre » : c’est réversible. La suppression efface la boutique, ses produits et leurs photos, sans retour possible.
        </p>
        <button onClick={deleteStore} disabled={!!busy} className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-50">
          {busy === 'delete' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Supprimer définitivement
        </button>
      </Card>
    </div>
  );
}
