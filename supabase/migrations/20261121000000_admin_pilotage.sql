-- =====================================================================
-- FestiSolde — Tableau de pilotage administrateur
-- ---------------------------------------------------------------------
-- À exécuter APRÈS 20261120000000_festival_stands.sql.
-- Fonctions de lecture réservées à l'admin (is_admin()) : chiffres
-- agrégés calculés en base, et fiche propriétaire d'une boutique
-- (e-mail et dernière connexion, stockés dans auth.users).
-- =====================================================================

begin;

create or replace function public.admin_overview()
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'UTC')::date;   -- Ouagadougou = GMT
  v jsonb;
begin
  if not is_admin() then
    raise exception 'Réservé à l''administrateur.';
  end if;

  with o as (
    select created_at, total_amount, status, payment_status
      from orders
  ), valid as (
    select * from o where status <> 'annulé'
  )
  select jsonb_build_object(
    'orders', jsonb_build_object(
      'today', (select count(*) from o where created_at::date = v_today),
      'week',  (select count(*) from o where created_at >= now() - interval '7 days'),
      'month', (select count(*) from o where created_at >= now() - interval '30 days'),
      'total', (select count(*) from o)
    ),
    'revenue', jsonb_build_object(
      'today', (select coalesce(sum(total_amount), 0) from valid where created_at::date = v_today),
      'week',  (select coalesce(sum(total_amount), 0) from valid where created_at >= now() - interval '7 days'),
      'month', (select coalesce(sum(total_amount), 0) from valid where created_at >= now() - interval '30 days'),
      'total', (select coalesce(sum(total_amount), 0) from valid)
    ),
    'stores', jsonb_build_object(
      'total',    (select count(*) from stores),
      'hidden',   (select count(*) from stores where status = 'hidden'),
      'verified', (select count(*) from stores where is_verified),
      'new_week', (select count(*) from stores where created_at >= now() - interval '7 days'),
      'no_whatsapp', (select count(*) from stores where coalesce(whatsapp_number, '') = '' and coalesce(status, 'active') <> 'hidden'),
      'no_product', (select count(*) from stores s where not exists (select 1 from products p where p.store_id = s.id))
    ),
    'products', jsonb_build_object(
      'total',        (select count(*) from products),
      'new_week',     (select count(*) from products where created_at >= now() - interval '7 days'),
      'out_of_stock', (select count(*) from products where coalesce(stock_quantity, 0) <= 0)
    ),
    'todo', jsonb_build_object(
      'withdrawals',        (select count(*) from withdrawal_requests where status = 'en_cours'),
      'withdrawals_amount', (select coalesce(sum(amount), 0) from withdrawal_requests where status = 'en_cours'),
      'stuck_orders',       (select count(*) from orders where status in ('nouveau', 'en_attente') and created_at < now() - interval '48 hours'),
      'stands_unpaid',      (select count(*) from festival_stands where status = 'reserve'),
      'stands_balance',     (select count(*) from festival_stands where status = 'acompte')
    ),
    'money', jsonb_build_object(
      'wallets',     (select coalesce(sum(balance), 0) from wallets),
      'withdrawn',   (select coalesce(sum(amount), 0) from withdrawal_requests where status = 'valide'),
      'commissions', (select coalesce(sum(amount), 0) * 0.10 from withdrawal_requests where status = 'valide'),
      'stands',      (select coalesce(sum(amount_paid), 0) from festival_stands)
    ),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'orders', coalesce(x.n, 0), 'revenue', coalesce(x.r, 0)) order by d), '[]'::jsonb)
        from generate_series(v_today - 29, v_today, interval '1 day') d
        left join (
          select created_at::date as day, count(*) as n, sum(total_amount) filter (where status <> 'annulé') as r
            from orders
           where created_at >= v_today - 29
           group by 1
        ) x on x.day = d::date
    )
  ) into v;

  return v;
end $$;

-- Fiche d'une boutique : propriétaire et chiffres clés.
create or replace function public.admin_store_detail(p_store_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  v jsonb;
begin
  if not is_admin() then
    raise exception 'Réservé à l''administrateur.';
  end if;

  select jsonb_build_object(
    'owner_email',     u.email,
    'owner_since',     u.created_at,
    'last_sign_in_at', u.last_sign_in_at,
    'orders',          (select count(*) from orders where store_id = s.id),
    'orders_open',     (select count(*) from orders where store_id = s.id and status in ('nouveau', 'en_attente', 'en cours')),
    'revenue',         (select coalesce(sum(total_amount), 0) from orders where store_id = s.id and status <> 'annulé'),
    'products',        (select count(*) from products where store_id = s.id),
    'balance',         (select coalesce(balance, 0) from wallets where store_id = s.id),
    'withdrawn',       (select coalesce(sum(amount), 0) from withdrawal_requests where store_id = s.id and status = 'valide'),
    'stand',           (select jsonb_build_object('category', category, 'status', status, 'amount_paid', amount_paid)
                          from festival_stands where store_id = s.id and edition = 'noel-2026')
  )
  into v
  from stores s
  left join auth.users u on u.id = s.owner_id
  where s.id = p_store_id;

  return v;
end $$;

revoke execute on function public.admin_overview() from public, anon;
revoke execute on function public.admin_store_detail(uuid) from public, anon;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_store_detail(uuid) to authenticated;

commit;
