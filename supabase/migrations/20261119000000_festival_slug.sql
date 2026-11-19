-- /festival est une page du site : aucune boutique ne doit pouvoir prendre cette adresse.
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
    'commande','commandes','mentions-legales','festival','festivals','exposants'
  ]);
$$;

-- Si une boutique avait déjà pris l'adresse « festival », on lui en donne une autre.
update public.stores
set slug = public.unique_store_slug(slug || '-boutique')
where slug in ('festival', 'festivals', 'exposants');
