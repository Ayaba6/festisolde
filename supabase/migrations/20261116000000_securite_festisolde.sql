-- =====================================================================
-- FestiSolde — Migration de sécurité (refonte RLS, portefeuilles, commandes)
-- ---------------------------------------------------------------------
-- À exécuter UNE fois dans Supabase > SQL Editor (ou `supabase db push`).
-- Tout est dans une transaction : si une étape échoue, rien n'est appliqué.
--
-- Principes :
--   * RLS activée sur toutes les tables, aucune écriture "libre" côté client.
--   * L'argent (soldes, retraits) ne bouge QUE via des fonctions serveur.
--   * Le solde vendeur est déplacé dans `wallets` (plus lisible publiquement)
--     et chaque mouvement est tracé dans `wallet_transactions`.
--   * Les commandes sont créées par `place_order`, qui recalcule les prix.
--   * Un vendeur n'est crédité que pour une commande PAYÉE EN LIGNE ET LIVRÉE.
--     (`payment_status = 'paye'` ne peut être posé que par le serveur,
--      ex. futur webhook LigdiCash avec la clé service_role.)
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Administrateurs
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Aucune policy : la table n'est lisible qu'à travers is_admin().

insert into public.admins (user_id)
values ('185c1fba-7aa6-4936-b7f8-43e435a2963d')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Vrai quand le code s'exécute dans une fonction serveur (SECURITY DEFINER,
-- propriétaire postgres) ou avec la clé service_role : jamais depuis le navigateur.
create or replace function public.is_trusted_context()
returns boolean
language sql stable
as $$
  select current_user in ('postgres', 'supabase_admin', 'service_role');
$$;

-- ---------------------------------------------------------------------
-- 1. Suppression de toutes les anciennes policies (on repart propre)
-- ---------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('stores','products','orders','withdrawal_requests',
                        'marketing_requests','store_analytics','product_stats')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 2. Anciennes fonctions dangereuses
-- ---------------------------------------------------------------------
drop function if exists public.deduct_balance(uuid, numeric);
drop function if exists public.increment_balance(uuid, numeric);
drop function if exists public.increment_sales(uuid, integer);
drop function if exists public.update_stocks_after_payment(jsonb);

-- Ancien trigger qui créditait le solde à chaque passage en "livré"
do $$
declare r record;
begin
  for r in
    select t.tgname, c.relname
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_proc p on p.oid = t.tgfoid
    where p.proname = 'handle_order_delivered_balance' and not t.tgisinternal
  loop
    execute format('drop trigger %I on public.%I', r.tgname, r.relname);
  end loop;
end $$;
drop function if exists public.handle_order_delivered_balance();

-- ---------------------------------------------------------------------
-- 3. Slugs de boutique
-- ---------------------------------------------------------------------
create or replace function public.normalize_slug(p text)
returns text
language sql immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(p, ''),
      'àâäáãåéèêëíìîïóòôöõúùûüçñÀÂÄÁÃÅÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÇÑ',
      'aaaaaaeeeeiiiiooooouuuucnAAAAAAEEEEIIIIOOOOOUUUUCN')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- Chemins déjà utilisés par l'application : une boutique ne peut pas les prendre.
create or replace function public.is_reserved_slug(p text)
returns boolean
language sql immutable
as $$
  select p = any (array[
    'admin','api','auth','login','register','dashboard','products','products-manage',
    'produit','panier','cart','checkout','confirmation','order-success','grossistes',
    'liquidation','aide','help','analytics','marketing','revenus','withdrawal-history',
    'ma-boutique','settings','boutique','vendeur','studio','www','about','contact',
    'privacy','cgu','festisolde','support','assets','static','manifest'
  ]);
$$;

create or replace function public.unique_store_slug(p_name text)
returns text
language plpgsql stable
set search_path = public
as $$
declare
  base text := left(normalize_slug(p_name), 40);
  candidate text;
  n int := 1;
