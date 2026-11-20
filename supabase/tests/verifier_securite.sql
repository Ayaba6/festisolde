-- =====================================================================
-- FestiSolde — Vérification de la sécurité (à lancer APRÈS les migrations)
-- ---------------------------------------------------------------------
-- Supabase > SQL Editor : coller et exécuter. Tout se passe dans une
-- transaction annulée à la fin (ROLLBACK) : AUCUNE donnée n'est conservée.
-- Résultat attendu : uniquement des lignes "OK" dans l'onglet Messages/Notices
-- et "TOUS LES TESTS SONT PASSÉS" à la fin.
-- =====================================================================
begin;

do $$
declare
  v_user  uuid := gen_random_uuid();
  v_other uuid := gen_random_uuid();
  v_store uuid;
  v_prod  uuid;
  v_res   jsonb;
  v_n     int;
  v_fail  int := 0;
  procedure_ok boolean;
begin
  -- Données de test (créées en tant qu'administrateur de la base)
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_user,  'test-vendeur@festisolde.invalid', '{"store_name":"Boutique Test"}'),
    (v_other, 'test-autre@festisolde.invalid',   '{"store_name":"Autre Test"}');
  select id into v_store from stores where owner_id = v_user;
  if v_store is null then raise exception 'La boutique n''a pas été créée à l''inscription'; end if;
  raise notice 'OK  la boutique est créée automatiquement à l''inscription';

  update wallets set balance = 1000 where store_id = v_store;
  insert into products (store_id, name, price, sale_price, stock_quantity)
  values (v_store, 'Produit test', 10000, 8000, 5) returning id into v_prod;

  -- ---------- En tant que VISITEUR (anon) ----------
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;

  select count(*) into v_n from orders;
  if v_n = 0 then raise notice 'OK  un visiteur ne voit aucune commande';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un visiteur voit % commande(s)', v_n; end if;

  select count(*) into v_n from withdrawal_requests;
  if v_n = 0 then raise notice 'OK  un visiteur ne voit aucun retrait';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un visiteur voit des retraits'; end if;

  -- Commande avec un prix recalculé côté serveur
  v_res := place_order(v_store, 'Client Test', '70000000', 'Ouaga', null,
                       jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 2)));
  if (v_res->>'total')::numeric = 16000 then raise notice 'OK  place_order calcule le prix en base (2 x 8000)';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC total inattendu : %', v_res->>'total'; end if;

  begin
    insert into orders (store_id, customer_name, total_amount) values (v_store, 'Pirate', 1);
    v_fail := v_fail + 1; raise warning 'ÉCHEC un visiteur peut insérer une commande directement';
  exception when others then raise notice 'OK  insertion directe de commande refusée';
  end;

  reset role;

  -- ---------- En tant que VENDEUR ----------
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
  set local role authenticated;

  update stores set is_verified = true, status = 'active' where id = v_store;
  select count(*) into v_n from stores where id = v_store and is_verified;
  if v_n = 0 then raise notice 'OK  un vendeur ne peut pas se déclarer « vérifié »';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur peut se vérifier lui-même'; end if;

  update wallets set balance = 999999 where store_id = v_store;
  select count(*) into v_n from wallets where store_id = v_store and balance = 999999;
  if v_n = 0 then raise notice 'OK  un vendeur ne peut pas modifier son solde';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur peut modifier son solde'; end if;

  update orders set total_amount = 1, payment_status = 'paye' where store_id = v_store;
  select count(*) into v_n from orders where store_id = v_store and (total_amount = 1 or payment_status = 'paye');
  if v_n = 0 then raise notice 'OK  un vendeur ne peut changer ni le montant ni le statut de paiement';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur peut modifier montant/paiement'; end if;

  update orders set status = 'livré' where store_id = v_store;
  select balance into v_n from wallets where store_id = v_store;
  if v_n = 1000 then raise notice 'OK  livrer une commande non payée en ligne ne crédite pas le solde';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC solde modifié par une commande non payée : %', v_n; end if;

  begin
    perform request_withdrawal(-5000, 'Orange Money', '70000000');
    v_fail := v_fail + 1; raise warning 'ÉCHEC retrait négatif accepté';
  exception when others then raise notice 'OK  retrait négatif refusé';
  end;

  begin
    perform request_withdrawal(5000, 'Orange Money', '70000000');
    v_fail := v_fail + 1; raise warning 'ÉCHEC retrait supérieur au solde accepté';
  exception when others then raise notice 'OK  retrait supérieur au solde refusé';
  end;

  perform request_withdrawal(500, 'Orange Money', '70000000');
  select balance into v_n from wallets where store_id = v_store;
  if v_n = 500 then raise notice 'OK  retrait valide : solde débité une seule fois';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC solde après retrait : %', v_n; end if;

  begin
    perform process_withdrawal((select id from withdrawal_requests where store_id = v_store limit 1), 'valide');
    v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur peut valider son propre retrait';
  exception when others then raise notice 'OK  seul l''admin peut valider un retrait';
  end;

  select exists (select 1 from pg_proc where proname in ('deduct_balance', 'increment_balance')) into procedure_ok;
  if not procedure_ok then raise notice 'OK  les anciennes fonctions dangereuses sont supprimées';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC deduct_balance / increment_balance existent encore'; end if;

  -- ---------- En tant qu'AUTRE VENDEUR ----------
  perform set_config('request.jwt.claims', json_build_object('sub', v_other, 'role', 'authenticated')::text, true);
  select count(*) into v_n from orders where store_id = v_store;
  if v_n = 0 then raise notice 'OK  un vendeur ne voit pas les commandes des autres';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur voit les commandes d''une autre boutique'; end if;

  update products set price = 1 where id = v_prod;
  select count(*) into v_n from products where id = v_prod and price = 1;
  if v_n = 0 then raise notice 'OK  un vendeur ne peut pas modifier les produits des autres';
  else v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur modifie le produit d''un autre'; end if;

  begin
    perform admin_overview();
    v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur lit le tableau de bord admin';
  exception when others then raise notice 'OK  le tableau de bord admin est réservé à l''admin';
  end;

  begin
    perform admin_store_detail(v_store);
    v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur lit la fiche (e-mail) d''une autre boutique';
  exception when others then raise notice 'OK  la fiche propriétaire est réservée à l''admin';
  end;

  -- ---------- Festival : stands (toujours en tant qu'AUTRE VENDEUR) ----------
  declare
    v_stand festival_stands%rowtype;
    v_pay   uuid;
  begin
    v_stand := reserve_festival_stand('Femme');
    if v_stand.status = 'reserve' and v_stand.amount_paid = 0 then raise notice 'OK  un vendeur réserve un stand (non payé)';
    else v_fail := v_fail + 1; raise warning 'ÉCHEC réservation de stand : %', v_stand.status; end if;

    begin
      insert into festival_stands (store_id, category, amount_paid, status) values (v_store, 'Homme', 45000, 'paye');
      v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur crée un stand « payé » directement';
    exception when others then raise notice 'OK  impossible de créer un stand payé sans payer';
    end;

    begin
      perform admin_record_stand_payment(v_stand.id, 45000, 'triche');
      v_fail := v_fail + 1; raise warning 'ÉCHEC un vendeur enregistre lui-même un paiement de stand';
    exception when others then raise notice 'OK  seul l''admin enregistre un paiement hors ligne';
    end;

    begin
      perform festival_prepare_payment(v_stand.id, v_other);
      v_fail := v_fail + 1; raise warning 'ÉCHEC festival_prepare_payment est appelable depuis le navigateur';
    exception when others then raise notice 'OK  le montant à payer n''est calculé que côté serveur';
    end;

    reset role;

    -- Paiement en ligne confirmé (comme le ferait l'Edge Function)
    insert into payments (stand_id, amount) values (v_stand.id, 22500) returning id into v_pay;
    perform confirm_payment(v_pay, 'completed', 22500, 'test', 'ref-test', false);
    select * into v_stand from festival_stands where id = v_stand.id;
    if v_stand.status = 'acompte' and v_stand.amount_paid = 22500 then raise notice 'OK  l''acompte payé garantit la place';
    else v_fail := v_fail + 1; raise warning 'ÉCHEC après acompte : % / %', v_stand.status, v_stand.amount_paid; end if;

    select count(*) into v_n from get_festival_exhibitors() where store_id = v_stand.store_id;
    if v_n = 1 then raise notice 'OK  la boutique apparaît dans les exposants';
    else v_fail := v_fail + 1; raise warning 'ÉCHEC exposant absent de la liste'; end if;
  end;

  reset role;

  if v_fail = 0 then raise notice '==> TOUS LES TESTS SONT PASSÉS';
  else raise warning '==> % TEST(S) EN ÉCHEC : ne pas mettre en production', v_fail; end if;
end $$;

rollback;
