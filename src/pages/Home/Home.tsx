import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MessageCircle, Store, Wallet } from 'lucide-react';

import Header from './components/Header';
import FeaturedSection from './components/FeaturedSection';
import Footer from './components/Footer';
import PartnersMarquee from './components/PartnersMarquee';
import { ProductCard, ProductCardSkeleton } from '../Store/ProductCard';
import { FESTIVAL, festivalPhase } from '../../lib/festival';

// Tuiles catégories (images compressées dans /public/categories)
const CATEGORY_TILES = [
  { label: 'Vêtements', image: '/categories/mode.webp' },
  { label: 'Beauté', image: '/categories/beaute.webp' },
  { label: 'Électronique', image: '/categories/electronique.webp' },
  { label: 'Accessoires', image: '/categories/sport.webp' },
  { label: 'Packeo', image: '/categories/packeo.webp', caption: 'Lots & packs' },
  { label: 'Autre', image: '/categories/autres.webp', caption: 'Bonnes trouvailles' },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  async function fetchLatestProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, stores(name, slug, status)')
      .not('category', 'in', '("Grossiste","Grossistes","Liquidation")')
      .order('created_at', { ascending: false })
      .limit(30);

    const visibleProducts = (data || []).filter((p) => p.stores?.status !== 'hidden').slice(0, 8);
    setProducts(visibleProducts);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      <FeaturedSection />

      {/* Annonce du festival (disparaît après la dernière journée) */}
      {festivalPhase() !== 'apres' && (
        <section className="shop-container pt-10 md:pt-14">
          <Link
            to="/festival"
            className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-ink p-6 text-white md:flex-row md:items-center md:justify-between md:p-10"
          >
            <img src="/festival/foule.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-400">{FESTIVAL.edition}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">
                FESTI<span className="text-orange-400">SOLDE</span>
              </p>
              <p className="mt-2 text-stone-200 md:text-lg">
                {FESTIVAL.datesLabel} · {FESTIVAL.place} · espace enfants, jeux et tombola
              </p>
            </div>
            <span className="shop-btn-primary relative shrink-0">
              Découvrir le festival <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        </section>
      )}

      {/* Catégories */}
      <section className="shop-container py-14 md:py-20" aria-labelledby="cat-title">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="shop-eyebrow">Explorer</p>
            <h2 id="cat-title" className="shop-title mt-2">Achetez par catégorie</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-1.5 text-sm font-bold text-ink hover:text-orange-600 sm:flex">
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>

        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.label}
              to={`/products?category=${encodeURIComponent(cat.label)}`}
              className="group relative aspect-[4/5] w-[42%] shrink-0 snap-start overflow-hidden rounded-2xl bg-stone-100 sm:w-auto"
            >
              <img
                src={cat.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-base font-bold leading-tight">{cat.caption ? cat.caption : cat.label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/80 transition group-hover:text-white">
                  Découvrir <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="bg-stone-50/70 py-14 md:py-20" aria-labelledby="new-title">
        <div className="shop-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="shop-eyebrow">Nouveautés</p>
              <h2 id="new-title" className="shop-title mt-2">Derniers arrivages</h2>
            </div>
            <Link to="/products" className="hidden items-center gap-1.5 text-sm font-bold text-ink hover:text-orange-600 sm:flex">
              Tout le catalogue <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!loading && products.length === 0 && (
            <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-10 text-center text-ink-muted">
              Les premiers produits arrivent bientôt.
            </p>
          )}

          <div className="mt-12 flex justify-center">
            <Link to="/products" className="shop-btn-dark px-8 py-3.5">
              Voir toutes les offres <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="shop-container py-14 md:py-20" aria-labelledby="how-title">
        <div className="mx-auto max-w-2xl text-center">
          <p className="shop-eyebrow">Simple et sûr</p>
          <h2 id="how-title" className="shop-title mt-2">Commander en 3 étapes</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Store, title: 'Choisissez vos articles', text: 'Parcourez les boutiques et ajoutez au panier les produits qui vous plaisent.' },
            { icon: Wallet, title: 'Payez comme vous voulez', text: 'Orange Money, Moov Money ou carte en ligne, ou bien en espèces à la livraison.' },
            { icon: MessageCircle, title: 'Le vendeur vous livre', text: 'Il reçoit votre commande sur WhatsApp et organise la livraison avec vous.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-3xl border border-stone-100 bg-white p-6 shadow-card">
              <span className="absolute right-6 top-6 text-5xl font-extrabold text-stone-100">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bandeau vendeurs */}
      <section className="shop-container pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 md:py-16">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-600/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-400">Vendeurs &amp; grossistes</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Écoulez votre stock plus vite.</h2>
              <p className="mt-4 max-w-lg text-lg text-stone-300">
                Créez votre boutique gratuitement, recevez vos commandes sur WhatsApp et soyez payé par Mobile Money.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Link to="/register" className="shop-btn-primary px-7 py-3.5 text-[15px]">
                Ouvrir ma boutique <ArrowRight size={18} />
              </Link>
              <p className="flex items-center gap-2 text-sm text-stone-400">
                <ShieldCheck size={16} className="text-orange-400" /> Inscription gratuite
              </p>
            </div>
          </div>
        </div>
      </section>

      <PartnersMarquee />
      <Footer />
    </div>
  );
}
