import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Acheter',
    links: [
      { name: 'Tout le catalogue', to: '/products' },
      { name: 'Vente en gros', to: '/grossistes' },
      { name: 'Liquidation', to: '/liquidation' },
      { name: 'Mon panier', to: '/panier' },
    ],
  },
  {
    title: 'Vendre',
    links: [
      { name: 'Ouvrir ma boutique', to: '/register' },
      { name: 'Espace vendeur', to: '/auth' },
      { name: 'Centre d’aide', to: '/aide' },
    ],
  },
  {
    title: 'FestiSolde',
    links: [
      { name: 'À propos', to: '/about' },
      { name: 'Contact', to: '/contact' },
      { name: 'Conditions (CGU)', to: '/cgu' },
      { name: 'Confidentialité', to: '/privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-stone-300">
      <div className="shop-container py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_2.4fr]">
          {/* Marque */}
          <div className="max-w-sm">
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-10 w-auto brightness-0 invert" />
            <p className="mt-5 text-[15px] leading-relaxed text-stone-400">
              La place de marché du déstockage, des promotions et de la vente en gros au Burkina Faso.
            </p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-orange-300">
              Vendre sur FestiSolde <ArrowRight size={16} />
            </Link>
          </div>

          {/* Liens */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white">{col.title}</h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-[15px] text-stone-400 transition hover:text-white">
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-sm font-bold text-white">Contact</h4>
              <ul className="mt-4 space-y-3 text-[15px] text-stone-400">
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-orange-400" /> Ouagadougou, Burkina Faso
                </li>
                <li>
                  <a href="tel:+22670189912" className="flex items-center gap-2.5 hover:text-white">
                    <Phone size={16} className="shrink-0 text-orange-400" /> +226 70 18 99 12
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@festisolde.com" className="flex items-center gap-2.5 hover:text-white">
                    <Mail size={16} className="shrink-0 text-orange-400" /> contact@festisolde.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">© {new Date().getFullYear()} FestiSolde. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-2" aria-label="Moyens de paiement acceptés">
            {['Orange Money', 'Moov Money', 'Carte bancaire', 'À la livraison'].map((m) => (
              <span key={m} className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-semibold text-stone-400">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
