// Outils communs aux commandes (affichage, factures, export).

// Prix unitaire d'une ligne : nouvelles commandes = unit_price (fixé par le serveur),
// anciennes commandes = copie du produit (sale_price / price).
export const lineUnitPrice = (item) => {
  if (item?.unit_price !== undefined && item?.unit_price !== null) return Number(item.unit_price) || 0;
  const sale = Number(item?.sale_price);
  return sale > 0 ? sale : Number(item?.price) || 0;
};

export const orderReference = (order) => String(order?.id || '').slice(0, 8).toUpperCase();

const STATUS_LABELS = { nouveau: 'Nouveau', en_attente: 'En attente', 'en cours': 'En cours', 'livré': 'Livré', 'annulé': 'Annulé' };
export const statusLabel = (s) => STATUS_LABELS[s] || s || '';

// Export CSV lisible par Excel (séparateur ; et BOM UTF-8 pour les accents).
export function ordersToCsv(orders) {
  const cell = (v) => {
    const s = String(v ?? '');
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ['Date', 'Référence', 'Client', 'Téléphone', 'Ville', 'Articles', 'Total (FCFA)', 'Statut', 'Paiement'];
  const rows = orders.map((o) => [
    new Date(o.created_at).toLocaleDateString('fr-FR'),
    orderReference(o),
    o.customer_name,
    o.customer_phone,
    o.customer_city,
    (o.items || []).map((i) => `${i.quantity} x ${i.name}`).join(' | '),
    Math.round(Number(o.total_amount) || 0),
    statusLabel(o.status),
    o.payment_status === 'paye' ? 'Payé en ligne' : 'À la livraison',
  ]);
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}

export function downloadCsv(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
