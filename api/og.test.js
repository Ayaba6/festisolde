import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.SUPABASE_URL = 'https://exemple.supabase.co';
process.env.SUPABASE_ANON_KEY = 'cle-test';
const { default: handler } = await import('./og.js');

const call = (query) =>
  new Promise((resolve) => {
    const res = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.code = c; return this; },
      send(body) { resolve({ code: this.code, body, headers: this.headers }); },
    };
    handler({ query }, res);
  });

const og = (body, prop) => (new RegExp(`property="og:${prop}" content="([^"]*)"`).exec(body) || [])[1];

describe('api/og (aperçus des liens partagés)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('affiche le nom, le prix promo et la photo d’un produit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ name: 'Robe wax ', price: 10000, sale_price: 7500, image_url: 'https://img/robe.jpg', stores: { name: 'Awa Mode' } }]))
    );
    const { code, body } = await call({ type: 'product', id: '10f29c07-95d8-4ede-894a-50a51809401a' });
    expect(code).toBe(200);
    expect(og(body, 'title')).toMatch(/^Robe wax — 7 500 F CFA \(au lieu de 10 000 F CFA\)$/);
    expect(og(body, 'image')).toBe('https://img/robe.jpg');
  });

  it('échappe le HTML venant de la base', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ name: '<script>alert(1)</script>', description: '"x"', slug: 'evil' }]))
    );
    const { body } = await call({ type: 'store', slug: 'evil' });
    expect(body).not.toContain('<script>alert');
    expect(body).toContain('&lt;script&gt;');
  });

  it('refuse les identifiants invalides sans interroger la base', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const { body } = await call({ type: 'store', slug: '../../etc' });
    expect(spy).not.toHaveBeenCalled();
    expect(og(body, 'title')).toContain('FestiSolde');
  });
  it('donne un aperçu dédié à la page du festival, sans interroger la base', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const { body } = await call({ type: 'store', slug: 'festival' });
    expect(spy).not.toHaveBeenCalled();
    expect(og(body, 'title')).toMatch(/^Festival FestiSolde/);
    expect(og(body, 'image').endsWith('/festival/og-festival.jpg')).toBe(true);
  });
});
