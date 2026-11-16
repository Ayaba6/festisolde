import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { rememberOrder } from './OrderTracking';
import { CheckCircle2, Loader2, XCircle, MessageCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { buildOrderWhatsappUrl } from '../../lib/whatsapp';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30; // ~2 minutes : le temps de valider sur le téléphone

const readPending = () => {
  try {
    return JSON.parse(sessionStorage.getItem('festi_pending_payment') || 'null');
  } catch {
    return null;
  }
};

/**
 * Page de retour après LigdiCash (/paiement/retour?pid=...).
 * Le statut affiché vient toujours du serveur (ligdicash-verify), jamais de l'URL.
 */
export default function PaymentReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const pid = params.get('pid');
  const cancelled = params.get('annule') === '1';

  const [state, setState] = useState({ status: 'loading', order: null, error: null });
  const polls = useRef(0);

  useEffect(() => {
    if (!pid || !UUID_RE.test(pid)) {
      setState({ status: 'error', order: null, error: 'Lien de paiement invalide.' });
      return;
    }
    let timer;
    let stopped = false;

    const check = async () => {
      const { data, error } = await supabase.functions.invoke('ligdicash-verify', { body: { payment_id: pid } });
      if (stopped) return;
      if (error || !data?.status) {
        setState({ status: 'error', order: null, error: 'Impossible de vérifier le paiement pour le moment.' });
        return;
      }
      if (data.status === 'pending' && !cancelled && polls.current < MAX_POLLS) {
        polls.current += 1;
        setState({ status: 'pending', order: data.order, error: null });
        timer = setTimeout(check, POLL_INTERVAL_MS);
        return;
      }
      if (data.status === 'completed') {
        clearCart();
        if (data.order?.id) rememberOrder(data.order.id);
      }
      setState({ status: data.status, order: data.order, error: null });
    };

    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, cancelled]);

  const pending = readPending();
  const gaveUp = state.status === 'pending' && (cancelled || polls.current >= MAX_POLLS);
  const whatsappUrl =
    state.status === 'completed' && state.order
      ? buildOrderWhatsappUrl({ order: state.order, customer: pending?.customer, paidOnline: true })
      : null;

  return (
    <div className="min-h-[80vh] bg-[#FBFBFB] flex items-center justify-center p-6 antialiased text-ink">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-100 shadow-xl p-8 text-center">
        {(state.status === 'loading' || (state.status === 'pending' && !gaveUp)) && (
          <>
            <Loader2 className="mx-auto animate-spin text-orange-600" size={44} />
            <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">Vérification du paiement</h1>
            <p className="mt-3 text-sm text-stone-500">
              {state.status === 'pending'
                ? 'Validez le paiement sur votre téléphone si ce n’est pas déjà fait. Cette page se met à jour toute seule.'
                : 'Un instant…'}
            </p>
          </>
        )}

        {state.status === 'completed' && (
          <>
            <CheckCircle2 className="mx-auto text-green-500" size={52} />
            <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">Paiement réussi !</h1>
            {state.order && (
              <p className="mt-3 text-sm text-stone-500">
                Commande <span className="font-extrabold text-ink">#{state.order.reference}</span> —{' '}
                <span className="font-extrabold text-ink">{Number(state.order.total).toLocaleString()} FCFA</span>
              </p>
            )}
            <p className="mt-2 text-sm text-stone-500">La commande apparaît dans l’espace du vendeur. Prévenez-le sur WhatsApp pour organiser la livraison.</p>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full py-5 bg-[#25D366] text-white rounded-2xl text-xs font-extrabold uppercase tracking-wide shadow-lg flex items-center justify-center gap-3"
              >
                <MessageCircle size={18} /> Prévenir le vendeur
              </a>
            )}
            {state.order?.id && (
              <Link to={`/commande/${state.order.id}`} className="shop-btn-ghost mt-3 w-full py-3.5">Suivre ma commande</Link>
            )}
            <button
              onClick={() => navigate(state.order?.store_slug ? `/${state.order.store_slug}` : '/')}
              className="mt-3 w-full py-4 text-xs font-extrabold uppercase tracking-wide text-stone-400"
            >
              Continuer mes achats
            </button>
          </>
        )}

        {(state.status === 'notcompleted' || gaveUp) && (
          <>
            <XCircle className="mx-auto text-red-500" size={52} />
            <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">
              {cancelled ? 'Paiement annulé' : 'Paiement non abouti'}
            </h1>
            <p className="mt-3 text-sm text-stone-500">
              {gaveUp && !cancelled
                ? 'Le paiement n’est pas encore confirmé. Si vous avez été débité, il sera pris en compte automatiquement : ne repayez pas.'
                : 'Aucun paiement n’a été validé. Votre panier est conservé, vous pouvez réessayer.'}
            </p>
            <button
              onClick={() => navigate('/panier')}
              className="mt-8 w-full py-5 bg-ink text-white rounded-2xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-3"
            >
              <ShoppingBag size={16} /> Retour au panier
            </button>
          </>
        )}

        {state.status === 'error' && (
          <>
            <XCircle className="mx-auto text-red-500" size={52} />
            <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">Oups</h1>
            <p className="mt-3 text-sm text-stone-500">{state.error}</p>
            <button onClick={() => window.location.reload()} className="mt-8 w-full py-5 bg-ink text-white rounded-2xl text-xs font-extrabold uppercase tracking-wide">
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
