import { Link, useLocation } from 'react-router-dom';
import { Store, ImageOff } from 'lucide-react';
import { unitPrice } from '../../context/CartContext';

// Les images peuvent arriver en tableau, en chaîne Postgres "{a,b}" ou en URL simple.
export const getProductImages = (product) => {
  const raw = product?.images;
  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (typeof raw === 'string' && raw.startsWith('{')) list = raw.slice(1, -1).split(',').map((u) => u.trim().replace(/^"|"$/g, ''));
  else if (typeof raw === 'string' && raw) list = [raw];
  if (product?.image_url && !list.includes(product.image_url)) list = [product.image_url, ...list];
  return list.filter(Boolean);
};

export const formatPrice = (value) => `${Math.round(Number(value) || 0).toLocaleString('fr-FR')} F`;

export const ProductCard = ({ product }) => {
  const location = useLocation();
  const images = getProductImages(product);
  const price = unitPrice(product);
  const original = Number(product.price) || 0;
  const hasPromo = Number(product.sale_price) > 0 && Number(product.sale_price) < original;
  const discountPct = hasPromo ? Math.round(((original - price) / original) * 100) : 0;

  const storeName = product.stores?.name;
  const storeSlug = product.stores?.slug;
  const isInStorePage = storeSlug && location.pathname === `/${storeSlug}`;
  const outOfStock = product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity <= 0;

  return (
    <article className="group relative flex flex-col">
      <Link
        to={`/produit/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100"
        aria-label={product.name}
      >
        {images[0] ? (
          <img
            src={images[0]}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${images[1] ? 'group-hover:opacity-0' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ImageOff size={32} />
          </div>
        )}
        {images[1] && (
          <img
            src={images[1]}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {hasPromo && discountPct > 0 && (
            <span className="rounded-full bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">-{discountPct}%</span>
          )}
          {product.product_type === 'pack' && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">Pack</span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl bg-white/90 py-2 text-center text-xs font-bold text-ink backdrop-blur">
            Épuisé
          </div>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col px-0.5">
        {storeName && !isInStorePage && (
          <Link
            to={`/${storeSlug}`}
            className="mb-1 inline-flex max-w-full items-center gap-1 self-start text-xs font-semibold text-ink-muted hover:text-orange-600"
          >
            <Store size={12} className="shrink-0" />
            <span className="truncate">{storeName}</span>
          </Link>
        )}

        <Link to={`/produit/${product.id}`} className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink hover:text-orange-600">
          {product.name}
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className={`text-base font-extrabold ${hasPromo ? 'text-orange-600' : 'text-ink'}`}>{formatPrice(price)}</span>
          {hasPromo && <span className="text-sm text-stone-400 line-through">{formatPrice(original)}</span>}
        </div>
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] rounded-2xl bg-stone-100" />
    <div className="mt-3 h-3 w-1/3 rounded bg-stone-100" />
    <div className="mt-2 h-4 w-4/5 rounded bg-stone-100" />
    <div className="mt-2 h-4 w-1/3 rounded bg-stone-100" />
  </div>
);

// Ancien nom conservé pour ProductGrid.
export const ProductSkeleton = ProductCardSkeleton;
