// Construction du message WhatsApp envoyé au vendeur pour une commande.
// `order` vient du serveur (place_order ou ligdicash-verify) : prix confirmés en base.

export const cleanPhone = (phone) => (phone || '').replace(/[^\d]/g, '');

export function buildOrderWhatsappUrl({ order, customer = {}, paidOnline = false }) {
  const sellerPhone = cleanPhone(order.whatsapp_number);
  if (!sellerPhone) return null;

  const productList = (order.items || []).map((item) =>
    `• *${item.name}*\n` +
    `${item.size ? `  Taille: ${item.size}\n` : ''}` +
    `${item.color ? `  Couleur: ${item.color}\n` : ''}` +
    `  Qté: ${item.quantity} x ${Number(item.unit_price).toLocaleString()} CFA\n` +
    `${item.image ? `  📷 Photo: ${item.image}\n` : ''}`
  ).join('\n');

  const orderId = order.order_id || order.id;
  const reference = (order.reference || String(order.order_id || order.id || '').slice(0, 8)).toUpperCase();
  const total = Number(order.total).toLocaleString();

  const message =
    `*NOUVELLE COMMANDE FESTISOLDE* 🛍️\n` +
    `🧾 *Réf :* #${reference}\n\n` +
    (customer.name ? `👤 *Client :* ${customer.name.toUpperCase()}\n` : '') +
    (customer.phone ? `📞 *WhatsApp :* ${customer.phone}\n` : '') +
    `📍 *Ville :* ${customer.city || 'Non précisée'}\n` +
    (customer.location ? `🗺️ *Position GPS :* ${customer.location}\n` : '') +
    `\n--------------------------\n` +
    `🛒 *ARTICLES :*\n\n${productList}\n` +
    `--------------------------\n` +
    (paidOnline
      ? `✅ *PAYÉE EN LIGNE (LigdiCash) : ${total} FCFA*\nRien à encaisser à la livraison.\n\n`
      : `💰 *TOTAL À PAYER À LA LIVRAISON : ${total} FCFA*\n\n`) +
    (order.store_slug ? `🔗 *Lien boutique :* https://festisolde.com/${order.store_slug}\n` : '') +
    (orderId ? `📦 *Suivi de la commande :* https://festisolde.com/commande/${orderId}` : '');

  return `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
}
