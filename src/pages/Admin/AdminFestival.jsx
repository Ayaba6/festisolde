import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageCircle, Banknote, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { FESTIVAL, standAmountDue } from '../../lib/festival';
import { cleanPhone } from '../../lib/whatsapp';
import { formatF } from '../../components/vendor/ui';

const STATUS = {
  reserve: { label: 'Réservé (non payé)', tone: 'bg-amber-50 text-amber-800' },
  acompte: { label: 'Acompte payé', tone: 'bg-sky-50 text-sky-800' },
  paye: { label: 'Payé', tone: 'bg-emerald-50 text-emerald-800' },
  annule: { label: 'Annulé', tone: 'bg-stone-100 text-stone-500' },
};

// Suivi des stands du festival : places, paiements, relances.
export default function AdminFestival() {
  const [stands, setStands] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState('actifs');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: rows }, { data: avail }] = await Promise.all([
      supabase
        .from('festival_stands')
        .select('*, stores(name, slug, whatsapp_number)')
        .eq('edition', 'noel-2026')
        .order('created_at', { ascending: true }),
      supabase.rpc('get_festival_availability'),
    ]);
    setStands(rows || []);
    setAvailability(avail || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const recordPayment = async (stand) => {
    const due = FESTIVAL.standPrice - stand.amount_paid;
    const raw = window.prompt(`Montant reçu de ${stand.stores?.name} (reste ${formatF(due)}) :`, String(Math.min(due, FESTIVAL.deposit)));
    if (raw === null) return;
    const amount = parseInt(raw.replace(/\D/g, ''), 10);
    if (!(amount > 0)) return window.alert('Montant invalide.');
    const note = window.prompt('Note (moyen de paiement, référence…) :', 'Espèces') ?? '';
    setBusy(stand.id);
    const { error } = await supabase.rpc('admin_record_stand_payment', { p_stand_id: stand.id, p_amount: amount, p_note: note });
    setBusy(null);
    if (error) return window.alert(error.message);
    load();
  };

  const cancelStand = async (stand) => {
    const msg = stand.amount_paid > 0
      ? `Annuler le stand de ${stand.stores?.name} ? ${formatF(stand.amount_paid)} ont déjà été payés : pensez au remboursement.`
      : `Annuler la réservation de ${stand.stores?.name} ?`;
    if (!window.confirm(msg)) return;
    setBusy(stand.id);
    const { error } = await supabase.rpc('admin_cancel_stand', { p_stand_id: stand.id });
    setBusy(null);
    if (error) return window.alert(error.message);
    load();
  };

  const reminderUrl = (stand) => {
    let phone = cleanPhone(stand.stores?.whatsapp_number || '');
    if (!phone) return null;
    if (phone.length === 8) phone = `226${phone}`; // numéro burkinabè saisi sans indicatif
    const due = standAmountDue(stand.amount_paid);
    const text = `Bonjour ${stand.stores?.name}, c'est FestiSolde. Pour votre stand ${stand.category} au festival (${FESTIVAL.datesLabel.toLowerCase()}), ` +
      `il reste ${formatF(due)} à régler${stand.amount_paid >= FESTIVAL.deposit ? ` avant le ${FESTIVAL.balanceDeadline}` : ' pour garantir votre place'}. ` +
      `Vous pouvez payer depuis votre espace vendeur (Mon stand festival) ou nous répondre ici.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={28} /></div>;
  }

  const active = stands.filter((s) => s.status !== 'annule');
  const collected = stands.reduce((n, s) => n + s.amount_paid, 0);
  const expected = active.length * FESTIVAL.standPrice;
  const shown = filter === 'tous' ? stands : filter === 'a-relancer' ? active.filter((s) => s.status !== 'paye') : active;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Stands actifs" value={`${active.filter((s) => s.status !== 'reserve').length} / ${FESTIVAL.categories.reduce((n, c) => n + c.places, 0)}`} hint="acompte ou payé" />
        <Stat label="Encaissé" value={formatF(collected)} hint="en ligne + hors ligne" />
        <Stat label="Reste à encaisser" value={formatF(Math.max(0, expected - collected))} hint="sur les stands actifs" />
        <Stat label="Réservés non payés" value={active.filter((s) => s.status === 'reserve').length} hint="place non garantie" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {availability.map((c) => (
          <div key={c.category} className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-extrabold">{c.category}</p>
            <p className="mt-1 text-2xl font-extrabold">{c.taken}<span className="text-base text-stone-400"> / {c.places}</span></p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[['actifs', 'Actifs'], ['a-relancer', 'À relancer'], ['tous', 'Tous (avec annulés)']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === k ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-stone-200'}`}>{l}</button>
        ))}
        <button onClick={load} className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold ring-1 ring-stone-200" aria-label="Actualiser">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-xs font-extrabold uppercase text-stone-500">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Boutique</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Payé</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {shown.map((s) => {
              const rank = active.filter((a) => a.status !== 'reserve').findIndex((a) => a.id === s.id) + 1;
              const remind = reminderUrl(s);
              return (
                <tr key={s.id}>
                  <td className="p-4 font-bold text-stone-400" title="Ordre d'inscription (les 20 premiers choisissent leur emplacement)">
                    {rank > 0 ? rank : '–'}
                  </td>
                  <td className="p-4">
                    <a href={`/${s.stores?.slug}`} target="_blank" rel="noreferrer" className="font-bold hover:text-orange-600">{s.stores?.name}</a>
                    {s.admin_note && <p className="text-xs text-stone-500">{s.admin_note}</p>}
                  </td>
                  <td className="p-4">{s.category}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS[s.status]?.tone}`}>{STATUS[s.status]?.label}</span></td>
                  <td className="p-4 font-bold">{formatF(s.amount_paid)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {s.status !== 'annule' && s.status !== 'paye' && (
                        <button onClick={() => recordPayment(s)} disabled={busy === s.id} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                          <Banknote size={14} /> Paiement reçu
                        </button>
                      )}
                      {remind && s.status !== 'annule' && s.status !== 'paye' && (
                        <a href={remind} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#25d366] px-3 py-2 text-xs font-bold text-ink">
                          <MessageCircle size={14} /> Relancer
                        </a>
                      )}
                      {s.status !== 'annule' && (
                        <button onClick={() => cancelStand(s)} disabled={busy === s.id} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50" aria-label={`Annuler le stand de ${s.stores?.name}`}>
                          <XCircle size={14} /> Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-10 text-center font-bold text-stone-400">Aucune réservation pour le moment.</p>}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5">
      <p className="text-xs font-extrabold uppercase text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-stone-500">{hint}</p>
    </div>
  );
}
