import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Truck, Smartphone } from 'lucide-react';

/**
 * Hero de la page d'accueil : promesse claire + 2 actions + preuves de confiance.
 */
export default function FeaturedSection() {
  return (
    <section className="bg-cream">
      <div className="shop-container grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Texte */}
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-700 shadow-card">
            <BadgePercent size={14} /> Déstockage &amp; promotions toute l’année
          </span>

          <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
            Les bonnes affaires du Burkina,{' '}
            <span className="relative whitespace-nowrap text-orange-600">
              en direct
              <svg aria-hidden="true" viewBox="0 0 220 12" className="absolute -bottom-2 left-0 h-3 w-full text-orange-300" preserveAspectRatio="none">
                <path d="M2 9c40-6 120-9 216-4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{' '}
            des vendeurs.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Mode, beauté, électronique, lots en gros… Des prix cassés sur des stocks réels,
            payés en toute sécurité par Mobile Money ou à la livraison.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className="shop-btn-primary px-7 py-3.5 text-[15px]">
              Voir les offres <ArrowRight size={18} />
            </Link>
            <Link to="/grossistes" className="shop-btn-ghost px-7 py-3.5 text-[15px]">
              Acheter en gros
            </Link>
          </div>

          <ul className="mt-10 grid max-w-xl grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            {[
              { icon: BadgePercent, title: 'Prix déstockage', text: 'Prix cassés' },
              { icon: Smartphone, title: 'Orange & Moov', text: 'Paiement sécurisé' },
              { icon: Truck, title: 'Livraison', text: 'Payez à réception' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-card">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block font-bold text-ink">{title}</span>
                  <span className="block text-ink-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visuel */}
        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto aspect-[5/4] w-full overflow-hidden rounded-[2rem] bg-orange-100 shadow-lift sm:aspect-[4/3] lg:aspect-[10/11]">
            <img
              src="/categories/hero.webp"
              alt="Cliente surprise devant un portant de vêtements soldés"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
          <div className="absolute -bottom-4 left-4 hidden rounded-2xl bg-white px-4 py-3 shadow-lift sm:block lg:-left-6 lg:bottom-10">
            <p className="text-xs font-semibold text-ink-muted">Nouveaux arrivages</p>
            <p className="text-lg font-extrabold text-ink">Chaque semaine</p>
          </div>
          <div className="absolute -top-3 right-4 rotate-6 rounded-2xl bg-orange-600 px-4 py-3 text-white shadow-lift lg:-right-4 lg:top-10">
            <p className="text-xs font-semibold opacity-90">Toute l’année</p>
            <p className="text-2xl font-extrabold leading-none">Soldes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