begin
  if base is null or length(base) < 2 then base := 'boutique'; end if;
  candidate := base;
  while is_reserved_slug(candidate) or exists (select 1 from stores where slug = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end $$;

-- ---------------------------------------------------------------------
-- 4. Boutiques
-- ---------------------------------------------------------------------
-- Une boutique par vendeur, slug unique (si les données le permettent).
do $$
begin
  if not exists (select owner_id from public.stores group by owner_id having count(*) > 1) then
    create unique index if not exists stores_owner_id_key on public.stores(owner_id);
  else
    raise notice 'Doublons de owner_id dans stores : index unique non créé, à nettoyer.';
  end if;
  if not exists (select slug from public.stores group by slug having count(*) > 1) then
    create unique index if not exists stores_slug_key on public.stores(slug);
  else
    raise notice 'Doublons de slug dans stores : index unique non créé, à nettoyer.';
  end if;
end $$;

create or replace function public.stores_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Slug : normalisé et contrôlé à la création ou quand il change.
  if tg_op = 'INSERT' or new.slug is distinct from old.slug then
    new.slug := normalize_slug(coalesce(nullif(new.slug, ''), new.name));
    if length(new.slug) < 2 then
      raise exception 'Adresse de boutique trop courte.';
    end if;
    if is_reserved_slug(new.slug) then
      raise exception 'L''adresse "%" est réservée, choisissez-en une autre.', new.slug;
    end if;
  end if;

  if is_trusted_context() or is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.owner_id    := auth.uid();
    new.is_verified := false;
    new.status      := 'active';
  else
    new.id          := old.id;
    new.owner_id    := old.owner_id;
    new.created_at  := old.created_at;
    new.is_verified := old.is_verified;
    new.status      := old.status;
  end if;
  return new;
end $$;

drop trigger if exists stores_guard on public.stores;
create trigger stores_guard
  before insert or update on public.stores
  for each row execute function public.stores_guard();

alter table public.stores enable row level security;

create policy "stores: lecture publique des boutiques actives"
  on public.stores for select
  using (coalesce(status, 'active') <> 'hidden' or owner_id = auth.uid() or public.is_admin());

create policy "stores: un vendeur crée sa boutique"
  on public.stores for insert to authenticated
  with check (owner_id = auth.uid());

create policy "stores: le vendeur modifie sa boutique"
  on public.stores for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "stores: suppression admin"
  on public.stores for delete to authenticated
  using (public.is_admin());

-- Création automatique de la boutique à l'inscription
-- (le formulaire passe `store_name` dans les métadonnées : options.data.store_name).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(new.raw_user_meta_data ->> 'store_name'), '');
begin
  if v_name is not null then
    insert into stores (owner_id, name, slug)
    values (new.id, left(v_name, 80), unique_store_slug(v_name))
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created_store on auth.users;
create trigger on_auth_user_created_store
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Portefeuilles (solde vendeur) + journal des mouvements
-- ---------------------------------------------------------------------
create table if not exists public.wallets (
  store_id   uuid primary key references public.stores(id) on delete cascade,
  balance    numeric not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references public.stores(id) on delete cascade,
  amount       numeric not null,              -- positif = crédit, négatif = débit
  kind         text not null check (kind in ('vente','retrait','remboursement_retrait','annulation_vente','reprise_migration')),
  reference_id uuid,
  created_at   timestamptz not null default now()
);
create index if not exists wallet_transactions_store_idx on public.wallet_transactions(store_id, created_at desc);

-- Reprise des anciens soldes (À VÉRIFIER : ils ont pu être falsifiés, cf. audit).
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'stores' and column_name = 'balance') then
    insert into public.wallets (store_id, balance)
    select id, greatest(coalesce(balance, 0), 0) from public.stores
    on conflict (store_id) do nothing;

    insert into public.wallet_transactions (store_id, amount, kind)
    select id, balance, 'reprise_migration' from public.stores where coalesce(balance, 0) > 0;

    alter table public.stores drop column balance;
  end if;
