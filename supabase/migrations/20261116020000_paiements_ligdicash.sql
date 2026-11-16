-- =====================================================================
-- FestiSolde — Paiements en ligne LigdiCash
-- ---------------------------------------------------------------------
-- À exécuter APRÈS 20261116000000_securite_festisolde.sql.
--
-- Flux :
--   1. Le client crée sa commande (place_order) puis l'Edge Function
--      `ligdicash-create` crée une ligne `payments` + une facture LigdiCash.
--   2. LigdiCash appelle `ligdicash-callback` ; la fonction RE-VÉRIFIE le
--      statut auprès de LigdiCash (confirm) puis appelle confirm_payment().
--   3. confirm_payment() marque la commande `paye` (ou l'annule et remet le
--      stock si le paiement a échoué). Le vendeur est crédité quand il passe
--      la commande en "livré" (trigger orders_guard).
-- Seule la clé service_role (Edge Functions) peut écrire dans payments.
-- =====================================================================

begin;

alter table public.orders add column if not exists payment_method text not null default 'livraison';
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('livraison', 'ligdicash'));

create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),  -- = transaction_id envoyé à LigdiCash
  order_id             uuid not null references public.orders(id) on delete cascade,
  amount               numeric not null check (amount > 0),
  status               text not null default 'pending'
                         check (status in ('pending', 'completed', 'notcompleted')),
  ligdicash_token      text,          -- token de CRÉATION (le seul utilisable pour confirm)
  operator_name        text,
  operator_reference   text,
  paid_amount          numeric,
  callback_received_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists payments_order_idx on public.payments(order_id);
create index if not exists payments_pending_idx on public.payments(created_at) where status = 'pending';

alter table public.payments enable row level security;

create policy "payments: lecture par le vendeur ou l'admin"
  on public.payments for select to authenticated
  using (
    public.is_admin()
    or order_id in (select o.id from public.orders o
                    join public.stores s on s.id = o.store_id
                    where s.owner_id = auth.uid())
  );
-- Aucune écriture depuis le navigateur.

-- Appliqué par les Edge Functions (service_role) APRÈS vérification auprès de LigdiCash.
create or replace function public.confirm_payment(
  p_payment_id uuid,
  p_status text,
  p_paid_amount numeric default null,
  p_operator_name text default null,
  p_operator_reference text default null,
  p_from_callback boolean default false
)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_pay   payments%rowtype;
  v_order orders%rowtype;
begin
  if p_status not in ('pending', 'completed', 'notcompleted') then
    raise exception 'Statut de paiement invalide.';
  end if;

  select * into v_pay from payments where id = p_payment_id for update;
  if not found then
    raise exception 'Paiement introuvable.';
  end if;

  if p_from_callback then
    update payments set callback_received_at = coalesce(callback_received_at, now()) where id = p_payment_id;
  end if;

  -- Idempotence : un paiement déjà finalisé ne change plus.
  if v_pay.status <> 'pending' or p_status = 'pending' then
    return v_pay.status;
  end if;

  select * into v_order from orders where id = v_pay.order_id for update;

  -- Montant payé inférieur au montant attendu : on refuse.
  if p_status = 'completed' and coalesce(p_paid_amount, 0) < v_pay.amount then
    p_status := 'notcompleted';
  end if;

  update payments
     set status = p_status,
         paid_amount = p_paid_amount,
         operator_name = left(p_operator_name, 60),
         operator_reference = left(p_operator_reference, 120),
         updated_at = now()
   where id = p_payment_id;

  if p_status = 'completed' then
    update orders set payment_status = 'paye' where id = v_order.id;
  elsif v_order.payment_status <> 'paye' and v_order.status <> 'annulé'
        and not exists (select 1 from payments where order_id = v_order.id and status = 'pending' and id <> p_payment_id) then
    -- Paiement échoué ou abandonné : la commande est annulée et le stock remis.
    update orders set status = 'annulé' where id = v_order.id;
  end if;

  return p_status;
end $$;

revoke execute on function public.confirm_payment(uuid, text, numeric, text, text, boolean) from public, anon, authenticated;
grant execute on function public.confirm_payment(uuid, text, numeric, text, text, boolean) to service_role;

-- La route /paiement est utilisée par le site : on la réserve.
create or replace function public.is_reserved_slug(p text)
returns boolean
language sql immutable
as $$
  select p = any (array[
    'admin','api','auth','login','register','dashboard','products','products-manage',
    'produit','panier','cart','checkout','confirmation','order-success','grossistes',
    'liquidation','aide','help','analytics','marketing','revenus','withdrawal-history',
    'ma-boutique','settings','boutique','vendeur','studio','www','about','contact',
    'privacy','cgu','festisolde','support','assets','static','manifest','paiement'
  ]);
$$;

commit;
