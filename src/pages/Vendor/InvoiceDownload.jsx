// Bouton de téléchargement de la facture PDF.
// Fichier séparé : la bibliothèque PDF (≈1,5 Mo) n'est chargée qu'à l'ouverture d'une facture.
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Loader2, Printer } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';

export default function InvoiceDownload({ order }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF order={order} />}
      fileName={`facture-${String(order.id).slice(0, 8)}.pdf`}
      className="shop-btn-ghost w-full"
    >
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />} Télécharger le PDF
        </>
      )}
    </PDFDownloadLink>
  );
}