end $$;

insert into public.wallets (store_id)
select id from public.stores
on conflict (store_id) do nothing;

create or replace function public.create_wallet_for_store()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into wallets (store_id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists stores_create_wallet on public.stores;
create trigger stores_create_wallet
  after insert on public.stores
  for each row execute function public.create_wallet_for_store();

-- Seul point d'entrée pour modifier un solde (interne, non appelable par l'API).
create or replace function public._wallet_apply(p_store_id uuid, p_amount numeric, p_kind text, p_ref uuid)
returns numeric
language plpgsql security definer
set search_path = public
as $$
declare v_balance numeric;
begin
  update wallets
     set balance = balance + p_amount, updated_at = now()
   where store_id = p_store_id
   returning balance into v_balance;
  if not found then
    raise exception 'Portefeuille introuvable.';
  end if;
  insert into wallet_transactions (store_id, amount, kind, reference_id)
  values (p_store_id, p_amount, p_kind, p_ref);
  return v_balance;
end $$;
revoke execute on function public._wallet_apply(uuid, numeric, text, uuid) from public, anon, authenticated;

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "wallets: lecture par le propriétaire ou l'admin"
  on public.wallets for select to authenticated
  using (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()));

create policy "wallet_transactions: lecture par le propriétaire ou l'admin"
  on public.wallet_transactions for select to authenticated
  using (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 6. Produits
-- ---------------------------------------------------------------------
-- sale_price = prix promo optionnel (le formulaire envoie null quand il est vide).
alter table public.products alter column sale_price drop not null;
alter table public.products alter column sale_price drop default;

alter table public.products drop constraint if exists products_prices_positive;
alter table public.products add constraint products_prices_positive
  check (price >= 0 and (sale_price is null or sale_price >= 0)) not valid;
alter table public.products drop constraint if exists products_stock_positive;
alter table public.products add constraint products_stock_positive
  check (stock_quantity is null or stock_quantity >= 0) not valid;

create or replace function public.product_unit_price(p public.products)
returns numeric
language sql immutable
as $$
  select case when p.sale_price is not null and p.sale_price > 0 then p.sale_price else p.price end;
$$;

create or replace function public.products_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if is_trusted_context() or is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.sold_count       := 0;
    new.sales_count      := 0;
    new.views            := 0;
    new.is_featured_home := false;
  else
    new.id               := old.id;
    new.store_id         := old.store_id;
    new.created_at       := old.created_at;
    new.sold_count       := old.sold_count;
    new.sales_count      := old.sales_count;
    new.views            := old.views;
    new.is_featured_home := old.is_featured_home;
  end if;
  return new;
end $$;

drop trigger if exists products_guard on public.products;
create trigger products_guard
  before insert or update on public.products
  for each row execute function public.products_guard();

alter table public.products enable row level security;

create policy "products: lecture publique (boutiques actives)"
  on public.products for select
  using (
    public.is_admin()
    or store_id in (select id from public.stores where coalesce(status, 'active') <> 'hidden' or owner_id = auth.uid())
  );

create policy "products: le vendeur gère ses produits"
  on public.products for all to authenticated
  using (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()))
  with check (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 7. Commandes
-- ---------------------------------------------------------------------
alter table public.orders add column if not exists payment_status text not null default 'non_paye';
alter table public.orders add column if not exists credited_at   timestamptz;
alter table public.orders add column if not exists updated_at    timestamptz not null default now();

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('non_paye', 'paye', 'rembourse'));

-- Création d'une commande : les prix viennent de la base, jamais du navigateur.
-- p_items : [{ "product_id": uuid, "quantity": int, "size": text, "color": text }]
create or replace function public.place_order(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_city text default null,
  p_customer_location text default null,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_store   stores%rowtype;
  v_item    jsonb;
  v_product products%rowtype;
  v_qty     int;
  v_unit    numeric;
  v_total   numeric := 0;
  v_lines   jsonb := '[]'::jsonb;
  v_order   uuid;
  v_phone   text := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9+]', '', 'g');
