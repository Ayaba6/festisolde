import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, PackageSearch, ArrowRight } from 'lucide-react';
import { rememberOrder } from './OrderTracking';

// Confirmation d'une commande "paiement à la livraison" (envoyée sur WhatsApp).
export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName, whatsappUrl, storeSlug, orderId } = (location.state || {}) as Record<string, string>;

  useEffect(() => {
    if (!whatsappUrl) {
      const timer = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timer);
    }
    if (orderId) rememberOrder(orderId);
  }, [whatsappUrl, orderId, navigate]);

  if (!whatsappUrl) return null;

  return (
    <div className="shop-container flex max-w-lg flex-col items-center py-16 text-center md:py-24">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 size={44} strokeWidth={1.75} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">Commande enregistrée !</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        Merci{customerName ? ` ${customerName}` : ''}. <strong className="text-ink">Dernière étape :</strong> envoyez le
        récapitulatif au vendeur sur WhatsApp pour qu’il prépare votre livraison.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shop-btn mt-8 w-full bg-[#25D366] py-4 text-base text-white hover:bg-[#1fb857]"
      >
        <MessageCircle size={20} /> Envoyer au vendeur sur WhatsApp
      </a>

      {orderId && (
        <Link to={`/commande/${orderId}`} className="shop-btn-ghost mt-3 w-full py-3.5">
          <PackageSearch size={18} /> Suivre ma commande
        </Link>
      )}

      <Link to={storeSlug ? `/${storeSlug}` : '/'} className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-ink hover:text-orange-600">
        Continuer mes achats <ArrowRight size={16} />
      </Link>
    </div>
  );
}
