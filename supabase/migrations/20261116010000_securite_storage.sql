-- =====================================================================
-- FestiSolde — Sécurisation du Storage (images produits, logos, bannières)
-- ---------------------------------------------------------------------
-- À exécuter APRÈS 20261116000000_securite_festisolde.sql (utilise is_admin()).
--
-- Règles :
--   * Les buckets restent publics en LECTURE (les images s'affichent via leur URL).
--   * Un vendeur n'écrit / modifie / supprime QUE dans son dossier : {son_id}/...
--   * Images uniquement (jpeg, png, webp, gif), 5 Mo maximum.
--   * Pas de listing global des fichiers (aucune policy SELECT publique).
--   * `banners` et `store-logos` ne sont plus utilisés par le site : gelés
--     (lecture des fichiers existants OK, plus aucun envoi possible).
-- =====================================================================

begin;

-- 1. Limites des buckets ------------------------------------------------
update storage.buckets
   set file_size_limit    = 5 * 1024 * 1024,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
 where id in ('product-images', 'store-assets', 'banners', 'store-logos');

-- 2. On repart de zéro sur les règles des fichiers ----------------------
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

-- 3. Règles vendeur : uniquement dans son propre dossier ----------------
create policy "storage: le vendeur voit ses fichiers"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('product-images', 'store-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: le vendeur envoie dans son dossier"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('product-images', 'store-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: le vendeur remplace ses fichiers"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('product-images', 'store-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('product-images', 'store-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: le vendeur supprime ses fichiers"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('product-images', 'store-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Admin : accès complet (modération) ---------------------------------
create policy "storage: admin accès complet"
  on storage.objects for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;

-- Vérification :
--   select id, public, file_size_limit, allowed_mime_types from storage.buckets;
--   select policyname, cmd from pg_policies where schemaname = 'storage';
--
-- Fichiers déposés hors d'un dossier vendeur (anciens envois "à la racine") :
--   select bucket_id, name, created_at from storage.objects
--   where (storage.foldername(name))[1] is null
--      or (storage.foldername(name))[1] !~ '^[0-9a-f-]{36}$';
