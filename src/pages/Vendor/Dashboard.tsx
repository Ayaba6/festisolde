import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import RequestBoost from './RequestBoost';
import AddProductModal from './AddProductModal';
import {
  Plus, ShoppingBag, Users, Wallet, Eye, Zap, ChevronRight, Package, Share2, Check, AlertTriangle, BellRing,
} from 'lucide-react';
import PushToggle from '../../components/vendor/PushToggle';
import FestivalBanner from '../../components/vendor/FestivalBanner';
import { PageHeader, StatCard, Card, SectionTitle, StatusBadge, EmptyState, PageLoader, Modal, formatF } from '../../components/vendor/ui';

const DAY = 24 * 60 * 60 * 1000;

export default function Dashboard() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase
      .channel('vendor-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: storeData } = await supabase.from('stores').select('*').eq('owner_id', user.id).maybeSingle();
    if (storeData) {
      setStore(storeData);
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    }
    setLoading(false);
  }

  if (loading) return <PageLoader label="Chargement de votre boutique…" />;

  if (!store) {
    return (
      <EmptyState
        icon={Package}
        title="Aucune boutique liée à ce compte"
        text="Contactez le support FestiSolde pour activer votre boutique."
      />
    );
  }

  const validOrders = orders.filter((o) => o.status !== 'annulé');
  const revenue = validOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
  const weekOrders = validOrders.filter((o) => Date.now() - new Date(o.created_at).getTime() < 7 * DAY).length;
  const customers = new Set(validOrders.map((o) => o.customer_phone)).size;
  const views = products.reduce((acc, p) => acc + (p.views || 0), 0);
  const newOrders = orders.filter((o) => o.status === 'nouveau');
  const lowStock = products.filter((p) => p.stock_quantity !== null && p.stock_quantity <= 2);
  const topProducts = [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 4);
  const storeUrl = `${window.location.origin}/${store.slug}`;

  const shareStore = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: store.name, url: storeUrl }); } catch { /* annulé */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* indisponible */ }
  };

  const hour = new Date().getHours();
  const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';

  return (
    <div>
      {isAddModalOpen && (
        <AddProductModal storeId={store.id} onClose={() => setIsAddModalOpen(false)} onRefresh={fetchDashboardData} />
      )}
      {showBoostModal && (
        <Modal title="Booster un article" onClose={() => setShowBoostModal(false)} size="max-w-4xl">
          <RequestBoost />
        </Modal>
      )}

      <PageHeader
        eyebrow={greeting}
        title={store.name}
        subtitle="Voici l’activité de votre boutique."
        actions={
          <>
            <button onClick={() => setShowBoostModal(true)} className="shop-btn-ghost">
              <Zap size={18} className="text-orange-600" /> Booster
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="shop-btn-primary">
              <Plus size={18} /> Ajouter un produit
            </button>
          </>
        }
      />

      <FestivalBanner storeId={store.id} />

      {/* À traiter */}
      {(newOrders.length > 0 || lowStock.length > 0 || !store.whatsapp_number) && (
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {newOrders.length > 0 && (
            <Link to="/revenus" className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sky-900 transition hover:bg-sky-100">
              <BellRing size={20} className="shrink-0" />
              <span className="flex-1 text-[15px] font-semibold">
                {newOrders.length} nouvelle{newOrders.length > 1 ? 's' : ''} commande{newOrders.length > 1 ? 's' : ''} à traiter
              </span>
              <ChevronRight size={18} />
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link to="/products-manage" className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900 transition hover:bg-amber-100">
              <AlertTriangle size={20} className="shrink-0" />
              <span className="flex-1 text-[15px] font-semibold">
                {lowStock.length} produit{lowStock.length > 1 ? 's' : ''} bientôt épuisé{lowStock.length > 1 ? 's' : ''}
              </span>
              <ChevronRight size={18} />
            </Link>
          )}
          {!store.whatsapp_number && (
            <Link to="/settings" className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-900 transition hover:bg-red-100">
              <AlertTriangle size={20} className="shrink-0" />
              <span className="flex-1 text-[15px] font-semibold">Ajoutez votre numéro WhatsApp pour recevoir les commandes</span>
              <ChevronRight size={18} />
            </Link>
          )}
        </div>
      )}

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Chiffre d’affaires" value={formatF(revenue)} hint="Hors commandes annulées" icon={Wallet} tone="green" to="/revenus" />
        <StatCard label="Commandes (7 j)" value={weekOrders} hint={`${validOrders.length} au total`} icon={ShoppingBag} tone="orange" to="/revenus" />
        <StatCard label="Vues produits" value={views.toLocaleString('fr-FR')} hint="Depuis l’ouverture" icon={Eye} tone="blue" to="/analytics" />
        <StatCard label="Clients" value={customers} hint="Numéros différents" icon={Users} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Dernières commandes */}
        <section className="lg:col-span-2">
          <SectionTitle action={<Link to="/revenus" className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:underline">Tout voir <ChevronRight size={16} /></Link>}>
            Dernières commandes
          </SectionTitle>
          {orders.length > 0 ? (
            <Card as="ul" className="divide-y divide-stone-100">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center gap-4 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-ink-soft">
                    {o.customer_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{o.customer_name}</p>
                    <p className="text-sm text-ink-muted">
                      {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {o.customer_phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-bold text-ink">{formatF(o.total_amount)}</p>
                    <div className="flex gap-1">
                      {o.payment_status === 'paye' && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">Payé</span>}
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                </li>
              ))}
            </Card>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Pas encore de commande"
              text="Partagez le lien de votre boutique sur WhatsApp et Facebook pour attirer vos premiers clients."
              action={<button onClick={shareStore} className="shop-btn-dark">{copied ? <Check size={18} /> : <Share2 size={18} />} {copied ? 'Lien copié' : 'Partager ma boutique'}</button>}
            />
          )}
        </section>

        {/* Colonne droite */}
        <aside className="space-y-6">
          <PushToggle />

          <Card className="overflow-hidden">
            <div className="bg-ink p-5 text-white">
              <p className="text-sm font-semibold text-stone-300">Lien de votre boutique</p>
              <p className="mt-1 truncate font-bold">festisolde.com/{store.slug}</p>
            </div>
            <div className="flex gap-2 p-4">
              <button onClick={shareStore} className="shop-btn-primary flex-1 py-2.5">
                {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? 'Copié' : 'Partager'}
              </button>
              <Link to={`/${store.slug}`} target="_blank" className="shop-btn-ghost py-2.5">Voir</Link>
            </div>
          </Card>

          <div>
            <SectionTitle action={<Link to="/products-manage" className="text-sm font-bold text-orange-600 hover:underline">Gérer</Link>}>
              Meilleures ventes
            </SectionTitle>
            {topProducts.length > 0 ? (
              <Card as="ul" className="divide-y divide-stone-100">
                {topProducts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 p-3">
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                      <p className="text-sm text-ink-muted">{p.sold_count || 0} vendu{(p.sold_count || 0) > 1 ? 's' : ''} · stock {p.stock_quantity ?? '—'}</p>
                    </div>
                  </li>
                ))}
              </Card>
            ) : (
              <EmptyState
                icon={Package}
                title="Aucun produit"
                action={<button onClick={() => setIsAddModalOpen(true)} className="shop-btn-primary"><Plus size={18} /> Ajouter</button>}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
