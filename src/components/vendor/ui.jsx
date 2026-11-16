// Composants communs de l'espace vendeur (même identité que la vitrine).
import { Link } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';

export const formatF = (v) => `${Math.round(Number(v) || 0).toLocaleString('fr-FR')} F`;

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="shop-eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className = '', children, as: Tag = 'div', ...props }) {
  return (
    <Tag className={`rounded-3xl border border-stone-100 bg-white shadow-card ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, to, tone = 'default' }) {
  const tones = {
    default: 'bg-stone-100 text-ink',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-sky-50 text-sky-700',
  };
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-muted">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink md:text-[1.7rem]">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
    </>
  );
  const cls = 'block rounded-3xl border border-stone-100 bg-white p-5 shadow-card transition';
  return to ? (
    <Link to={to} className={`${cls} hover:-translate-y-0.5 hover:shadow-lift`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const STATUS = {
  nouveau: { label: 'Nouveau', cls: 'bg-sky-50 text-sky-700' },
  en_attente: { label: 'En attente', cls: 'bg-stone-100 text-ink-soft' },
  'en cours': { label: 'En cours', cls: 'bg-amber-50 text-amber-700' },
  'livré': { label: 'Livré', cls: 'bg-green-50 text-green-700' },
  'annulé': { label: 'Annulé', cls: 'bg-red-50 text-red-700' },
  en_cours: { label: 'En traitement', cls: 'bg-amber-50 text-amber-700' },
  valide: { label: 'Payé', cls: 'bg-green-50 text-green-700' },
  rejete: { label: 'Refusé', cls: 'bg-red-50 text-red-700' },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status || '—', cls: 'bg-stone-100 text-ink-soft' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
          <Icon size={26} />
        </span>
      )}
      <p className="mt-4 text-lg font-bold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageLoader({ label = 'Chargement…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-muted">
      <Loader2 className="animate-spin text-orange-600" size={28} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {hint && <span className="font-normal text-ink-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Modal({ title, subtitle, onClose, children, size = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative flex max-h-[92vh] w-full ${size} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="-mr-2 rounded-full p-2 text-ink-muted hover:bg-stone-100 hover:text-ink" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
