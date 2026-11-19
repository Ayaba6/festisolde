-- =====================================================================
-- FestiSolde — Réservation des stands du festival de Noël 2026
-- ---------------------------------------------------------------------
-- À exécuter APRÈS 20261119000000_festival_slug.sql.
--
-- Règles :
--   * une boutique = un stand par édition, dans une des 6 catégories ;
--   * la place est GARANTIE par l'acompte (22 500 F). Une réservation non
--     payée bloque la place 30 minutes, le temps de payer ;
--   * statut calculé d'après le montant payé : reserve → acompte → paye ;
--   * paiement en ligne (LigdiCash, Edge Function festival-stand-pay) ou
--     enregistré par l'admin (espèces, Orange Money direct…).
-- Montants et places : à garder identiques à src/lib/festival.js.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Réglages
-- ---------------------------------------------------------------------
create or replace function public.festival_places(p_category text)
returns integer
language sql immutable
as $$
  select case p_category
    when 'Femme' then 12
    when 'Homme' then 10
    when 'Enfants' then 10
    when 'Maison & Meubles' then 8
    when 'Beauté' then 5
    when 'Électronique' then 5
  end;
$$;

-- 45 000 F le stand, acompte 22 500 F.
create or replace function public.festival_status_for(p_paid integer)
returns text
language sql immutable
as $$
  select case when p_paid >= 45000 then 'paye' when p_paid >= 22500 then 'acompte' else 'reserve' end;
$$;

-- ---------------------------------------------------------------------
-- 2. Table des stands
-- ---------------------------------------------------------------------
create table if not exists public.festival_stands (
  id          uuid primary key default gen_random_uuid(),
  edition     text not null default 'noel-2026',
  store_id    uuid not null references public.stores(id) on delete cascade,
  category    text not null check (public.festival_places(category) is not null),
  status      text not null default 'reserve' check (status in ('reserve', 'acompte', 'paye', 'annule')),
  amount_paid integer not null default 0 check (amount_paid between 0 and 45000),
  held_until  timestamptz not null default now() + interval '30 minutes',
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (edition, store_id)
);
create index if not exists festival_stands_category_idx on public.festival_stands(edition, category);

alter table public.festival_stands enable row level security;

drop policy if exists "festival_stands: lecture par le vendeur ou l'admin" on public.festival_stands;
create policy "festival_stands: lecture par le vendeur ou l'admin"
  on public.festival_stands for select to authenticated
  using (
    public.is_admin()
    or store_id in (select id from public.stores where owner_id = auth.uid())
  );
-- Aucune écriture directe : uniquement via les fonctions ci-dessous.

-- Places occupées dans une catégorie (payées, ou réservées depuis moins de 30 min).
create or replace function public.festival_taken(p_category text, p_exclude uuid default null)
returns integer
language sql stable security definer
set search_path = public
as $$
  select count(*)::int
    from festival_stands
   where edition = 'noel-2026'
     and category = p_category
     and id is distinct from p_exclude
     and (status in ('acompte', 'paye') or (status = 'reserve' and held_until > now()));
