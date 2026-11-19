// ⚠️ Texte de travail décrivant le fonctionnement réel de la plateforme.
// À faire valider par un juriste avant de le considérer comme définitif
// (identité légale de l'éditeur, RCCM, juridiction compétente, etc. à compléter).
import { Link } from 'react-router-dom';
import { LegalPage } from './Privacy';

export default function Terms() {
  return (
    <LegalPage title="Conditions générales d’utilisation et de vente" updated="16 novembre 2026">
      <section>
        <h2>1. Objet</h2>
        <p>
          FestiSolde est une place de marché : elle permet à des vendeurs indépendants de présenter leurs produits et à des
          acheteurs de les commander. <strong>Le contrat de vente est conclu directement entre l’acheteur et le vendeur.</strong>
        </p>
      </section>

      <section>
        <h2>2. Commandes</h2>
        <ul>
          <li>Une commande concerne une seule boutique. Les prix affichés sont en francs CFA et confirmés au moment de la commande.</li>
          <li>Le vendeur contacte l’acheteur (WhatsApp ou téléphone) pour organiser la livraison ; les frais et délais de livraison sont convenus entre eux.</li>
          <li>L’acheteur peut suivre l’état de sa commande grâce au lien de suivi fourni.</li>
        </ul>
      </section>

      <section>
        <h2>3. Paiement</h2>
        <ul>
          <li><strong>En ligne</strong>, lorsque ce mode est proposé sur le site (Orange Money, Moov Money, carte) via notre prestataire sécurisé LigdiCash : la commande est confirmée dès validation du paiement.</li>
          <li><strong>À la livraison</strong> : l’acheteur règle le vendeur en espèces à la réception.</li>
        </ul>
      </section>

      <section>
        <h2>4. Litiges, retours et annulations</h2>
        <p>
          En cas de produit non conforme, l’acheteur contacte d’abord le vendeur. À défaut d’accord, il peut saisir le support
          FestiSolde avec la référence de la commande ; FestiSolde intervient alors comme médiateur. Une commande payée en
          ligne ne peut être annulée que par le support, qui organise le remboursement le cas échéant.
        </p>
      </section>

      <section>
        <h2>5. Vendeurs</h2>
        <ul>
          <li>L’ouverture d’une boutique est gratuite. Le vendeur garantit l’exactitude de ses annonces (description, photos, prix, stock) et la légalité des produits proposés.</li>
          <li>Les sommes payées en ligne sont créditées sur le solde du vendeur lorsque la commande est marquée « livrée ». Le vendeur peut en demander le retrait (minimum 500 FCFA) ; des frais de service de 10 % sont déduits lors du retrait.</li>
          <li>FestiSolde peut masquer une boutique ou un produit en cas de manquement à ces conditions ou de signalement fondé.</li>
        </ul>
      </section>

      <section>
        <h2>6. Produits interdits</h2>
        <p>Sont notamment interdits : les contrefaçons, les produits illicites ou dangereux, les médicaments soumis à prescription et tout article dont la vente est réglementée sans autorisation.</p>
      </section>

      <section>
        <h2>7. Responsabilité</h2>
        <p>FestiSolde met tout en œuvre pour assurer la disponibilité et la sécurité de la plateforme, mais n’est pas partie au contrat de vente et ne peut être tenue responsable de l’exécution de la livraison par le vendeur.</p>
      </section>

      <section>
        <h2>8. Données personnelles</h2>
        <p>Voir notre <Link to="/privacy" className="font-semibold text-orange-600">politique de confidentialité</Link>.</p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          <a href="mailto:contact@festisolde.com" className="font-semibold text-orange-600">contact@festisolde.com</a> ·
          Ouagadougou, Burkina Faso.
        </p>
      </section>
    </LegalPage>
  );
}
