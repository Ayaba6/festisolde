import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, ChevronDown, ShoppingBag, CreditCard, Truck, PackageSearch, RefreshCcw, Store, Wallet } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

// Coordonnées du support (à mettre à jour ici si elles changent)
const SUPPORT_PHONE = '+22670189912';
const SUPPORT_PHONE_LABEL = '+226 70 18 99 12';
const SUPPORT_EMAIL = 'contact@festisolde.com';

const FAQ = [
  {
    section: 'Acheter',
    items: [
      {
        icon: ShoppingBag,
        q: 'Comment passer une commande ?',
        a: 'Ajoutez vos articles au panier (une commande concerne une seule boutique), cliquez sur « Commander », indiquez votre nom, votre numéro WhatsApp et votre quartier, puis choisissez votre mode de paiement.',
      },
      {
        icon: CreditCard,
        q: 'Quels moyens de paiement sont acceptés ?',
        a: 'Vous pouvez payer en ligne par Orange Money, Moov Money ou carte bancaire (paiement sécurisé LigdiCash), ou bien en espèces directement au livreur à la réception.',
      },
      {
        icon: Truck,
        q: 'Comment se passe la livraison ?',
        a: 'Chaque vendeur organise sa livraison. Après votre commande, il vous contacte sur WhatsApp pour convenir du lieu, du délai et des éventuels frais. Partager votre position GPS accélère la livraison.',
      },
      {
        icon: PackageSearch,
        q: 'Comment suivre ma commande ?',
        a: 'Après chaque commande, un lien « Suivre ma commande » vous est proposé : il indique en temps réel si votre commande est reçue, en préparation ou livrée. Gardez-le précieusement.',
      },
      {
        icon: RefreshCcw,
        q: 'Un article ne correspond pas à l’annonce ?',
        a: 'Contactez d’abord le vendeur depuis la page de suivi de votre commande. Si vous ne trouvez pas de solution, écrivez au support FestiSolde avec la référence de la commande : nous intervenons auprès du vendeur.',
      },
    ],
  },
  {
    section: 'Vendre',
    items: [
      {
        icon: Store,
        q: 'Comment ouvrir ma boutique ?',
        a: 'Cliquez sur « Vendre sur FestiSolde », créez votre compte avec le nom de votre boutique, puis ajoutez vos produits avec quelques photos. L’ouverture de la boutique est gratuite.',
      },
      {
        icon: Wallet,
        q: 'Comment suis-je payé ?',
        a: 'Pour un paiement à la livraison, vous encaissez directement le client. Pour un paiement en ligne, le montant est ajouté à votre solde FestiSolde une fois la commande livrée ; vous demandez ensuite un retrait Orange Money, Moov Money ou Wave (minimum 500 FCFA). Une commission de 10 % s’applique au retrait.',
      },
    ],
  },
];

export default function Aide() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      <section className="bg-cream">
        <div className="shop-container py-12 text-center md:py-16">
          <p className="shop-eyebrow">Centre d’aide</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">Comment pouvons-nous vous aider ?</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-ink-soft">Les réponses aux questions les plus fréquentes, et une équipe joignable si besoin.</p>
        </div>
      </section>

      <main className="shop-container max-w-5xl py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: MessageCircle, title: 'WhatsApp', text: 'Le plus rapide', href: `https://wa.me/${SUPPORT_PHONE.replace('+', '')}`, cta: 'Écrire sur WhatsApp', cls: 'bg-[#25D366] text-white' },
            { icon: Phone, title: 'Téléphone', text: SUPPORT_PHONE_LABEL, href: `tel:${SUPPORT_PHONE}`, cta: 'Appeler', cls: 'bg-orange-50 text-orange-600' },
            { icon: Mail, title: 'E-mail', text: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}`, cta: 'Envoyer un e-mail', cls: 'bg-stone-100 text-ink' },
          ].map(({ icon: Icon, title, text, href, cta, cls }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group rounded-3xl border border-stone-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cls}`}><Icon size={22} /></span>
              <p className="mt-4 text-lg font-bold">{title}</p>
              <p className="text-ink-muted">{text}</p>
              <p className="mt-4 text-sm font-bold text-orange-600 group-hover:underline">{cta} →</p>
            </a>
          ))}
        </div>

        {FAQ.map(({ section, items }) => (
          <section key={section} className="mt-14">
            <h2 className="shop-title">{section}</h2>
            <div className="mt-6 divide-y divide-stone-100 rounded-3xl border border-stone-100 bg-white shadow-card">
              {items.map(({ icon: Icon, q, a }) => {
                const isOpen = open === q;
                return (
                  <div key={q}>
                    <button
                      onClick={() => setOpen(isOpen ? null : q)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 px-5 py-5 text-left"
                    >
                      <Icon size={20} className="shrink-0 text-orange-600" />
                      <span className="flex-1 font-semibold">{q}</span>
                      <ChevronDown size={18} className={`shrink-0 text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && <p className="px-5 pb-5 pl-14 text-[15px] leading-relaxed text-ink-soft">{a}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <p className="mt-12 text-center text-ink-muted">
          Vous êtes vendeur ? <Link to="/auth" className="font-bold text-ink underline decoration-orange-400 underline-offset-4">Accédez à votre espace</Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
