import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Store, ShoppingBag, Wallet, PartyPopper, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import AdminOverview from './AdminOverview';
import AdminStores from './AdminStores';
import AdminStoreDetail from './AdminStoreDetail';
import AdminOrders from './AdminOrders';
import AdminWithdrawals from './AdminWithdrawals';
import AdminFestival from './AdminFestival';
import { PageHeader } from '../../components/vendor/ui';

const NAV = [
  { to: '/admin', label: 'Vue d’ensemble', short: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/admin/boutiques', label: 'Boutiques', short: 'Boutiques', icon: Store },
  { to: '/admin/commandes', label: 'Commandes', short: 'Commandes', icon: ShoppingBag },
  { to: '/admin/retraits', label: 'Retraits', short: 'Retraits', icon: Wallet, badge: 'withdrawals' },
  { to: '/admin/festival', label: 'Festival', short: 'Festival', icon: PartyPopper },
];

// Poste de pilotage de l'administrateur : coque (menu) + pages.
export default function AdminDashboard() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    // Le rôle admin est vérifié en base (table admins) ; la RLS protège les données de toute façon.
    supabase.rpc('is_admin').then(({ data }) => setAllowed(!!data));
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const refresh = () =>
      supabase.from('withdrawal_requests').select('id', { count: 'exact', head: true }).eq('status', 'en_cours')
        .then(({ count }) => setBadges({ withdrawals: count || 0 }));
    refresh();
    // Nouvelle demande de retrait : le compteur se met à jour tout seul.
    const channel = supabase
      .channel('admin_withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [allowed]);

  if (allowed === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-cream">
        <Loader2 className="animate-spin text-orange-600" size={28} />
      </div>
    );
  }
  if (!allowed) return <Unauthorized />;

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
      isActive ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-[#f6f5f3] text-ink">
      {/* Menu latéral (ordinateur) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink p-4 text-white lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-ink">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="font-extrabold leading-tight">FestiSolde</p>
            <p className="text-xs font-semibold text-stone-400">Administration</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1" aria-label="Administration">
          {NAV.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={link}>
              <Icon size={19} /> <span className="flex-1">{label}</span>
              {badge && badges[badge] > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-ink">{badges[badge]}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-400 hover:text-white">
          <ExternalLink size={16} /> Voir le site
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre du haut (mobile) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden">
          <span className="flex items-center gap-2 font-extrabold">
            <ShieldCheck size={18} className="text-orange-400" /> Admin FestiSolde
          </span>
          <Link to="/" className="rounded-full p-2 text-stone-300" aria-label="Voir le site">
            <ExternalLink size={18} />
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="boutiques" element={<AdminStores />} />
            <Route path="boutiques/:storeId" element={<AdminStoreDetail />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="retraits" element={<AdminWithdrawals />} />
            <Route path="festival" element={<><PageHeader eyebrow="Administration" title="Festival" subtitle="Stands, paiements et relances" /><AdminFestival /></>} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        {/* Navigation du bas (mobile) */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-stone-200 bg-white/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Administration"
        >
          {NAV.map(({ to, short, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${isActive ? 'text-orange-600' : 'text-ink-muted'}`
              }
            >
              <Icon size={21} />
              {short}
              {badge && badges[badge] > 0 && (
                <span className="absolute right-[22%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">
                  {badges[badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Unauthorized() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-ink p-6 text-center text-white">
      <ShieldCheck size={44} className="mb-4 text-orange-400" />
      <h1 className="text-xl font-extrabold">Accès réservé</h1>
      <p className="mt-2 text-sm text-stone-400">Cette zone est réservée à l’administrateur de FestiSolde.</p>
      <Link to="/" className="shop-btn mt-8 bg-white text-ink">Retour au site</Link>
    </div>
  );
}
