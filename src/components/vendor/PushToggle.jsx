import { useEffect, useState } from 'react';
import { BellRing, BellOff, Loader2 } from 'lucide-react';
import { getPushState, enablePush, disablePush } from '../../lib/push';

// Carte "Être prévenu des nouvelles commandes" (masquée si non disponible).
export default function PushToggle() {
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPushState().then(setState).catch(() => setState('unsupported'));
  }, []);

  if (state === 'loading' || state === 'unsupported') return null;

  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      if (state === 'enabled') {
        await disablePush();
        setState('disabled');
      } else {
        await enablePush();
        setState('enabled');
      }
    } catch (e) {
      setError(e.message);
      setState(await getPushState().catch(() => 'disabled'));
    } finally {
      setBusy(false);
    }
  };

  const enabled = state === 'enabled';
  return (
    <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${enabled ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
          {enabled ? <BellRing size={20} /> : <BellOff size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{enabled ? 'Notifications activées' : 'Soyez prévenu à chaque commande'}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {state === 'denied'
              ? 'Les notifications sont bloquées dans votre navigateur.'
              : enabled
                ? 'Vous recevrez une alerte sur cet appareil.'
                : 'Une alerte sur ce téléphone, même site fermé.'}
          </p>
        </div>
      </div>
      {state !== 'denied' && (
        <button onClick={toggle} disabled={busy} className={`mt-4 w-full ${enabled ? 'shop-btn-ghost' : 'shop-btn-primary'} py-2.5`}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {enabled ? 'Désactiver sur cet appareil' : 'Activer les notifications'}
        </button>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
