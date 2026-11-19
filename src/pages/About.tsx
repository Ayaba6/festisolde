import { Link } from 'react-router-dom';
import { BadgePercent, Smartphone, Store, MessageCircle, ArrowRight } from 'lucide-react';
import { ONLINE_PAYMENT } from '../lib/config';

const VALUES = [
  { icon: BadgePercent, title: 'Des prix vraiment cassés', text: 'Fins de séries, déstockages, lots en gros : les vendeurs écoulent leurs stocks, vous faites de bonnes affaires.' },
  { icon: Store, title: 'En direct des vendeurs', text: 'Pas d’intermédiaire caché : chaque produit appartient à une boutique que vous pouvez contacter.' },
  { icon: Smartphone, title: 'Pensé pour le mobile', text: ONLINE_PAYMENT ? 'Commande en quelques clics, paiement Orange Money ou Moov Money, ou en espèces à la livraison.' : 'Commande en quelques clics depuis votre téléphone, paiement en espèces à la livraison.' },
  { icon: MessageCircle, title: 'Simple comme un message', text: 'Le vendeur reçoit votre commande sur WhatsApp et organise la livraison avec vous.' },
];

export default function About() {
  return (
    <div>
      <section className="bg-cream">
        <div className="shop-container max-w-4xl py-14 text-center md:py-20">
          <p className="shop-eyebrow">À propos</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
            La place de marché des bonnes affaires au Burkina Faso
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            FestiSolde aide les commerçants à écouler leurs stocks plus vite, et permet à chacun d’acheter moins cher,
            en toute confiance, depuis son téléphone.
          </p>
        </div>
      </section>

      <section className="shop-container max-w-5xl py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-stone-100 bg-white p-6 shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Icon size={22} /></span>
              <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/products" className="shop-btn-primary px-7 py-3.5">Découvrir les offres <ArrowRight size={18} /></Link>
          <Link to="/register" className="shop-btn-ghost px-7 py-3.5">Vendre sur FestiSolde</Link>
        </div>
      </section>
    </div>
  );
}
