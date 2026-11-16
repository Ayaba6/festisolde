import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart, unitPrice } from '../../context/CartContext';
import { Minus, Plus, ShoppingBag, MessageCircle, Share2, Check, BadgeCheck, Truck, ShieldCheck, ChevronRight, Eye, ImageOff } from 'lucide-react';

import Header from '../Home/components/Header';
import Footer from '../Home/components/Footer';
import { ProductCard, getProductImages, formatPrice } from './ProductCard';

// "S, M ,L" | "{S,M}" | '{"S","M"}' -> ['S', 'M', 'L']
const parseOptions = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw !== 'string') return [];
  return raw
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);
};

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setImageIndex(0);
    setSelectedColor(null);
    setSelectedSize(null);
    setMissing(null);
    window.scrollTo(0, 0);
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (product?.name) document.title = `${product.name} — FestiSolde`;
  }, [product]);

  async function fetchProductData() {
    setLoading(true);
    const { data: productData } = await supabase.from('products').select('*').eq('id', productId).maybeSingle();

    if (productData) {
      setProduct(productData);
      supabase.rpc('track_store_visit', { p_product_id: productData.id, p_store_id: productData.store_id });

      const [{ data: storeData }, { data: suggestions }] = await Promise.all([
        supabase.from('stores').select('id, name, slug, logo_url, whatsapp_number, is_verified').eq('id', productData.store_id).maybeSingle(),
        supabase
          .from('products')
          .select('*, stores(name, slug)')
          .eq('category', productData.category)
          .neq('id', productId)
          .limit(4),
      ]);
      setStore(storeData);
      setSuggested(suggestions || []);
    } else {
      setProduct(null);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="shop-container grid gap-10 py-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-stone-100" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-1/4 animate-pulse rounded bg-stone-100" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-stone-100" />
            <div className="h-8 w-1/3 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="shop-container py-32 text-center">
          <h1 className="text-2xl font-extrabold text-ink">Produit introuvable</h1>
          <p className="mt-2 text-ink-muted">Il a peut-être été vendu ou retiré par le vendeur.</p>
          <Link to="/products" className="shop-btn-dark mt-8">Voir le catalogue</Link>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const colors = parseOptions(product.colors);
  const sizes = parseOptions(product.sizes);
  const price = unitPrice(product);
  const original = Number(product.price) || 0;
  const hasPromo = Number(product.sale_price) > 0 && Number(product.sale_price) < original;
  const discountPct = hasPromo ? Math.round(((original - price) / original) * 100) : 0;
  const stock = product.stock_quantity;
  const outOfStock = stock !== null && stock !== undefined && stock <= 0;
  const maxQty = stock !== null && stock !== undefined ? Math.max(1, stock) : 99;
  const whatsapp = (store?.whatsapp_number || '').replace(/[^\d]/g, '');

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor) return setMissing('color');
    if (sizes.length > 0 && !selectedSize) return setMissing('size');
    setMissing(null);
    const ok = addToCart({ ...product, selectedColor, selectedSize }, quantity);
    if (ok !== false) {
      setAdded(true);
      setTimeout(() => setAdded(false), 4000);
    }
  };

  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé(e) par « ${product.name} » (${formatPrice(price)}) vu sur FestiSolde : ${window.location.href}`
      )}`
    : null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch { /* annulé */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* indisponible */ }
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      <main className="shop-container pb-32 pt-4 md:pt-8">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d’Ariane" className="mb-6 flex items-center gap-1 overflow-hidden text-sm text-ink-muted">
          <Link to="/" className="shrink-0 hover:text-ink">Accueil</Link>
          <ChevronRight size={14} className="shrink-0" />
          {product.category && (
            <>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="shrink-0 hover:text-ink">
                {product.category}
              </Link>
              <ChevronRight size={14} className="shrink-0" />
            </>
          )}
          <span className="truncate text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Galerie */}
          <div className="lg:sticky lg:top-40 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-stone-100">
              {images[imageIndex] ? (
                <img src={images[imageIndex]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-300"><ImageOff size={48} /></div>
              )}
              {hasPromo && (
                <span className="absolute left-4 top-4 rounded-full bg-orange-600 px-3 py-1.5 text-sm font-bold text-white">-{discountPct}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setImageIndex(idx)}
                    aria-label={`Photo ${idx + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      idx === imageIndex ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            {store && (
              <Link to={`/${store.slug}`} className="inline-flex items-center gap-2.5 rounded-full border border-stone-200 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink-soft transition hover:border-stone-300 hover:text-ink">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{store.name?.charAt(0)}</span>
                )}
                {store.name}
                {store.is_verified && <BadgeCheck size={16} className="text-orange-600" />}
              </Link>
            )}

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className={`text-3xl font-extrabold ${hasPromo ? 'text-orange-600' : 'text-ink'}`}>{formatPrice(price)}</span>
              {hasPromo && (
                <>
                  <span className="text-lg text-stone-400 line-through">{formatPrice(original)}</span>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-sm font-bold text-green-700">
                    Économisez {formatPrice(original - price)}
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {outOfStock ? (
                <span className="font-semibold text-red-600">Épuisé</span>
              ) : stock !== null && stock !== undefined && stock <= 5 ? (
                <span className="font-semibold text-orange-700">Plus que {stock} en stock</span>
              ) : (
                <span className="font-semibold text-green-700">En stock</span>
              )}
              {product.views > 20 && (
                <span className="flex items-center gap-1 text-ink-muted"><Eye size={14} /> {product.views} vues</span>
              )}
            </div>

            {/* Options */}
            {colors.length > 0 && (
              <fieldset className="mt-8">
                <legend className="text-sm font-bold">
                  Couleur {selectedColor && <span className="font-normal text-ink-muted">: {selectedColor}</span>}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setSelectedColor(c); setMissing(null); }}
                      aria-pressed={selectedColor === c}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        selectedColor === c ? 'border-ink bg-ink text-white' : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {missing === 'color' && <p className="mt-2 text-sm font-semibold text-red-600">Choisissez une couleur.</p>}
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-sm font-bold">
                  Taille {selectedSize && <span className="font-normal text-ink-muted">: {selectedSize}</span>}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSelectedSize(s); setMissing(null); }}
                      aria-pressed={selectedSize === s}
                      className={`min-w-[3rem] rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        selectedSize === s ? 'border-ink bg-ink text-white' : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {missing === 'size' && <p className="mt-2 text-sm font-semibold text-red-600">Choisissez une taille.</p>}
              </fieldset>
            )}

            {/* Quantité + actions */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm font-bold">Quantité</span>
              <div className="flex items-center rounded-full border border-stone-200">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-stone-100" aria-label="Diminuer">
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold" aria-live="polite">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-stone-100" aria-label="Augmenter">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-6 hidden gap-3 sm:flex">
              <button onClick={handleAddToCart} disabled={outOfStock} className="shop-btn-primary flex-1 py-4 text-base">
                <ShoppingBag size={20} /> {outOfStock ? 'Épuisé' : 'Ajouter au panier'}
              </button>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="shop-btn-ghost py-4" aria-label="Poser une question sur WhatsApp">
                  <MessageCircle size={20} className="text-[#25D366]" /> Question ?
                </a>
              )}
              <button onClick={handleShare} className="shop-btn-ghost px-4 py-4" aria-label="Partager">
                {copied ? <Check size={20} /> : <Share2 size={20} />}
              </button>
            </div>

            {added && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm" role="status">
                <span className="flex items-center gap-2 font-semibold text-green-800"><Check size={18} /> Ajouté au panier</span>
                <button onClick={() => navigate('/panier')} className="font-bold text-green-800 underline underline-offset-2">Voir le panier</button>
              </div>
            )}

            {/* Réassurance */}
            <ul className="mt-8 grid gap-3 rounded-2xl bg-stone-50 p-5 text-sm sm:grid-cols-2">
              <li className="flex items-start gap-3">
                <ShieldCheck size={20} className="shrink-0 text-orange-600" />
                <span><span className="font-bold">Paiement sécurisé</span><br /><span className="text-ink-muted">Orange Money, Moov Money, carte</span></span>
              </li>
              <li className="flex items-start gap-3">
                <Truck size={20} className="shrink-0 text-orange-600" />
                <span><span className="font-bold">Ou à la livraison</span><br /><span className="text-ink-muted">Réglez en espèces à réception</span></span>
              </li>
            </ul>

            {product.description && (
              <section className="mt-8 border-t border-stone-100 pt-8">
                <h2 className="text-lg font-bold">Description</h2>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
              </section>
            )}
          </div>
        </div>

        {suggested.length > 0 && (
          <section className="mt-20 border-t border-stone-100 pt-14">
            <h2 className="shop-title">Vous aimerez aussi</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
              {suggested.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      {/* Barre d'achat mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-100 bg-white/95 p-3 backdrop-blur-md sm:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-2">
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="shop-btn-ghost px-4" aria-label="Poser une question sur WhatsApp">
              <MessageCircle size={20} className="text-[#25D366]" />
            </a>
          )}
          <button onClick={handleAddToCart} disabled={outOfStock} className="shop-btn-primary flex-1 py-3.5 text-[15px]">
            <ShoppingBag size={18} /> {outOfStock ? 'Épuisé' : `Ajouter · ${formatPrice(price * quantity)}`}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
