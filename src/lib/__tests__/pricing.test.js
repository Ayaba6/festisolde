import { describe, it, expect } from 'vitest';
import { unitPrice } from '../../context/CartContext';
import { formatPrice, getProductImages } from '../../pages/Store/ProductCard';
import { parseOptions, optionsToText } from '../productOptions';

describe('unitPrice (prix affiché au client)', () => {
  it('utilise le prix promo quand il existe', () => {
    expect(unitPrice({ price: 10000, sale_price: 7500 })).toBe(7500);
  });
  it('ignore un prix promo nul, vide ou à 0', () => {
    expect(unitPrice({ price: 10000, sale_price: null })).toBe(10000);
    expect(unitPrice({ price: 10000, sale_price: 0 })).toBe(10000);
    expect(unitPrice({ price: 10000 })).toBe(10000);
  });
  it('accepte des valeurs texte venant de la base', () => {
    expect(unitPrice({ price: '5000', sale_price: '4500' })).toBe(4500);
  });
  it('renvoie 0 pour un produit sans prix', () => {
    expect(unitPrice({})).toBe(0);
    expect(unitPrice(null)).toBe(0);
  });
});

describe('formatPrice', () => {
  it('arrondit et ajoute la devise', () => {
    expect(formatPrice(7499.6).replace(/\s/g, ' ')).toBe('7 500 F');
    expect(formatPrice(undefined)).toBe('0 F');
  });
});

describe('getProductImages', () => {
  it('lit un tableau et place image_url en premier', () => {
    expect(getProductImages({ image_url: 'a.jpg', images: ['b.jpg', 'a.jpg'] })).toEqual(['b.jpg', 'a.jpg']);
    expect(getProductImages({ image_url: 'a.jpg', images: ['b.jpg'] })).toEqual(['a.jpg', 'b.jpg']);
  });
  it('lit le format texte Postgres {a,b}', () => {
    expect(getProductImages({ images: '{"x.jpg","y.jpg"}' })).toEqual(['x.jpg', 'y.jpg']);
  });
  it('gère l’absence d’image', () => {
    expect(getProductImages({})).toEqual([]);
  });
});

describe('parseOptions (tailles / couleurs)', () => {
  it('découpe une liste séparée par des virgules', () => {
    expect(parseOptions('S, M ,L')).toEqual(['S', 'M', 'L']);
  });
  it('lit le format Postgres et ignore la valeur vide {}', () => {
    expect(parseOptions('{"S","M"}')).toEqual(['S', 'M']);
    expect(parseOptions('{}')).toEqual([]);
    expect(parseOptions(null)).toEqual([]);
  });
  it('produit le texte du formulaire vendeur', () => {
    expect(optionsToText('{Noir,Blanc}')).toBe('Noir, Blanc');
  });
});
