// ⚠️ Texte de travail rédigé à partir du fonctionnement réel du site.
// À faire relire par un juriste avant de le considérer comme définitif
// (loi burkinabè n°001-2021/AN sur la protection des données personnelles, CIL).
import { Link } from 'react-router-dom';

const UPDATED = '16 novembre 2026';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="shop-container max-w-3xl py-12 md:py-16">
      <p className="shop-eyebrow">Informations légales</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">Dernière mise à jour : {updated}</p>
      <div className="legal mt-10 space-y-8 text-[15px] leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1.5 [&_strong]:text-ink">
        {children}
      </div>
    </div>
  );
}

export default function Privacy() {
  return (
    <LegalPage title="Politique de confidentialité" updated={UPDATED}>
      <section>
        <h2>1. Qui sommes-nous ?</h2>
        <p>
          FestiSolde est une place de marché en ligne qui met en relation des vendeurs (boutiques, grossistes) et des
          acheteurs au Burkina Faso. Pour toute question sur vos données : <a className="font-semibold text-orange-600" href="mailto:contact@festisolde.com">contact@festisolde.com</a>.
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <ul>
          <li><strong>Acheteurs :</strong> nom, numéro WhatsApp, ville/quartier et, si vous l’acceptez, votre position GPS, afin que le vendeur puisse vous livrer.</li>
          <li><strong>Vendeurs :</strong> adresse e-mail, nom et visuels de la boutique, numéro WhatsApp, numéro de réception des retraits.</li>
          <li><strong>Paiements en ligne :</strong> traités par notre prestataire LigdiCash. FestiSolde ne reçoit ni ne conserve vos codes Mobile Money ou numéros de carte.</li>
          <li><strong>Statistiques :</strong> nombre de vues des produits et des boutiques, sans identification des visiteurs.</li>
        </ul>
      </section>

      <section>
        <h2>3. Utilisation</h2>
        <p>Vos données servent uniquement à : traiter et livrer les commandes, permettre le suivi de commande, payer les vendeurs, assurer la sécurité de la plateforme et répondre à vos demandes. Elles ne sont jamais vendues.</p>
      </section>

      <section>
        <h2>4. Partage</h2>
        <p>Les informations de livraison d’une commande sont transmises <strong>uniquement au vendeur concerné</strong>. Nos prestataires techniques (hébergement Supabase et Vercel, paiement LigdiCash) y ont accès dans la stricte limite de leur mission.</p>
      </section>

      <section>
        <h2>5. Durée de conservation</h2>
        <ul>
          <li>Position GPS de livraison : <strong>supprimée automatiquement après 90 jours</strong>.</li>
          <li>Commandes et données de facturation : conservées pour les obligations comptables et le règlement des litiges.</li>
          <li>Compte vendeur : jusqu’à sa suppression.</li>
        </ul>
      </section>

      <section>
        <h2>6. Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification ou la suppression de vos données, ainsi que la fermeture de votre
          compte, en écrivant à <a className="font-semibold text-orange-600" href="mailto:contact@festisolde.com">contact@festisolde.com</a>.
          Vous pouvez également saisir la Commission de l’Informatique et des Libertés (CIL) du Burkina Faso.
        </p>
      </section>

      <section>
        <h2>7. Sécurité</h2>
        <p>Les échanges sont chiffrés (HTTPS) et l’accès aux données est restreint : chaque vendeur ne voit que ses propres commandes.</p>
      </section>

      <p className="text-sm">Voir aussi les <Link to="/cgu" className="font-semibold text-orange-600">conditions générales d’utilisation</Link>.</p>
    </LegalPage>
  );
}
