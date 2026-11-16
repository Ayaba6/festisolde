import { describe, it, expect } from 'vitest';
import { buildOrderWhatsappUrl, cleanPhone } from '../whatsapp';

const order = {
  order_id: '1234abcd-0000-4000-8000-000000000000',
  total: 14000,
  whatsapp_number: '+226 70 00 00 00',
  store_slug: 'belle-en-pagne',
  items: [{ name: 'Pagne wax', quantity: 2, unit_price: 7000, size: 'M', color: 'Bleu' }],
};

const decode = (url) => decodeURIComponent(new URL(url).searchParams.get('text'));

describe('buildOrderWhatsappUrl', () => {
  it('cible le numéro du vendeur nettoyé', () => {
    expect(buildOrderWhatsappUrl({ order }).startsWith('https://wa.me/22670000000?text=')).toBe(true);
  });

  it('renvoie null si le vendeur n’a pas de numéro', () => {
    expect(buildOrderWhatsappUrl({ order: { ...order, whatsapp_number: '' } })).toBeNull();
  });

  it('contient la référence, les articles, le total et le lien de suivi', () => {
    const text = decode(buildOrderWhatsappUrl({ order, customer: { name: 'Awa', phone: '70112233', city: 'Ouaga' } }));
    expect(text).toContain('#1234ABCD');
    expect(text).toContain('Pagne wax');
    expect(text).toContain('Taille: M');
    expect(text).toContain('À PAYER À LA LIVRAISON');
    expect(text).toContain('festisolde.com/commande/1234abcd-0000-4000-8000-000000000000');
    expect(text).toContain('AWA');
  });

  it('indique une commande payée en ligne', () => {
    const text = decode(buildOrderWhatsappUrl({ order, paidOnline: true }));
    expect(text).toContain('PAYÉE EN LIGNE');
    expect(text).not.toContain('À PAYER À LA LIVRAISON');
  });
});

describe('cleanPhone', () => {
  it('ne garde que les chiffres', () => {
    expect(cleanPhone('+226 70-00 00 00')).toBe('22670000000');
    expect(cleanPhone(null)).toBe('');
  });
});
