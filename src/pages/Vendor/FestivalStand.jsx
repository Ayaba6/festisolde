import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PartyPopper, CalendarDays, MapPin, CheckCircle2, AlertCircle, Loader2, Smartphone, MessageCircle, Store, Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { FESTIVAL, standAmountDue as nextAmount } from '../../lib/festival';
import { PageHeader, Card, PageLoader, formatF } from '../../components/vendor/ui';
import { ONLINE_PAYMENT } from '../../lib/config';

const STATUS = {
  reserve: { label: 'Place réservée, acompte à payer', tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
  acompte: { label: 'Place garantie, solde à payer', tone: 'bg-sky-50 text-sky-800 ring-sky-200' },
  paye: { label: 'Stand entièrement payé', tone: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
};

export default function FestivalStand() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [stand, setStand] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [payments, setPayments] = useState([]);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: s } = await supabase.from('stores').select('id, name, slug').eq('owner_id', user?.id).maybeSingle();
    setStore(s);
    const [{ data: avail }, standRes] = await Promise.all([
      supabase.rpc('get_festival_availability'),
      s ? supabase.from('festival_stands').select('*').eq('store_id', s.id).eq('edition', 'noel-2026').maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setAvailability(avail || []);
    const st = standRes.data && standRes.data.status !== 'annule' ? standRes.data : null;
    setStand(st);
    if (st) {
      setChoice(st.category);
      const { data: pays } = await supabase
        .from('payments')
        .select('id, amount, status, operator_name, created_at')
        .eq('stand_id', st.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });
      setPayments(pays || []);
    }
    setLoading(false);
  }, []);

  // Retour de LigdiCash : on vérifie le paiement avant d'afficher quoi que ce soit.
  useEffect(() => {
    const pid = params.get('pid');
    const cancelled = params.get('annule') === '1';
    (async () => {
      if (pid) {
        const { data } = await supabase.functions.invoke('ligdicash-verify', { body: { payment_id: pid } });
        if (data?.status === 'completed') setNotice({ ok: true, text: 'Paiement reçu, merci ! Votre stand est à jour.' });
        else if (cancelled || data?.status === 'notcompleted') setNotice({ ok: false, text: 'Le paiement n’a pas abouti. Vous pouvez réessayer.' });
        else setNotice({ ok: false, text: 'Paiement en cours de confirmation. Revenez dans quelques minutes.' });
        setParams({}, { replace: true });
      }
      await load();
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reserve = async () => {
    if (!choice) return;
    setBusy('reserve'); setError('');
    const { data, error: err } = await supabase.rpc('reserve_festival_stand', { p_category: choice });
    setBusy('');
    if (err) return setError(err.message);
    setStand(data);
    await load();
  };

  const cancel = async () => {
    if (!window.confirm('Annuler votre réservation ? La place sera libérée.')) return;
    setBusy('cancel'); setError('');
    const { error: err } = await supabase.rpc('cancel_festival_stand');
    setBusy('');
    if (err) return setError(err.message);
    setStand(null);
    await load();
  };

  const payOnline = async () => {
    setBusy('pay'); setError('');
    const { data, error: err } = await supabase.functions.invoke('festival-stand-pay', { body: { stand_id: stand.id } });
    if (err || !data?.payment_url) {
      let message = data?.error;
      try { message = message || (await err?.context?.json())?.error; } catch { /* réponse illisible */ }
      setBusy('');
      return setError(message || 'Le paiement en ligne est indisponible. Payez en direct via WhatsApp.');
    }
    window.location.href = data.payment_url;
  };

  const whatsappUrl = () => {
    const due = stand ? nextAmount(stand.amount_paid) : FESTIVAL.deposit;
    const text = `Bonjour FestiSolde, je suis ${store?.name || 'exposant'} (catégorie ${choice || 'à choisir'}). ` +
      `Je souhaite payer ${formatF(due)} pour mon stand au festival, en espèces ou par Mobile Money direct.`;
    return `https://wa.me/${FESTIVAL.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  if (loading) return <PageLoader />;

  if (!store) {
    return (
      <Card className="p-8 text-center">
        <Store className="mx-auto text-stone-300" size={40} />
        <p className="mt-4 text-lg font-bold">Créez d’abord votre boutique</p>
        <Link to="/ma-boutique" className="shop-btn-dark mt-5 inline-flex">Configurer ma boutique</Link>
      </Card>
    );
  }

  const paid = stand?.amount_paid || 0;
  const pct = Math.round((paid / FESTIVAL.standPrice) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={FESTIVAL.edition}
        title="Mon stand au festival"
        subtitle={`${FESTIVAL.datesLabel} · ${FESTIVAL.place}, ${FESTIVAL.city}`}
      />

      {notice && (
        <p role="status" className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${notice.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          {notice.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
          {notice.text}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      {stand ? (
        <Card className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink-muted">Catégorie</p>
              <p className="text-2xl font-extrabold">{stand.category}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${STATUS[stand.status]?.tone}`}>
              {STATUS[stand.status]?.label}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold">
              <span>Payé : {formatF(paid)}</span>
              <span className="text-ink-muted">sur {formatF(FESTIVAL.standPrice)}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Montant payé">
              <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {stand.status === 'reserve' && (
            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              <Clock size={18} className="mt-0.5 shrink-0" />
              Votre place est bloquée 30 minutes. Elle n’est garantie qu’après l’acompte de {formatF(FESTIVAL.deposit)}.
            </p>
          )}

          {stand.status !== 'paye' ? (
            <div className={`mt-6 grid gap-3 ${ONLINE_PAYMENT ? 'sm:grid-cols-2' : ''}`}>
              {ONLINE_PAYMENT && <button onClick={payOnline} disabled={!!busy} className="shop-btn-primary">
                {busy === 'pay' ? <Loader2 className="animate-spin" size={18} /> : <Smartphone size={18} />}
                Payer {stand.status === 'reserve' ? 'l’acompte' : 'le solde'} : {formatF(nextAmount(paid))}
              </button>}
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={ONLINE_PAYMENT ? 'shop-btn border border-stone-200 hover:bg-stone-50' : 'shop-btn bg-[#25d366] text-ink hover:brightness-95 sm:w-fit'}>
                <MessageCircle size={18} />
                {ONLINE_PAYMENT
                  ? 'Payer en direct (WhatsApp)'
                  : `Payer ${stand.status === 'reserve' ? 'l’acompte' : 'le solde'} (${formatF(nextAmount(paid))}) via WhatsApp`}
              </a>
              <p className="text-xs text-ink-muted sm:col-span-2">
                {ONLINE_PAYMENT
                  ? 'En ligne : Orange Money, Moov Money ou carte, via LigdiCash. En direct : espèces ou Mobile Money, enregistré par l’équipe FestiSolde.'
                  : 'Contactez-nous sur WhatsApp pour régler en espèces ou par Mobile Money : l’équipe FestiSolde enregistre votre paiement et votre page se met à jour.'}
                {stand.status === 'acompte' && <> Solde à régler avant le {FESTIVAL.balanceDeadline}.</>}
              </p>
            </div>
          ) : (
            <p className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">
              <PartyPopper size={20} className="mt-0.5 shrink-0" />
              Tout est réglé : rendez-vous le 18 décembre ! Votre boutique apparaît dans la liste des exposants.
            </p>
          )}

          {stand.status === 'reserve' && paid === 0 && (
            <button onClick={cancel} disabled={!!busy} className="mt-4 text-sm font-semibold text-ink-muted underline hover:text-red-600">
              Annuler ou changer de catégorie
            </button>
          )}

          {payments.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-5">
              <p className="text-sm font-bold">Paiements reçus</p>
              <ul className="mt-2 divide-y divide-stone-100 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between py-2">
                    <span>{new Date(p.created_at).toLocaleDateString('fr-FR')} · {p.operator_name || 'En ligne'}</span>
                    <span className="font-bold">{formatF(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6 md:p-8">
          <p className="text-lg font-extrabold">1. Choisissez votre catégorie</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Catégorie du stand">
            {availability.map((c) => {
              const left = Math.max(0, c.places - c.taken);
              const full = left === 0;
              const active = choice === c.category;
              return (
                <button
                  key={c.category}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={full}
                  onClick={() => setChoice(c.category)}
                  className={`rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-orange-500 bg-orange-50' : 'border-stone-100 hover:border-stone-300'}`}
                >
                  <p className="font-extrabold">{c.category}</p>
                  <p className={`mt-1 text-sm font-semibold ${full ? 'text-red-600' : left <= 2 ? 'text-orange-700' : 'text-ink-muted'}`}>
                    {full ? 'Complet' : `${left} place${left > 1 ? 's' : ''} sur ${c.places}`}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-lg font-extrabold">2. Réservez, puis payez l’acompte</p>
          <p className="mt-1 text-ink-muted">
            Stand {formatF(FESTIVAL.standPrice)} pour 10 jours : acompte de {formatF(FESTIVAL.deposit)} pour garantir la place,
            solde avant le {FESTIVAL.balanceDeadline}. Les {FESTIVAL.firstChoiceCount} premiers inscrits choisissent leur emplacement.
          </p>
          <button onClick={reserve} disabled={!choice || !!busy} className="shop-btn-primary mt-5 w-full sm:w-auto">
            {busy === 'reserve' ? <Loader2 className="animate-spin" size={18} /> : <PartyPopper size={18} />}
            Réserver {choice ? `en ${choice}` : 'ma place'}
          </button>
        </Card>
      )}

      <Card className="grid gap-4 p-6 md:grid-cols-3">
        <p className="flex items-start gap-3 text-sm"><CalendarDays size={18} className="mt-0.5 shrink-0 text-orange-600" /> {FESTIVAL.datesLabel}</p>
        <p className="flex items-start gap-3 text-sm"><MapPin size={18} className="mt-0.5 shrink-0 text-orange-600" /> {FESTIVAL.place}, {FESTIVAL.city}</p>
        <p className="text-sm"><strong>Règle du jeu :</strong> au moins -10 % sur tout le stand et 3 « Prix Festi » à -30 % ou plus.</p>
      </Card>
    </div>
  );
}
