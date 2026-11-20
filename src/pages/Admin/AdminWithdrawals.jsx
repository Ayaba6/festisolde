import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Check, X, Loader2, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PageHeader, Card, EmptyState, PageLoader, StatusBadge, formatF } from '../../components/vendor/ui';

const COMMISSION_RATE = 0.1;
const TABS = [['en_cours', 'À traiter'], ['valide', 'Payés'], ['rejete', 'Refusés']];

export default function AdminWithdrawals() {
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState('en_cours');
  const [busy, setBusy] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*, stores(id, name)')
      .order('created_at', { ascending: false });
    setRows(data || []);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin_withdrawals_page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const decide = async (w, decision) => {
    const net = Math.round(w.amount * (1 - COMMISSION_RATE));
    const msg = decision === 'valide'
      ? `Avez-vous bien envoyé ${formatF(net)} à ${w.stores?.name} (${w.payment_method} ${w.payment_details}) ?\n\nConfirmer marque le retrait comme payé.`
      : `Refuser ce retrait ? ${formatF(w.amount)} seront rendus au solde de ${w.stores?.name}.`;
    if (!window.confirm(msg)) return;
    setBusy(w.id);
    const { error } = await supabase.rpc('process_withdrawal', { p_id: w.id, p_decision: decision });
    setBusy(null);
    if (error) return window.alert(error.message);
    load();
  };

  const copy = async (w) => {
    try {
      await navigator.clipboard.writeText(String(w.payment_details || ''));
      setCopied(w.id);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* presse-papiers indisponible */ }
  };

  if (!rows) return <PageLoader />;

  const shown = rows.filter((w) => w.status === tab);
  const pendingNet = rows.filter((w) => w.status === 'en_cours').reduce((n, w) => n + w.amount * (1 - COMMISSION_RATE), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Retraits"
        subtitle={pendingNet > 0 ? `${formatF(pendingNet)} à verser aux vendeurs` : 'Aucun retrait en attente'}
      />

      <div className="mb-6 flex rounded-full bg-white p-1 ring-1 ring-stone-200 sm:w-fit" role="tablist">
        {TABS.map(([k, l]) => {
          const n = rows.filter((w) => w.status === k).length;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold sm:flex-none ${tab === k ? 'bg-ink text-white' : 'text-ink-muted'}`}
            >
              {l} <span className="opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Wallet} title="Rien ici" text={tab === 'en_cours' ? 'Aucune demande de retrait à traiter.' : 'Aucun retrait dans cette liste.'} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((w) => {
            const fee = Math.round(w.amount * COMMISSION_RATE);
            const net = w.amount - fee;
            return (
              <Card key={w.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/admin/boutiques/${w.stores?.id}`} className="block truncate font-bold hover:text-orange-700">{w.stores?.name || 'Boutique supprimée'}</Link>
                    <p className="text-xs text-ink-muted">{new Date(w.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>

                <div className="mt-4 rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-800">À envoyer</p>
                  <p className="text-2xl font-extrabold text-orange-900">{formatF(net)}</p>
                  <p className="text-xs text-orange-900/70">Demandé {formatF(w.amount)} − commission 10 % ({formatF(fee)})</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-stone-50 p-3 text-sm">
                  <span className="min-w-0">
                    <span className="block text-xs text-ink-muted">{w.payment_method}</span>
                    <span className="block truncate font-bold">{w.payment_details}</span>
                  </span>
                  <button onClick={() => copy(w)} className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold ring-1 ring-stone-200" aria-label="Copier le numéro">
                    {copied === w.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                {w.status === 'en_cours' && (
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <button onClick={() => decide(w, 'valide')} disabled={busy === w.id} className="shop-btn bg-emerald-600 text-sm text-white">
                      {busy === w.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Marquer comme payé
                    </button>
                    <button onClick={() => decide(w, 'rejete')} disabled={busy === w.id} className="shop-btn text-sm text-red-700 ring-1 ring-red-200" aria-label="Refuser le retrait">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
