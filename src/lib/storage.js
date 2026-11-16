// Nettoyage des images produit qui ne servent plus (évite de payer du stockage inutile).
import { supabase } from './supabaseClient';

const BUCKET = 'product-images';
const MARKER = `/storage/v1/object/public/${BUCKET}/`;

// URL publique -> chemin dans le bucket (null si l'image vient d'ailleurs)
export const storagePathFromUrl = (url) => {
  if (typeof url !== 'string') return null;
  const i = url.indexOf(MARKER);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + MARKER.length).split('?')[0]);
};

// Supprime les images (silencieux en cas d'échec : le produit est déjà à jour).
export async function removeProductImages(urls) {
  const paths = [...new Set((urls || []).map(storagePathFromUrl).filter(Boolean))];
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.warn('Nettoyage des images impossible :', error.message);
}
