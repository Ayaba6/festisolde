import { describe, it, expect, vi } from 'vitest';

vi.mock('../supabaseClient', () => ({ supabase: {} }));
const { storagePathFromUrl } = await import('../storage');

describe('storagePathFromUrl', () => {
  it('extrait le chemin d’une image du bucket product-images', () => {
    expect(
      storagePathFromUrl('https://abc.supabase.co/storage/v1/object/public/product-images/u1/photo%201.jpg?t=1')
    ).toBe('u1/photo 1.jpg');
  });
  it('ignore les images externes ou d’autres buckets', () => {
    expect(storagePathFromUrl('https://cdn.exemple.com/a.jpg')).toBeNull();
    expect(storagePathFromUrl('https://abc.supabase.co/storage/v1/object/public/store-assets/u1/logo.png')).toBeNull();
    expect(storagePathFromUrl(null)).toBeNull();
  });
});
