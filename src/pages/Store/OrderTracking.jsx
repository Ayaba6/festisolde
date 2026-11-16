import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Clock, Truck, PackageCheck, XCircle, MessageCircle, Copy, Loader2, Store } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatPrice } from './ProductCard';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STEPS = [
  { key: 'recue', label: 'Commande reçue', icon: Clock },
  { key: 'preparation', label: 'En préparation', icon: Truck },
  { key: 'livree', label: 'Livrée', icon: PackageCheck },
];

const stepIndex = (status) => (status === 'livré' ? 2 : status === 'en cours' ? 1 : 0);

// Commandes passées sur cet appareil (pour les retrouver facilement).
export const rememberOrder = (id) => {
  try {
    const list = JSON.parse(localStorage.getItem('festi_orders') || '[]').filter((x) => x !== id);
    localStorage.setItem('festi_orders', JSON.stringify([id, ...list].slice(0, 10)));
  } catch { /* stockage indisponible */ }
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState('loading');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!UUID_RE.test(orderId || '')) { setState('notfound'); return; }
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase.rpc('get_order_tracking', { p_order_id: orderId });
      if (!alive) return;
      if (error || !data) { setState('notfound'); return; }
      setOrder(data);
      setState('ready');
      rememberOrder(orderId);
    };
    load();
    const timer = setInterval(load, 30000); // rafraîchit le statut toutes les 30 s
    return () => { alive = false; clearInterval(timer); };
  }, [orderId]);

  if (state === 'loading') {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={28} /></div>;
  }

  if (state === 'notfound') {
    return (
      <div className="shop-container py-28 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Commande introuvable</h1>
        <p className="mt-2 text-ink-muted">Vérifiez le lien reçu après votre commande.</p>
        <Link to="/" className="shop-btn-dark mt-8">Retour à l’accueil</Link>
      </div>
    );
  }

  const cancelled = order.status === 'annulé';
  const current = stepIndex(order.status);
  const whatsapp = (order.store?.whatsapp_number || '').replace(/[^\d]/g, '');
  const contactUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour, je vous contacte au sujet de ma commande #${order.reference} : ${window.location.href}`)}`
    : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* indisponible */ }
  };

  return (
    <div className="shop-container max-w-3xl py-10 md:py-14">
      <p className="shop-eyebrow">Suivi de commande</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Commande #{order.reference}</h1>
      <p className="mt-1 text-ink-muted">
        Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
        {order.store?.name && <> chez <Link to={`/${order.store.slug}`} className="font-semibold text-ink hover:text-orange-600">{order.store.name}</Link></>}
      </p>

      {/* Étapes */}
      <div className="mt-8 rounded-3xl border border-stone-100 bg-white p-6 shadow-card">
        {cancelled ? (
          <div className="flex items-center gap-3 text-red-700">
            <XCircle size={28} />
            <div>
              <p className="font-bold">Commande annulée</p>
              <p className="text-sm text-ink-muted">Contactez le vendeur si vous pensez qu’il s’agit d’une erreur.</p>
            </div>
          </div>
        ) : (
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map(({ key, label, icon: Icon }, i) => {
              const done = i < current || (i === current && i === 2);
              const active = i === current;
              return (
                <li key={key} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <span className={`absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2 ${i <= current ? 'bg-orange-500' : 'bg-stone-200'}`} aria-hidden="true" />
                  )}
                  <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                    done ? 'bg-orange-600 text-white' : active ? 'bg-orange-100 text-orange-700 ring-4 ring-orange-50' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {done ? <Check size={18} /> : <Icon size={18} />}
                  </span>
                  <span className={`mt-2 text-sm font-semibold ${i <= current ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-5 text-sm">
          {order.payment_status === 'paye' ? (
            <span className="rounded-full bg-green-50 px-3 py-1 font-bold text-green-700">Payée en ligne</span>
          ) : (
            <span className="rounded-full bg-stone-100 px-3 py-1 font-bold text-ink-soft">À régler à la livraison</span>
          )}
          <span className="text-ink-muted">Mise à jour automatique</span>
        </div>
      </div>

      {/* Articles */}
      <div className="mt-6 rounded-3xl border border-stone-100 bg-white shadow-card">
        <ul className="divide-y divide-stone-100">
          {(order.items || []).map((item, i) => (
            <li key={i} className="flex items-center gap-4 p-4">
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-ink-muted">
                  {[item.size && `Taille ${item.size}`, item.color, `Qté ${item.quantity}`].filter(Boolean).join(' · ')}
                </p>
              </div>
              {item.unit_price !== undefined && <p className="font-bold text-ink">{formatPrice(item.unit_price * item.quantity)}</p>}
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-stone-100 p-5">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-extrabold">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {contactUrl && (
          <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="shop-btn flex-1 bg-[#25D366] text-white hover:bg-[#1fb857]">
            <MessageCircle size={18} /> Contacter le vendeur
          </a>
        )}
        <button onClick={copyLink} className="shop-btn-ghost flex-1">
          {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Lien copié' : 'Copier le lien de suivi'}
        </button>
        {order.store?.slug && (
          <Link to={`/${order.store.slug}`} className="shop-btn-ghost flex-1"><Store size={18} /> La boutique</Link>
        )}
      </div>
    </div>
  );
}