$$;
revoke execute on function public.festival_taken(text, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Lecture publique : places restantes et exposants confirmés
-- ---------------------------------------------------------------------
create or replace function public.get_festival_availability()
returns table (category text, places integer, taken integer)
language sql stable security definer
set search_path = public
as $$
  select c.name, festival_places(c.name), festival_taken(c.name)
    from unnest(array['Femme', 'Homme', 'Enfants', 'Maison & Meubles', 'Beauté', 'Électronique'])
         with ordinality as c(name, pos)
   order by c.pos;
$$;

create or replace function public.get_festival_exhibitors()
returns table (store_id uuid, name text, slug text, logo_url text, category text)
language sql stable security definer
set search_path = public
as $$
  select s.id, s.name, s.slug, s.logo_url, f.category
    from festival_stands f
    join stores s on s.id = f.store_id
   where f.edition = 'noel-2026'
     and f.status in ('acompte', 'paye')
     and coalesce(s.status, 'active') <> 'hidden'
   order by f.category, s.name;
$$;

grant execute on function public.get_festival_availability() to anon, authenticated;
grant execute on function public.get_festival_exhibitors() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Côté vendeur : réserver / annuler
-- ---------------------------------------------------------------------
create or replace function public.reserve_festival_stand(p_category text)
returns public.festival_stands
language plpgsql security definer
set search_path = public
as $$
declare
  v_store uuid;
  v_row   festival_stands%rowtype;
begin
  if festival_places(p_category) is null then
    raise exception 'Catégorie inconnue.';
  end if;

  select id into v_store from stores where owner_id = auth.uid();
  if v_store is null then
    raise exception 'Créez d''abord votre boutique.';
  end if;

  -- Une seule réservation à la fois par catégorie : pas de surréservation.
  perform pg_advisory_xact_lock(hashtext('festival:' || p_category));

  select * into v_row from festival_stands
   where edition = 'noel-2026' and store_id = v_store
   for update;

  -- Stand annulé par l'admin après paiement : on ne le réactive pas tout seul.
  if v_row.status = 'annule' and v_row.amount_paid > 0 then
    raise exception 'Votre réservation a été annulée : contactez-nous.';
  end if;

  -- Stand déjà (partiellement) payé : la catégorie ne change plus sans l'admin.
  if v_row.id is not null and v_row.status <> 'annule' and v_row.amount_paid > 0 then
    if v_row.category = p_category then
      return v_row;
    end if;
    raise exception 'Votre stand est déjà payé : contactez-nous pour changer de catégorie.';
  end if;

  if festival_taken(p_category, v_row.id) >= festival_places(p_category) then
    raise exception 'Plus de place dans la catégorie %.', p_category;
  end if;

  if v_row.id is null then
    insert into festival_stands (store_id, category)
    values (v_store, p_category)
    returning * into v_row;
  else
    update festival_stands
       set category = p_category,
           status = festival_status_for(amount_paid),
           held_until = now() + interval '30 minutes',
           updated_at = now()
     where id = v_row.id
    returning * into v_row;
  end if;

  return v_row;
end $$;

create or replace function public.cancel_festival_stand()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update festival_stands
     set status = 'annule', updated_at = now()
   where edition = 'noel-2026'
     and store_id in (select id from stores where owner_id = auth.uid())
     and status = 'reserve'
     and amount_paid = 0;
  if not found then
    raise exception 'Seule une réservation pas encore payée peut être annulée. Contactez-nous.';
  end if;
end $$;

revoke execute on function public.reserve_festival_stand(text) from public, anon;
revoke execute on function public.cancel_festival_stand() from public, anon;
grant execute on function public.reserve_festival_stand(text) to authenticated;
grant execute on function public.cancel_festival_stand() to authenticated;

-- ---------------------------------------------------------------------
-- 5. Paiements : la table payments sert aussi aux stands
-- ---------------------------------------------------------------------
alter table public.payments alter column order_id drop not null;
alter table public.payments add column if not exists stand_id uuid references public.festival_stands(id) on delete cascade;
alter table public.payments drop constraint if exists payments_target_check;
alter table public.payments add constraint payments_target_check
  check ((order_id is null) <> (stand_id is null));
create index if not exists payments_stand_idx on public.payments(stand_id);

drop policy if exists "payments: lecture de ses paiements de stand" on public.payments;
create policy "payments: lecture de ses paiements de stand"
  on public.payments for select to authenticated
  using (
    stand_id in (select f.id from public.festival_stands f
                 join public.stores s on s.id = f.store_id
                 where s.owner_id = auth.uid())
  );

-- Appelée par l'Edge Function avant de créer la facture LigdiCash.
-- Renvoie le montant dû (acompte, puis solde). Le montant ne vient jamais du navigateur.
create or replace function public.festival_prepare_payment(p_stand_id uuid, p_user uuid)
returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  v festival_stands%rowtype;
begin
  select * into v from festival_stands where id = p_stand_id for update;
  if not found then
    raise exception 'Réservation introuvable.';
  end if;
  if not exists (select 1 from stores where id = v.store_id and owner_id = p_user) then
    raise exception 'Cette réservation ne vous appartient pas.';
  end if;
  if v.status = 'annule' then
    raise exception 'Cette réservation est annulée.';
  end if;
  if v.amount_paid >= 45000 then
    raise exception 'Votre stand est déjà entièrement payé.';
  end if;

  -- Premier paiement : on revérifie la place et on la bloque 30 min.
  if v.amount_paid = 0 then
    perform pg_advisory_xact_lock(hashtext('festival:' || v.category));
    if festival_taken(v.category, v.id) >= festival_places(v.category) then
      raise exception 'Plus de place dans la catégorie %.', v.category;
    end if;
    update festival_stands
       set held_until = now() + interval '30 minutes', updated_at = now()
     where id = v.id;
  end if;

  return case when v.amount_paid < 22500 then 22500 - v.amount_paid else 45000 - v.amount_paid end;
end $$;

revoke execute on function public.festival_prepare_payment(uuid, uuid) from public, anon, authenticated;
grant execute on function public.festival_prepare_payment(uuid, uuid) to service_role;

-- confirm_payment : même logique qu'avant pour les commandes, plus les stands.
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

  -- Paiement d'un stand du festival
  if v_pay.stand_id is not null then
    if p_status = 'completed' then
      update festival_stands
         set amount_paid = least(45000, amount_paid + v_pay.amount::int),
             status = festival_status_for(least(45000, amount_paid + v_pay.amount::int)),
             updated_at = now()
       where id = v_pay.stand_id;
    end if;
    return p_status;
  end if;

  -- Paiement d'une commande
  select * into v_order from orders where id = v_pay.order_id for update;

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

-- ---------------------------------------------------------------------
-- 6. Côté admin : paiements hors ligne et annulation
-- ---------------------------------------------------------------------
create or replace function public.admin_record_stand_payment(p_stand_id uuid, p_amount integer, p_note text default null)
returns public.festival_stands
language plpgsql security definer
set search_path = public
as $$
declare
  v festival_stands%rowtype;
begin
  if not is_admin() then
    raise exception 'Réservé à l''administrateur.';
  end if;
  select * into v from festival_stands where id = p_stand_id for update;
  if not found then
    raise exception 'Réservation introuvable.';
  end if;
  if p_amount is null or p_amount <= 0 or v.amount_paid + p_amount > 45000 then
    raise exception 'Montant invalide (reste à payer : % F).', 45000 - v.amount_paid;
  end if;

  insert into payments (stand_id, amount, status, paid_amount, operator_name, operator_reference)
  values (p_stand_id, p_amount, 'completed', p_amount, 'Enregistré par l''admin', left(p_note, 120));

  update festival_stands
     set amount_paid = amount_paid + p_amount,
         status = festival_status_for(amount_paid + p_amount),
         admin_note = coalesce(nullif(left(p_note, 300), ''), admin_note),
         updated_at = now()
   where id = p_stand_id
  returning * into v;
  return v;
end $$;

create or replace function public.admin_cancel_stand(p_stand_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Réservé à l''administrateur.';
  end if;
  -- Le montant déjà payé reste visible pour suivre un éventuel remboursement.
  update festival_stands set status = 'annule', updated_at = now() where id = p_stand_id;
end $$;

revoke execute on function public.admin_record_stand_payment(uuid, integer, text) from public, anon;
revoke execute on function public.admin_cancel_stand(uuid) from public, anon;
grant execute on function public.admin_record_stand_payment(uuid, integer, text) to authenticated;
grant execute on function public.admin_cancel_stand(uuid) to authenticated;

commit;
