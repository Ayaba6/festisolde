// Réglages du festival FestiSolde : un seul endroit à modifier pour la prochaine édition.
// Ouagadougou est à l'heure GMT toute l'année : les dates sont en UTC.

export const FESTIVAL = {
  name: 'FestiSolde',
  edition: 'Festival de Noël 2026',
  start: '2026-12-18T00:00:00Z',
  end: '2026-12-28T00:00:00Z', // fin exclue : le festival dure jusqu'au 27 inclus
  datesLabel: 'Du 18 au 27 décembre 2026',
  place: 'Dassasgho, près du canal',
  city: 'Ouagadougou',
  phones: ['78 00 82 45', '78 95 71 50'],
  whatsapp: '22678008245',
  standPrice: 45000,
  deposit: 22500,
  balanceDeadline: '10 décembre',
  firstChoiceCount: 20,
  // Places par univers (50 au total)
  categories: [
    { name: 'Femme', places: 12 },
    { name: 'Homme', places: 10 },
    { name: 'Enfants', places: 10 },
    { name: 'Maison & Meubles', places: 8 },
    { name: 'Beauté', places: 5 },
    { name: 'Électronique', places: 5 },
  ],
};

export const totalPlaces = (festival = FESTIVAL) =>
  festival.categories.reduce((sum, c) => sum + c.places, 0);

/** 'avant' | 'pendant' | 'apres' */
export function festivalPhase(now = new Date(), festival = FESTIVAL) {
  const t = now.getTime();
  if (t < Date.parse(festival.start)) return 'avant';
  if (t < Date.parse(festival.end)) return 'pendant';
  return 'apres';
}

/** Temps restant avant l'ouverture, ou null si le festival a commencé. */
export function countdown(now = new Date(), festival = FESTIVAL) {
  const ms = Date.parse(festival.start) - now.getTime();
  if (ms <= 0) return null;
  const minutes = Math.floor(ms / 60000);
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 };
}

/** Lien WhatsApp pré-rempli pour réserver un stand. */
export function standWhatsappUrl(festival = FESTIVAL) {
  const text = `Bonjour FestiSolde, je souhaite réserver un stand pour le festival (${festival.datesLabel.toLowerCase()}).`;
  return `https://wa.me/${festival.whatsapp}?text=${encodeURIComponent(text)}`;
}
