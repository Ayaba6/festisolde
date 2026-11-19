// Aperçus des liens partagés (WhatsApp, Facebook, Telegram…).
//
// Le site est une application à page unique : les robots des réseaux sociaux
// n'exécutent pas le JavaScript et ne verraient que l'aperçu générique.
// vercel.json redirige UNIQUEMENT ces robots vers cette fonction, qui renvoie
// une petite page HTML avec la photo, le nom et le prix du produit / de la boutique.
// Les visiteurs humains ne passent jamais par ici.

const SITE = process.env.SITE_URL || 'https://festisolde.com';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9-]{2,60}$/;

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const price = (v) => `${Math.round(Number(v) || 0).toLocaleString('fr-FR').replace(/ | /g, ' ')} F CFA`;

async function query(path) {
  if (!SUPABASE_URL || !ANON_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

function page({ title, description, image, url }) {
  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="FestiSolde" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="${esc(url)}" />
<meta http-equiv="refresh" content="0; url=${esc(url)}" />
</head><body><a href="${esc(url)}">${esc(title)}</a></body></html>`;
}

export default async function handler(req, res) {
  const { type, id, slug } = req.query || {};
  const fallback = {
    title: 'FestiSolde — Les bonnes affaires du Burkina',
    description: 'Déstockage, promotions et vente en gros, en direct des vendeurs. Commande sur WhatsApp, paiement à la livraison.',
    image: `${SITE}/og-default.jpg`,
    url: SITE,
  };
  let meta = fallback;

  try {
    if (type === 'product' && UUID_RE.test(id || '')) {
      const p = await query(
        `products?id=eq.${id}&select=name,description,price,sale_price,image_url,images,stores(name)`
      );
      if (p) {
        const sale = Number(p.sale_price);
        const promo = sale > 0 && sale < Number(p.price);
        const current = promo ? sale : p.price;
        const img = p.image_url || (Array.isArray(p.images) ? p.images[0] : null);
        meta = {
          title: `${String(p.name).trim()} — ${price(current)}${promo ? ` (au lieu de ${price(p.price)})` : ''}`,
          description: `${p.stores?.name ? `Chez ${p.stores.name} sur FestiSolde. ` : ''}${(p.description || 'Commandez en ligne, payez par Mobile Money ou à la livraison.').slice(0, 160)}`,
          image: img || fallback.image,
          url: `${SITE}/produit/${id}`,
        };
      }
    } else if (type === 'store' && slug === 'festival') {
      meta = {
        title: 'Festival FestiSolde — du 18 au 27 décembre 2026',
        description: 'Le festival des soldes de fin d’année à Dassasgho, près du canal (Ouagadougou) : 50 stands, prix cassés, espace enfants, jeux et tombola.',
        image: `${SITE}/festival/og-festival.jpg`,
        url: `${SITE}/festival`,
      };
    } else if (type === 'store' && SLUG_RE.test(slug || '')) {
      const s = await query(`stores?slug=eq.${slug}&select=name,description,logo_url,banner_url,slug`);
      if (s) {
        meta = {
          title: `${String(s.name).trim()} — Boutique FestiSolde`,
          description: (s.description || `Découvrez les offres de ${s.name} et commandez en quelques clics.`).slice(0, 180),
          image: s.banner_url || s.logo_url || fallback.image,
          url: `${SITE}/${s.slug}`,
        };
      }
    }
  } catch {
    meta = fallback;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(page(meta));
}
