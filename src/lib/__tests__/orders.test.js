import { describe, it, expect } from 'vitest';
import { lineUnitPrice, ordersToCsv, orderReference } from '../orders';

describe('lineUnitPrice', () => {
  it('prend le prix fixé par le serveur en priorité', () => {
    expect(lineUnitPrice({ unit_price: 7000, sale_price: 1, price: 2 })).toBe(7000);
  });
  it('gère les anciennes commandes (copie du produit)', () => {
    expect(lineUnitPrice({ sale_price: 4500, price: 5000 })).toBe(4500);
    expect(lineUnitPrice({ sale_price: null, price: 5000 })).toBe(5000);
  });
});

describe('ordersToCsv', () => {
  const csv = ordersToCsv([
    { id: 'abcdef12-0000', created_at: '2026-11-10T10:00:00Z', customer_name: 'Awa; "la reine"', customer_phone: '70', total_amount: 14000, status: 'livré', payment_status: 'paye', items: [{ quantity: 2, name: 'Pagne' }] },
  ]);
  it('commence par le BOM UTF-8 pour Excel et utilise le point-virgule', () => {
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.split('\r\n')[0]).toContain('Date;Référence;Client');
  });
  it('échappe les guillemets et séparateurs', () => {
    expect(csv).toContain('"Awa; ""la reine"""');
    expect(csv).toContain('2 x Pagne');
    expect(csv).toContain('Payé en ligne');
  });
  it('produit une référence courte', () => {
    expect(orderReference({ id: 'abcdef12-0000' })).toBe('ABCDEF12');
  });
});
