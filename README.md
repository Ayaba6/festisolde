# FestiSolde

Place de marché du déstockage, des promotions et de la vente en gros au Burkina Faso.
Les acheteurs commandent en ligne (paiement Orange Money / Moov Money / carte via LigdiCash, ou en espèces à la
livraison) ; les vendeurs gèrent leur boutique, reçoivent les commandes sur WhatsApp et par notification push.

## Démarrer en local

```bash
npm install
cp .env.example .env   # puis renseigner les valeurs (idéalement celles du projet Supabase de TEST)
npm run dev            # http://localhost:5173
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (`dist/`) |
| `npm test` | Tests automatiques (Vitest) |
| `npm run lint` | Vérification du code (ESLint) |

> ⚠️ Ne développez pas sur la base de production : chaque essai créerait de vraies commandes.
> Utilisez un second projet Supabase « test » (voir `docs/MISE-EN-PRODUCTION.md`).

## Architecture

```
frontend/
├── api/og.js                    Aperçus WhatsApp/Facebook par produit et boutique (fonction Vercel)
├── public/                      Images statiques (logo, catégories, aperçu par défaut)
├── src/
│   ├── App.tsx                  Routes (chargées à la demande) + coque de l'espace vendeur
│   ├── sw.js                    Service worker : hors-ligne + notifications push
│   ├── components/              Mise en page commune, composants vendeur (ui.jsx), gestion d'erreurs
│   ├── context/CartContext.jsx  Panier (une boutique par commande)
│   ├── lib/                     Supabase, WhatsApp, push, stockage, commandes, suivi d'erreurs
│   └── pages/
│       ├── Home/                Accueil, catalogue, grossistes, liquidation, aide
│       ├── Store/               Boutique, fiche produit, panier, paiement, suivi de commande
│       ├── Vendor/              Espace vendeur (tableau de bord, produits, ventes, stats, boost)
│       ├── Auth/                Connexion / inscription
│       └── Admin/               Administration (retraits, boutiques)
└── supabase/
    ├── migrations/              Schéma, sécurité (RLS), paiements, tâches automatiques — à exécuter dans l'ordre
    ├── functions/               Edge Functions : ligdicash-create/-callback/-verify, notify-new-order
    └── tests/verifier_securite.sql   Vérification de la sécurité après migration
```

### Principes de sécurité

- **RLS sur toutes les tables** : un vendeur ne voit et ne modifie que ses données ; les visiteurs ne voient aucune donnée client.
- **L'argent ne bouge que côté serveur** : `place_order` (prix recalculés en base), `request_withdrawal`,
  `process_withdrawal` (admin), `confirm_payment` (service_role, après vérification LigdiCash).
- Le solde vendeur (`wallets`) est crédité uniquement pour une commande **payée en ligne ET livrée** ;
  chaque mouvement est tracé dans `wallet_transactions`.
- Aucune clé secrète dans le frontend.

## Déploiement

Voir **[docs/MISE-EN-PRODUCTION.md](docs/MISE-EN-PRODUCTION.md)** : migrations, secrets, Edge Functions,
notifications push, tâches automatiques, Sentry et checklist de vérification.