begin
  if length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'Nom du client requis.';
  end if;
  if length(v_phone) < 8 then
    raise exception 'Numéro de téléphone invalide.';
  end if;
  if p_customer_location is not null and p_customer_location !~ '^https://www\.google\.com/maps\?q=-?[0-9.]+,-?[0-9.]+$' then
    p_customer_location := null;
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Panier invalide.';
  end if;

  select * into v_store from stores where id = p_store_id and coalesce(status, 'active') <> 'hidden';
  if not found then
    raise exception 'Boutique introuvable ou indisponible.';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item ->> 'quantity')::int, 0);
    if v_qty < 1 or v_qty > 100 then
      raise exception 'Quantité invalide.';
    end if;

    select * into v_product
      from products
     where id = (v_item ->> 'product_id')::uuid and store_id = p_store_id
     for update;
    if not found then
      raise exception 'Un article du panier n''est plus disponible.';
    end if;
    if v_product.stock_quantity is not null and v_product.stock_quantity < v_qty then
      raise exception 'Stock insuffisant pour "%" (reste %).', v_product.name, v_product.stock_quantity;
    end if;

    v_unit  := product_unit_price(v_product);
    v_total := v_total + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'quantity', v_qty,
      'unit_price', v_unit,
      'size', left(v_item ->> 'size', 40),
      'color', left(v_item ->> 'color', 40),
      'image', coalesce(v_product.image_url, v_product.images[1])
    );

    update products
       set stock_quantity = case when stock_quantity is null then null else stock_quantity - v_qty end,
           sold_count     = coalesce(sold_count, 0) + v_qty
     where id = v_product.id;
  end loop;

  insert into orders (store_id, customer_name, customer_phone, customer_city, customer_location,
                      items, total_amount, status, payment_status)
  values (p_store_id, left(trim(p_customer_name), 80), v_phone, left(p_customer_city, 120),
          p_customer_location, v_lines, v_total, 'nouveau', 'non_paye')
  returning id into v_order;

  return jsonb_build_object(
    'order_id', v_order,
    'total', v_total,
    'items', v_lines,
    'store_slug', v_store.slug,
    'whatsapp_number', v_store.whatsapp_number
  );
end $$;
grant execute on function public.place_order(uuid, text, text, text, text, jsonb) to anon, authenticated;

-- Garde-fou + mouvements d'argent lors des changements de statut.
create or replace function public.orders_guard()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_caller_trusted boolean := (session_user in ('postgres', 'supabase_admin') or auth.role() = 'service_role');
  v_admin boolean := is_admin();
  v_line jsonb;
begin
  if not (v_caller_trusted or v_admin) then
    -- Un vendeur ne peut changer QUE le statut de livraison.
    new.id                := old.id;
    new.store_id          := old.store_id;
    new.customer_name     := old.customer_name;
    new.customer_phone    := old.customer_phone;
    new.customer_city     := old.customer_city;
    new.customer_location := old.customer_location;
    new.items             := old.items;
    new.total_amount      := old.total_amount;
    new.created_at        := old.created_at;
    new.payment_status    := old.payment_status;
    new.credited_at       := old.credited_at;
    if new.status not in ('nouveau', 'en_attente', 'en cours', 'livré', 'annulé') then
      raise exception 'Statut de commande invalide.';
    end if;
    if old.status = 'annulé' and new.status <> 'annulé' then
      raise exception 'Une commande annulée ne peut pas être réactivée.';
    end if;
    if (old.credited_at is not null or old.payment_status = 'paye') and new.status = 'annulé' then
      raise exception 'Commande payée en ligne : contactez le support pour l''annuler (remboursement du client).';
    end if;
  end if;

  new.updated_at := now();

  -- Annulation : on remet le stock.
  if new.status = 'annulé' and old.status <> 'annulé' then
    for v_line in select * from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) loop
      update products
         set stock_quantity = case when stock_quantity is null then null
                                   else stock_quantity + coalesce((v_line ->> 'quantity')::int, 0) end,
             sold_count = greatest(coalesce(sold_count, 0) - coalesce((v_line ->> 'quantity')::int, 0), 0)
       where id = (v_line ->> 'id')::uuid;
    end loop;
    if new.credited_at is not null then
      perform _wallet_apply(new.store_id, -new.total_amount, 'annulation_vente', new.id);
      new.credited_at := null;
    end if;
  end if;

  -- Crédit vendeur : uniquement commande payée en ligne ET livrée, une seule fois.
  if new.status = 'livré' and new.payment_status = 'paye' and new.credited_at is null then
    perform _wallet_apply(new.store_id, new.total_amount, 'vente', new.id);
    new.credited_at := now();
  end if;

  return new;
