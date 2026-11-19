import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, MapPin, Smile, Gift, Ticket, Clock, ArrowRight, MessageCircle, Phone, Store, Check,
} from 'lucide-react';
import Header from './Home/components/Header';
import Footer from './Home/components/Footer';
import { FESTIVAL, festivalPhase, countdown, totalPlaces, standWhatsappUrl } from '@/lib/festival';
import { formatPrice } from './Store/ProductCard';

const ANIMATIONS = [
  { icon: Smile, title: 'Espace enfants', text: 'Des jeux pour les petits pendant que les grands font leurs achats.' },
  { icon: Gift, title: 'Jeux et cadeaux', text: 'Des jeux tous les jours, avec des cadeaux à gagner.' },
  { icon: Ticket, title: 'Grande tombola', text: 'Un ticket par achat, tirage le 27 décembre.' },
  { icon: Clock, title: "L'Heure Folle", text: 'Chaque jour, une catégorie passe en super-promo pendant une heure.' },
];

const PROGRAMME = [
  { dates: '18 → 24 déc.', title: 'Les cadeaux', text: 'Enfants, Femme et Homme à l’honneur pour préparer Noël.' },
  { dates: '25 déc.', title: 'Noël', text: 'Une journée en famille, avec animations.' },
  { dates: '26 → 27 déc.', title: 'La grande liquidation', text: 'Les plus grosses remises pour finir l’année.' },
];

const STAND_INCLUDES = [
  'Votre emplacement pendant les 10 jours',
  'Votre boutique en ligne sur festisolde.com, qui reste après le festival',
  'La publicité commune : affiches et réseaux sociaux',
  'Votre nom sur un lot de la grande tombola',
];

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function CountdownBox({ value, label }) {
  return (
    <div className="flex min-w-[76px] flex-col items-center rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15">
      <span className="text-3xl font-extrabold tabular-nums md:text-4xl">{String(value).padStart(2, '0')}</span>
      <span className="mt-1 text-xs font-bold uppercase tracking-wide text-stone-300">{label}</span>
    </div>
  );
}

