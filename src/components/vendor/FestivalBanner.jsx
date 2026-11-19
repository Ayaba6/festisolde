import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { FESTIVAL, festivalPhase } from '../../lib/festival';

const LABELS = {
  reserve: 'Place réservée : payez l’acompte pour la garantir',
  acompte: 'Place garantie : solde à payer avant le ' + FESTIVAL.balanceDeadline,
  paye: 'Votre stand est payé, à bientôt au festival !',
};

// Rappel du festival en haut du tableau de bord (disparaît après l'événement).
export default function FestivalBanner({ storeId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    supabase
      .from('festival_stands')
      .select('status')
      .eq('store_id', storeId)
      .eq('edition', 'noel-2026')
      .maybeSingle()
      .then(({ data }) => setStatus(data && data.status !== 'annule' ? data.status : null));
  }, [storeId]);

  if (festivalPhase() === 'apres') return null;

  return (
    <Link
      to="/festival/mon-stand"
      className="mb-8 flex items-center gap-4 rounded-3xl bg-ink p-5 text-white transition hover:bg-ink-soft md:p-6"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-ink">
        <PartyPopper size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-orange-400">
          Festival FestiSolde · {FESTIVAL.datesLabel.replace('Du ', 'du ')}
        </span>
        <span className="mt-1 block text-[15px] font-bold md:text-lg">
          {status ? LABELS[status] : `Réservez votre stand : ${FESTIVAL.categories.reduce((n, c) => n + c.places, 0)} places, ${FESTIVAL.place}`}
        </span>
      </span>
      <ChevronRight size={20} className="shrink-0" />
    </Link>
  );
}