end $$;

drop trigger if exists orders_guard on public.orders;
create trigger orders_guard
  before update on public.orders
  for each row execute function public.orders_guard();

alter table public.orders enable row level security;

create policy "orders: lecture par le vendeur ou l'admin"
  on public.orders for select to authenticated
  using (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()));

create policy "orders: le vendeur met à jour le statut"
  on public.orders for update to authenticated
  using (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()))
  with check (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()));

create policy "orders: suppression admin"
  on public.orders for delete to authenticated
  using (public.is_admin());
-- Pas de policy INSERT : les commandes passent obligatoirement par place_order().

-- ---------------------------------------------------------------------
-- 8. Retraits
-- ---------------------------------------------------------------------
alter table public.withdrawal_requests drop constraint if exists withdrawal_amount_positive;
alter table public.withdrawal_requests add constraint withdrawal_amount_positive check (amount > 0) not valid;

create or replace function public.request_withdrawal(p_amount numeric, p_method text, p_details text)
returns public.withdrawal_requests
language plpgsql security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_balance  numeric;
  v_row      withdrawal_requests%rowtype;
  v_phone    text := regexp_replace(coalesce(p_details, ''), '[^0-9+]', '', 'g');
begin
  if auth.uid() is null then
    raise exception 'Connexion requise.';
  end if;
  if p_amount is null or p_amount < 500 or p_amount <> trunc(p_amount) then
    raise exception 'Montant minimum : 500 FCFA (nombre entier).';
  end if;
  if p_method not in ('Orange Money', 'Moov Money', 'Wave', 'Virement') then
    raise exception 'Moyen de paiement invalide.';
  end if;
  if length(v_phone) < 8 then
    raise exception 'Numéro de réception invalide.';
  end if;

  select id into v_store_id from stores where owner_id = auth.uid();
  if v_store_id is null then
    raise exception 'Aucune boutique associée à ce compte.';
  end if;

  -- Verrou : deux demandes simultanées ne peuvent pas dépasser le solde.
  select balance into v_balance from wallets where store_id = v_store_id for update;
  if coalesce(v_balance, 0) < p_amount then
    raise exception 'Solde insuffisant.';
  end if;

  insert into withdrawal_requests (vendor_id, store_id, amount, payment_method, payment_details, status)
  values (auth.uid(), v_store_id, p_amount, p_method, v_phone, 'en_cours')
  returning * into v_row;

  perform _wallet_apply(v_store_id, -p_amount, 'retrait', v_row.id);
  return v_row;
end $$;
grant execute on function public.request_withdrawal(numeric, text, text) to authenticated;

create or replace function public.process_withdrawal(p_id uuid, p_decision text)
returns public.withdrawal_requests
language plpgsql security definer
set search_path = public
as $$
declare v_row withdrawal_requests%rowtype;
begin
  if not is_admin() then
    raise exception 'Action réservée à l''administrateur.';
  end if;
  if p_decision not in ('valide', 'rejete') then
    raise exception 'Décision invalide.';
  end if;

  select * into v_row from withdrawal_requests where id = p_id for update;
  if not found then
    raise exception 'Demande introuvable.';
  end if;
  if v_row.status <> 'en_cours' then
    raise exception 'Cette demande a déjà été traitée.';
  end if;

  update withdrawal_requests
     set status = p_decision, processed_at = now()
   where id = p_id
   returning * into v_row;

  if p_decision = 'rejete' then
    perform _wallet_apply(v_row.store_id, v_row.amount, 'remboursement_retrait', v_row.id);
  end if;
  return v_row;
