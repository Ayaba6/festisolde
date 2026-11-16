-- =====================================================================
-- FestiSolde — Suivi de commande, tâches automatiques, notifications push
-- ---------------------------------------------------------------------
-- À exécuter APRÈS les migrations 000000, 010000 et 020000.
-- Prérequis : extension pg_cron (Supabase > Database > Extensions > pg_cron).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Suivi de commande public
-- ---------------------------------------------------------------------
-- L'identifiant de commande (UUID impossible à deviner) sert de "ticket".
-- On ne renvoie AUCUNE donnée personnelle du client (ni nom, ni téléphone, ni GPS).
create or replace function public.get_order_tracking(p_order_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'reference', upper(left(o.id::text, 8)),
    'status', o.status,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'total', o.total_amount,
    'items', coalesce(o.items, '[]'::jsonb),
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'store', jsonb_build_object('name', s.name, 'slug', s.slug, 'whatsapp_number', s.whatsapp_number)
  )
  from orders o
  join stores s on s.id = o.store_id
  where o.id = p_order_id;
$$;
grant execute on function public.get_order_tracking(uuid) to anon, authenticated;

-- /commande est une route du site : on la réserve.
create or replace function public.is_reserved_slug(p text)
returns boolean
language sql immutable
as $$
  select p = any (array[
    'admin','api','auth','login','register','dashboard','products','products-manage',
    'produit','panier','cart','checkout','confirmation','order-success','grossistes',
    'liquidation','aide','help','analytics','marketing','revenus','withdrawal-history',
    'ma-boutique','settings','boutique','vendeur','studio','www','about','contact',
    'privacy','cgu','cgv','festisolde','support','assets','static','manifest','paiement',
    'commande','commandes','mentions-legales'
  ]);
$$;

-- ---------------------------------------------------------------------
-- 2. Notifications push (abonnements des vendeurs)
-- ---------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push: le vendeur gère ses appareils" on public.push_subscriptions;
create policy "push: le vendeur gère ses appareils"
  on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

commit;

-- ---------------------------------------------------------------------
-- 3. Tâches automatiques (pg_cron) — hors transaction
-- ---------------------------------------------------------------------
create extension if not exists pg_cron;

-- Fonctions appelées par les tâches (exécutées par postgres : contexte de confiance).
create or replace function public.cancel_abandoned_online_orders()
returns integer
language plpgsql security definer
set search_path = public
as $$
declare n integer;
begin
  -- Paiements en ligne jamais finalisés après 3 h : on ferme le paiement…
  update payments p
     set status = 'notcompleted', updated_at = now()
    from orders o
   where o.id = p.order_id
     and p.status = 'pending'
     and o.payment_status <> 'paye'
     and p.created_at < now() - interval '3 hours';

  -- …et on annule la commande, ce qui remet le stock (trigger orders_guard).
  update orders
     set status = 'annulé'
   where payment_method = 'ligdicash'
     and payment_status <> 'paye'
     and status in ('nouveau', 'en_attente')
     and created_at < now() - interval '3 hours';
  get diagnostics n = row_count;
  return n;
end $$;

-- Protection des données : la position GPS des clients n'est gardée que 90 jours.
create or replace function public.purge_old_customer_locations()
returns integer
language plpgsql security definer
set search_path = public
as $$
declare n integer;
begin
  update orders
     set customer_location = null
   where customer_location is not null
     and created_at < now() - interval '90 days';
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.cancel_abandoned_online_orders() from public, anon, authenticated;
revoke execute on function public.purge_old_customer_locations() from public, anon, authenticated;

-- (Re)programmation des tâches
do $$
begin
  perform cron.unschedule(jobid) from cron.job
   where jobname in ('festisolde-cancel-abandoned', 'festisolde-purge-gps');
end $$;

select cron.schedule('festisolde-cancel-abandoned', '*/10 * * * *', $$select public.cancel_abandoned_online_orders();$$);
select cron.schedule('festisolde-purge-gps', '30 3 * * *', $$select public.purge_old_customer_locations();$$);

-- Vérification : select jobname, schedule, active from cron.job;
