import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const BENEFITS = [
  'Votre boutique en ligne en 2 minutes',
  'Commandes reçues directement sur WhatsApp',
  'Paiements Orange Money et Moov Money',
];

// Mise en page commune connexion / inscription : visuel de marque + formulaire.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panneau marque */}
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <img src="/categories/hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="inline-flex">
            <img src="/logo-festisolde.png" alt="FestiSolde" className="h-10 w-auto brightness-0 invert" />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-400">Espace vendeur</p>
            <h2 className="mt-3 max-w-md text-4xl font-extrabold leading-tight tracking-tight">
              Vendez plus vite, sans vous compliquer la vie.
            </h2>
            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-[15px] text-stone-200">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600">
                    <Check size={14} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-stone-400">© {new Date().getFullYear()} FestiSolde</p>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex lg:hidden">
          <img src="/logo-festisolde.png" alt="FestiSolde" className="h-9 w-auto" />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-[15px] text-ink-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