end $$;
grant execute on function public.process_withdrawal(uuid, text) to authenticated;

alter table public.withdrawal_requests enable row level security;

create policy "withdrawals: lecture par le vendeur ou l'admin"
  on public.withdrawal_requests for select to authenticated
  using (vendor_id = auth.uid() or public.is_admin());
-- Pas d'INSERT/UPDATE/DELETE direct : uniquement request_withdrawal / process_withdrawal.

-- ---------------------------------------------------------------------
-- 9. Statistiques (compteurs de vues)
-- ---------------------------------------------------------------------
create or replace function public.increment_store_view(target_store_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from stores where id = target_store_id) then return; end if;
  insert into store_analytics (store_id, visit_date, views_count)
  values (target_store_id, current_date, 1)
  on conflict (store_id, visit_date)
  do update set views_count = store_analytics.views_count + 1;
end $$;

create or replace function public.increment_product_views(row_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update products set views = coalesce(views, 0) + 1 where id = row_id;
end $$;

-- p_store_id est ignoré : la boutique est déduite du produit (impossible de gonfler une autre boutique).
create or replace function public.track_store_visit(p_product_id uuid, p_store_id uuid default null)
returns void
language plpgsql security definer
set search_path = public
as $$
declare v_store uuid;
begin
  update products set views = coalesce(views, 0) + 1
   where id = p_product_id
   returning store_id into v_store;
  if v_store is not null then
    perform increment_store_view(v_store);
  end if;
end $$;

grant execute on function public.increment_store_view(uuid) to anon, authenticated;
grant execute on function public.increment_product_views(uuid) to anon, authenticated;
grant execute on function public.track_store_visit(uuid, uuid) to anon, authenticated;

alter table public.store_analytics enable row level security;
create policy "store_analytics: lecture par le vendeur ou l'admin"
  on public.store_analytics for select to authenticated
  using (public.is_admin() or store_id in (select id from public.stores where owner_id = auth.uid()));

alter table public.product_stats enable row level security;
create policy "product_stats: lecture par le vendeur ou l'admin"
  on public.product_stats for select to authenticated
  using (
    public.is_admin()
    or product_id in (select p.id from public.products p join public.stores s on s.id = p.store_id
                      where s.owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- 10. Demandes marketing (boosts)
-- ---------------------------------------------------------------------
alter table public.marketing_requests enable row level security;

create policy "marketing: le vendeur dépose une demande"
  on public.marketing_requests for insert to authenticated
  with check (
    seller_id = auth.uid()
    and coalesce(status, 'en_attente') = 'en_attente'
    and (product_id is null or product_id in (
          select p.id from public.products p join public.stores s on s.id = p.store_id
          where s.owner_id = auth.uid()))
  );

create policy "marketing: lecture par le vendeur ou l'admin"
  on public.marketing_requests for select to authenticated
  using (seller_id = auth.uid() or public.is_admin());

create policy "marketing: gestion admin"
  on public.marketing_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "marketing: suppression admin"
  on public.marketing_requests for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 11. Fonctions internes : jamais appelables depuis l'API
-- ---------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_wallet_for_store() from public, anon, authenticated;
revoke execute on function public.unique_store_slug(text) from public, anon, authenticated;

commit;

-- =====================================================================
-- Vérifications conseillées après exécution :
--   select tablename, rowsecurity from pg_tables where schemaname = 'public';
--   select * from wallets;                      -- soldes repris (à contrôler !)
--   select * from wallet_transactions order by created_at desc;
-- =====================================================================
