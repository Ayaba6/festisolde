# Mise en production — checklist

À suivre dans l'ordre. Comptez environ 1 h la première fois.
Idéalement, faites tout d'abord sur le **projet Supabase de test**, vérifiez, puis recommencez sur la production.

---

## 0. Préparatifs (une seule fois)

- [ ] **Dépôt GitHub en privé** : GitHub > `Ayaba6/festisolde` > Settings > General > Danger Zone > *Change visibility*.
  L'ancien fichier `.env` reste visible dans l'historique tant que le dépôt est public.
- [ ] **Projet Supabase de test** : [supabase.com](https://supabase.com) > *New project* (gratuit).
  Mettez ses identifiants dans votre `.env` local : vos essais ne toucheront plus la production.
- [ ] **CLI Supabase** : `npx supabase login` puis `npx supabase link --project-ref <ref-du-projet>`.

## 1. Base de données

Supabase > **Database > Extensions** : activer **pg_cron** (et **pg_net** si vous utilisez les webhooks, étape 4).

Puis, dans **SQL Editor**, exécuter les fichiers de `supabase/migrations/` **dans l'ordre** :

1. `20261116000000_securite_festisolde.sql` — RLS, portefeuilles, commandes, retraits
2. `20261116010000_securite_storage.sql` — règles des images
3. `20261116020000_paiements_ligdicash.sql` — paiements en ligne
4. `20261116030000_suivi_taches_notifications.sql` — suivi de commande, tâches automatiques, abonnements push
5. `20261119000000_festival_slug.sql` — réserve l'adresse /festival

Ensuite :

- [ ] Exécuter `supabase/tests/verifier_securite.sql` → tous les messages doivent être **OK**
  (le script annule tout ce qu'il crée).
- [ ] Contrôler les soldes repris : `select s.name, w.balance from wallets w join stores s on s.id = w.store_id order by 2 desc;`
- [ ] Vérifier les tâches : `select jobname, schedule, active from cron.job;` (2 tâches attendues)

## 2. Paiement LigdiCash

```bash
npx supabase secrets set LIGDICASH_API_KEY=xxx LIGDICASH_AUTH_TOKEN=xxx SITE_URL=https://festisolde.com ALLOWED_ORIGINS=https://festisolde.com,https://www.festisolde.com,https://vendeur.festisolde.com
npx supabase functions deploy ligdicash-create
npx supabase functions deploy ligdicash-verify
npx supabase functions deploy ligdicash-callback --no-verify-jwt
```

- [ ] Faire un vrai paiement de 100 FCFA et vérifier : commande « Payée en ligne », page de retour OK,
  logs de `ligdicash-callback` sans erreur (Supabase > Edge Functions > Logs).

## 3. Notifications push vendeur

1. Générer une paire de clés (une seule fois) :
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Secrets serveur (la clé **privée** ne va jamais dans Vercel ni dans `.env`) :
   ```bash
   npx supabase secrets set VAPID_PUBLIC_KEY=<publique> VAPID_PRIVATE_KEY=<privée> VAPID_SUBJECT=mailto:contact@festisolde.com PUSH_WEBHOOK_SECRET=<longue-chaine-aleatoire>
   npx supabase functions deploy notify-new-order --no-verify-jwt
   ```
3. Vercel > Settings > Environment Variables : `VITE_VAPID_PUBLIC_KEY=<publique>` puis redéployer.
4. Supabase > **Database > Webhooks > Create** :
   - Table `orders`, événement **Insert**
   - Type *HTTP Request*, méthode POST, URL `https://<ref>.supabase.co/functions/v1/notify-new-order`
   - En-tête `x-webhook-secret: <PUSH_WEBHOOK_SECRET>`
- [ ] Sur un téléphone vendeur : tableau de bord > **Activer les notifications**, puis passer une commande test.

> iPhone : les notifications ne fonctionnent que si le site est **ajouté à l'écran d'accueil** (iOS 16.4+).

## 4. Vercel

- [ ] Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`, (facultatif) `VITE_SENTRY_DSN`, `SITE_URL`.
- [ ] Supprimer `VITE_ADMIN_UID` (plus utilisée : l'admin est défini dans la table `admins`).
- [ ] Après déploiement, tester l'aperçu d'un lien produit avec le
  [débogueur de partage Facebook](https://developers.facebook.com/tools/debug/) (même moteur que WhatsApp).

## 5. Suivi des erreurs (facultatif, recommandé)

- [ ] Créer un compte [sentry.io](https://sentry.io) (offre gratuite) > projet **React**.
- [ ] Copier le DSN dans Vercel : `VITE_SENTRY_DSN=...`. Sans DSN, rien n'est chargé.

## 6. Vérifications finales sur le site en ligne

- [ ] Inscription vendeur → boutique créée automatiquement, e-mail de confirmation reçu
- [ ] Ajout d'un produit avec photos (et suppression : les images disparaissent du Storage)
- [ ] Commande « à la livraison » → message WhatsApp avec lien de suivi → page `/commande/<id>`
- [ ] Commande « paiement en ligne » → paiement → retour → badge « Payé en ligne »
- [ ] Passage en « Livré » d'une commande payée → solde vendeur crédité
- [ ] Demande de retrait → validation dans `/admin`
- [ ] Notification push reçue pour une nouvelle commande

## Décisions qui restent à prendre (hors technique)

- **Modèle économique** : aujourd'hui seuls les paiements en ligne rapportent (10 % au retrait). Les commandes payées
  en espèces ne rapportent rien à la plateforme. Options : abonnement vendeur, boosts payants, commission mensuelle
  sur les ventes livrées.
- **Textes légaux** : `/cgu` et `/privacy` décrivent le fonctionnement réel mais doivent être **relus par un juriste**
  (identité légale de l'éditeur, RCCM, juridiction, déclaration éventuelle à la CIL).
- **Coordonnées** : la page Contact indiquait `contact@festisolde.bf`, le reste du site `contact@festisolde.com`.
  Vérifier l'adresse réelle et le numéro WhatsApp du support (`src/pages/Home/components/Aide.tsx`, `Contact.tsx`, `Footer.jsx`).
