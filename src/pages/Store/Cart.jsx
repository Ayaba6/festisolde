import { useCart, unitPrice } from '../../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, MessageCircle, MapPin, CreditCard, Check, Lock, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Home/components/Header';
import { getProductImages, formatPrice } from './ProductCard';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { buildOrderWhatsappUrl, cleanPhone } from '../../lib/whatsapp';
import { ONLINE_PAYMENT } from '../../lib/config';

export default function Cart() {
  const { cart, removeFromCart, getCartTotal, addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(ONLINE_PAYMENT ? 'ligdicash' : 'livraison'); // 'ligdicash' | 'livraison'
  const [loading, setLoading] = useState(false);
  const [locationLink, setLocationLink] = useState(null); // Stocke le lien Maps

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    city: ''
  });

  // Fonction pour récupérer la position GPS
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          setLocationLink(mapsUrl);
        },
        (error) => {
          console.error("Erreur GPS:", error);
          alert("Impossible d'accéder à votre position. Vérifiez vos réglages GPS.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const handleConfirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert("⚠️ Veuillez remplir votre nom et votre numéro de téléphone.");
      return;
    }

    setLoading(true);

    try {
      const storeId = cart[0]?.store_id;
      if (!storeId) throw new Error("Panier invalide : boutique inconnue. Videz le panier et réessayez.");

      // Paiement à la livraison : la commande part sur WhatsApp, le vendeur doit avoir un numéro.
      if (paymentMethod === 'livraison') {
        const { data: store } = await supabase.from('stores').select('whatsapp_number').eq('id', storeId).maybeSingle();
        if (!cleanPhone(store?.whatsapp_number)) {
          throw new Error("Cette boutique n'accepte pas encore les commandes WhatsApp. Choisissez le paiement en ligne.");
        }
      }

      // 1. Création de la commande côté serveur (prix, stock et ventes calculés en base)
      const { data: order, error: orderError } = await supabase.rpc('place_order', {
        p_store_id: storeId,
        p_customer_name: customerInfo.name,
        p_customer_phone: customerInfo.phone,
        p_customer_city: customerInfo.city || null,
        p_customer_location: locationLink,
        p_items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.selectedSize || null,
          color: item.selectedColor || null,
        })),
      });

      if (orderError) throw new Error(orderError.message);

      const customer = { ...customerInfo, location: locationLink };

      // 2a. Paiement en ligne : facture LigdiCash puis redirection vers la page de paiement.
      //     Le panier n'est vidé qu'au retour, une fois le paiement confirmé.
      if (paymentMethod === 'ligdicash') {
        try {
          sessionStorage.setItem('festi_pending_payment', JSON.stringify({ customer }));
        } catch { /* stockage indisponible : le message WhatsApp sera plus court */ }

        const { data: pay, error: payError } = await supabase.functions.invoke('ligdicash-create', {
          body: { order_id: order.order_id },
        });
        if (payError || !pay?.payment_url) {
          let msg = "Le paiement en ligne est momentanément indisponible.";
          try { msg = (await payError?.context?.json())?.error || msg; } catch { /* réponse non JSON */ }
          throw new Error(msg);
        }
        window.location.assign(pay.payment_url);
        return;
      }

      // 2b. Paiement à la livraison : message WhatsApp au vendeur (prix confirmés par le serveur)
      const whatsappUrl = buildOrderWhatsappUrl({ order, customer });

      clearCart();

      navigate('/confirmation', {
        state: {
          customerName: customerInfo.name,
          whatsappUrl: whatsappUrl,
          storeSlug: order.store_slug,
          orderId: order.order_id
        }
      });

    } catch (error) {
      console.error("Erreur commande:", error);
      alert(error.message || "Erreur lors de l'enregistrement de la commande.");
    } finally {
      setLoading(false);
    }
  };

  const total = getCartTotal();
  const itemCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const storeName = cart[0]?.stores?.name;

  if (cart.length === 0) return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="shop-container flex flex-col items-center py-28 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
          <ShoppingBag size={32} className="text-stone-400" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-ink">Votre panier est vide</h1>
        <p className="mt-2 max-w-sm text-ink-muted">Parcourez les offres du moment et ajoutez vos coups de cœur.</p>
        <Link to="/products" className="shop-btn-primary mt-8">Découvrir les offres <ArrowRight size={18} /></Link>
      </div>
    </div>
  );

  const paymentOptions = [
    ONLINE_PAYMENT && { id: 'ligdicash', label: 'Payer maintenant', hint: 'Orange Money, Moov Money ou carte', icon: CreditCard },
    { id: 'livraison', label: 'Payer à la livraison', hint: 'En espèces, commande envoyée sur WhatsApp', icon: MessageCircle },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50/70 text-ink">
      <Header />

      <main className="shop-container pb-24 pt-8 md:pt-12">
        {/* Étapes */}
        <ol className="mb-8 flex items-center gap-3 text-sm font-semibold" aria-label="Étapes de commande">
          <li className={`flex items-center gap-2 ${!isOrdering ? 'text-ink' : 'text-ink-muted'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${!isOrdering ? 'bg-ink text-white' : 'bg-green-600 text-white'}`}>
              {isOrdering ? <Check size={14} /> : 1}
            </span>
            Panier
          </li>
          <li aria-hidden="true" className="h-px w-8 bg-stone-300" />
          <li className={`flex items-center gap-2 ${isOrdering ? 'text-ink' : 'text-ink-muted'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isOrdering ? 'bg-ink text-white' : 'bg-stone-200'}`}>2</span>
            Livraison &amp; paiement
          </li>
        </ol>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
          {/* Colonne gauche */}
          <section>
            {!isOrdering ? (
              <>
                <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                  Mon panier <span className="text-lg font-semibold text-ink-muted">({itemCount})</span>
                </h1>
                {storeName && <p className="mt-1 text-sm text-ink-muted">Boutique : <span className="font-semibold text-ink">{storeName}</span></p>}

                <ul className="mt-6 divide-y divide-stone-100 rounded-3xl border border-stone-100 bg-white shadow-card">
                  {cart.map((item, index) => {
                    const img = getProductImages(item)[0];
                    return (
                      <li key={item.cartKey || `${item.id}-${index}`} className="flex gap-4 p-4 sm:p-5">
                        <Link to={`/produit/${item.id}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-28 sm:w-24">
                          {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link to={`/produit/${item.id}`} className="line-clamp-2 font-semibold leading-snug hover:text-orange-600">{item.name}</Link>
                            <button onClick={() => removeFromCart(item.cartKey)} className="-mr-1 -mt-1 rounded-full p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Retirer ${item.name}`}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="mt-1 text-sm text-ink-muted">
                              {[item.selectedSize && `Taille ${item.selectedSize}`, item.selectedColor].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                            <div className="flex items-center rounded-full border border-stone-200">
                              <button onClick={() => (item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item.cartKey))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100" aria-label="Diminuer la quantité">
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                              <button onClick={() => addToCart(item, 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100" aria-label="Augmenter la quantité">
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold">{formatPrice(unitPrice(item) * item.quantity)}</p>
                              {item.quantity > 1 && <p className="text-xs text-ink-muted">{formatPrice(unitPrice(item))} l’unité</p>}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button onClick={() => navigate(-1)} className="mt-6 text-sm font-bold text-ink hover:text-orange-600">← Continuer mes achats</button>
              </>
            ) : (
              <form
                id="checkout-form"
                onSubmit={(e) => { e.preventDefault(); handleConfirmOrder(); }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Livraison</h1>
                  <div className="mt-5 grid gap-4 rounded-3xl border border-stone-100 bg-white p-5 shadow-card sm:grid-cols-2 sm:p-6">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold">Nom complet</span>
                      <input required autoComplete="name" className="shop-input" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold">Numéro WhatsApp</span>
                      <input required type="tel" autoComplete="tel" inputMode="tel" placeholder="70 00 00 00" className="shop-input" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-semibold">Ville et quartier <span className="font-normal text-ink-muted">(facultatif)</span></span>
                      <input autoComplete="address-level2" placeholder="Ouagadougou, Ouaga 2000" className="shop-input" value={customerInfo.city} onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })} />
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className={`flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition sm:col-span-2 ${locationLink ? 'border-green-500 bg-green-50 text-green-700' : 'border-stone-300 text-ink-soft hover:border-orange-500 hover:text-orange-600'}`}
                    >
                      {locationLink ? <Check size={16} /> : <MapPin size={16} />}
                      {locationLink ? 'Position GPS ajoutée' : 'Partager ma position GPS (livraison plus rapide)'}
                    </button>
                  </div>
                </div>

                <fieldset>
                  <legend className="text-2xl font-extrabold tracking-tight">Paiement</legend>
                  <div className="mt-5 space-y-3">
                    {paymentOptions.map(({ id, label, hint, icon: Icon }) => (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white p-4 transition ${paymentMethod === id ? 'border-orange-600 shadow-card' : 'border-stone-100 hover:border-stone-200'}`}
                      >
                        <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="sr-only" />
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${paymentMethod === id ? 'bg-orange-600 text-white' : 'bg-stone-100 text-ink-soft'}`}>
                          <Icon size={20} />
                        </span>
                        <span className="flex-1">
                          <span className="block font-bold">{label}</span>
                          <span className="block text-sm text-ink-muted">{hint}</span>
                        </span>
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${paymentMethod === id ? 'border-orange-600' : 'border-stone-300'}`}>
                          {paymentMethod === id && <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <button type="button" onClick={() => setIsOrdering(false)} className="text-sm font-bold text-ink hover:text-orange-600">← Modifier mon panier</button>
              </form>
            )}
          </section>

          {/* Récapitulatif */}
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-bold">Récapitulatif</h2>
              <dl className="mt-5 space-y-3 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Articles ({itemCount})</dt>
                  <dd className="font-semibold">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Livraison</dt>
                  <dd className="text-right text-sm text-ink-muted">À convenir avec le vendeur</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-stone-100 pt-4">
                  <dt className="font-bold">Total</dt>
                  <dd className="text-2xl font-extrabold">{formatPrice(total)}</dd>
                </div>
              </dl>

              {!isOrdering ? (
                <button onClick={() => { setIsOrdering(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="shop-btn-primary mt-6 w-full py-4 text-base">
                  Commander <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" form="checkout-form" disabled={loading} className="shop-btn-primary mt-6 w-full py-4 text-base">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : paymentMethod === 'ligdicash' ? <Lock size={18} /> : <MessageCircle size={18} />}
                  {loading ? 'Traitement…' : paymentMethod === 'ligdicash' ? `Payer ${formatPrice(total)}` : 'Envoyer ma commande'}
                </button>
              )}

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
                <Lock size={12} /> Prix vérifiés par FestiSolde au moment de la commande
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