export default function Festival() {
  const now = useNow();
  const phase = festivalPhase(now);
  const left = countdown(now);
  const standUrl = standWhatsappUrl();

  useEffect(() => {
    document.title = `Festival ${FESTIVAL.name} — ${FESTIVAL.datesLabel}`;
  }, []);

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      {/* Ouverture */}
      <section className="relative overflow-hidden bg-ink text-white">
        <img
          src="/festival/foule.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" aria-hidden="true" />
        <div className="shop-container relative py-14 md:py-24">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-400">
            {FESTIVAL.edition} · {FESTIVAL.city}
          </p>
          <h1 className="mt-4 text-6xl font-extrabold leading-[0.9] tracking-tighter md:text-8xl">
            FESTI<span className="text-orange-400">SOLDE</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-200 md:text-xl">
            Le festival des soldes de fin d’année : 10 jours où les commerçants cassent les prix,
            avec un espace enfants, des jeux et une grande tombola.
          </p>

          <div className="mt-6 flex flex-col gap-3 text-base font-bold sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={20} className="text-orange-400" /> {FESTIVAL.datesLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={20} className="text-orange-400" /> {FESTIVAL.place}, {FESTIVAL.city}
            </span>
          </div>

          {phase === 'avant' && left && (
            <div className="mt-8" aria-live="polite">
              <p className="text-sm font-bold text-stone-300">Ouverture dans</p>
              <div className="mt-3 flex gap-3">
                <CountdownBox value={left.days} label={left.days > 1 ? 'jours' : 'jour'} />
                <CountdownBox value={left.hours} label="heures" />
                <CountdownBox value={left.minutes} label="min" />
              </div>
            </div>
          )}
          {phase === 'pendant' && (
            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-extrabold text-ink">
              <span className="h-2 w-2 animate-pulse rounded-full bg-ink" aria-hidden="true" /> Le festival est ouvert, venez nous voir !
            </p>
          )}
          {phase === 'apres' && (
            <p className="mt-8 max-w-xl rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold">
              Merci à tous les visiteurs et exposants ! Rendez-vous pour la prochaine édition.
              En attendant, les bonnes affaires continuent en ligne.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {phase !== 'apres' && (
              <a href={standUrl} target="_blank" rel="noopener noreferrer" className="shop-btn-primary">
                <Store size={18} /> Réserver un stand
              </a>
            )}
            <Link to="/products" className="shop-btn border border-white/30 text-white hover:bg-white/10">
              Voir les bonnes affaires <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section className="shop-container py-14 md:py-20" aria-labelledby="anim-title">
        <p className="shop-eyebrow">Pour toute la famille</p>
        <h2 id="anim-title" className="shop-title mt-2">Bien plus que des soldes</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid grid-cols-2 gap-3">
            <img src="/festival/enfants.webp" alt="Des enfants qui s'amusent dans une piscine gonflable" loading="lazy" className="col-span-2 h-56 w-full rounded-3xl object-cover md:h-72" />
            <img src="/festival/stand.webp" alt="Des tissus colorés exposés sur un stand" loading="lazy" className="h-40 w-full rounded-3xl object-cover md:h-52" />
            <img src="/festival/shopping.webp" alt="Des mains chargées de sacs de shopping" loading="lazy" className="h-40 w-full rounded-3xl object-cover md:h-52" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {ANIMATIONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-3xl border border-stone-100 bg-cream p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-extrabold">{title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Programme */}
      <section className="bg-stone-50/70 py-14 md:py-20" aria-labelledby="prog-title">
        <div className="shop-container">
          <p className="shop-eyebrow">10 jours</p>
          <h2 id="prog-title" className="shop-title mt-2">Le programme</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {PROGRAMME.map((step, i) => (
              <li key={step.title} className={`rounded-3xl bg-white p-6 shadow-card border-t-4 ${i === 2 ? 'border-orange-600' : 'border-ink'}`}>
                <p className="text-sm font-extrabold text-ink-muted">{step.dates}</p>
                <p className="mt-1 text-xl font-extrabold">{step.title}</p>
                <p className="mt-2 text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Univers */}
      <section className="shop-container py-14 md:py-20" aria-labelledby="univers-title">
        <p className="shop-eyebrow">{totalPlaces()} stands</p>
        <h2 id="univers-title" className="shop-title mt-2">Ce que vous trouverez</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FESTIVAL.categories.map((c) => (
            <li key={c.name} className="rounded-3xl border border-stone-100 bg-white p-5 text-center shadow-card">
              <p className="text-lg font-extrabold">{c.name}</p>
              <p className="mt-1 text-sm text-ink-muted">{c.places} stands</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Exposants */}
      {phase !== 'apres' && (
        <section className="bg-ink py-14 text-white md:py-20" aria-labelledby="expo-title">
          <div className="shop-container grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-400">Commerçants, boutiques, grossistes</p>
              <h2 id="expo-title" className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Devenez exposant</h2>
              <p className="mt-4 max-w-lg text-stone-300">
                Écoulez votre stock avant la fin d’année et faites-vous connaître auprès des familles qui viennent faire leurs achats de Noël.
              </p>
              <ul className="mt-6 space-y-3">
                {STAND_INCLUDES.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check size={20} className="mt-0.5 shrink-0 text-orange-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 text-ink md:p-8">
              <p className="text-sm font-extrabold uppercase tracking-wide text-ink-muted">Votre stand, 10 jours</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">{formatPrice(FESTIVAL.standPrice)}</p>
              <p className="mt-1 font-bold text-orange-700">soit {formatPrice(FESTIVAL.standPrice / 10)} par jour</p>

              <ol className="mt-6 space-y-3 border-t border-stone-100 pt-6">
                <li className="flex gap-3"><span className="font-extrabold text-orange-700">1</span> Contactez-nous sur WhatsApp ou par téléphone</li>
                <li className="flex gap-3"><span className="font-extrabold text-orange-700">2</span> Acompte de {formatPrice(FESTIVAL.deposit)}, solde avant le {FESTIVAL.balanceDeadline}</li>
                <li className="flex gap-3"><span className="font-extrabold text-orange-700">3</span> Les {FESTIVAL.firstChoiceCount} premiers inscrits choisissent leur emplacement</li>
              </ol>

              <p className="mt-6 rounded-2xl bg-cream p-4 text-sm text-ink-soft">
                <strong>La règle du jeu :</strong> au moins -10 % sur tout le stand et au moins 3 « Prix Festi » à -30 % ou plus.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a href={standUrl} target="_blank" rel="noopener noreferrer" className="shop-btn bg-[#25d366] text-ink hover:brightness-95">
                  <MessageCircle size={18} /> Réserver sur WhatsApp
                </a>
                <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-bold">
                  <Phone size={16} className="text-ink-muted" aria-hidden="true" />
                  {FESTIVAL.phones.map((p) => (
                    <a key={p} href={`tel:+226${p.replace(/\s/g, '')}`} className="hover:text-orange-700">{p}</a>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Infos pratiques */}
      <section className="shop-container py-14 md:py-20" aria-labelledby="infos-title">
        <h2 id="infos-title" className="shop-title">Infos pratiques</h2>
        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-cream p-6">
            <dt className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink-muted"><CalendarDays size={16} /> Dates</dt>
            <dd className="mt-2 text-lg font-extrabold">{FESTIVAL.datesLabel}</dd>
          </div>
          <div className="rounded-3xl bg-cream p-6">
            <dt className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink-muted"><MapPin size={16} /> Lieu</dt>
            <dd className="mt-2 text-lg font-extrabold">{FESTIVAL.place}, {FESTIVAL.city}</dd>
          </div>
          <div className="rounded-3xl bg-cream p-6">
            <dt className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink-muted"><Phone size={16} /> Contact</dt>
            <dd className="mt-2 text-lg font-extrabold">{FESTIVAL.phones.join(' · ')}</dd>
          </div>
        </dl>
      </section>

      <Footer />
    </div>
  );
}
