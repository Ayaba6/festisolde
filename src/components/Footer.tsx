import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* SECTION PRINCIPALE */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Colonne 1 : À propos */}
        <div className="space-y-4">
          <Link to="/" className="text-white font-bold text-2xl tracking-tight">
            Festi<span className="text-indigo-500">Solde</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            La première plateforme de déstockage certifiée au Burkina Faso. 
            Achetez des produits de qualité à prix réduits, en toute sécurité.
          </p>
          <div className="flex gap-4 pt-2">
            <SocialLink href="#" icon={<FacebookIcon />} label="Facebook" />
            <SocialLink href="#" icon={<TwitterIcon />} label="Twitter" />
            <SocialLink href="#" icon={<InstagramIcon />} label="Instagram" />
          </div>
        </div>

        {/* Colonne 2 : Navigation Boutique */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Boutique</h3>
          <ul className="space-y-3 text-sm">
            <li><FooterLink to="/products">Toutes les offres</FooterLink></li>
            <li><FooterLink to="/category/electronique">Électronique</FooterLink></li>
            <li><FooterLink to="/category/mode">Mode & Beauté</FooterLink></li>
            <li><FooterLink to="/vendor/register">Devenir Vendeur</FooterLink></li>
          </ul>
        </div>

        {/* Colonne 3 : Support & Aide */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Assistance</h3>
          <ul className="space-y-3 text-sm">
            <li><FooterLink to="/faq">Centre d'aide / FAQ</FooterLink></li>
            <li><FooterLink to="/contact">Contactez-nous</FooterLink></li>
            <li><FooterLink to="/terms">Conditions Générales</FooterLink></li>
            <li><FooterLink to="/privacy">Confidentialité</FooterLink></li>
          </ul>
        </div>

        {/* Colonne 4 : Paiement & Sécurité */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Paiement Sécurisé</h3>
          <p className="text-xs text-gray-500 mb-4">Nous acceptons les paiements mobiles et cartes bancaires.</p>
          <div className="flex flex-wrap gap-2">
            <PaymentBadge label="Orange Money" />
            <PaymentBadge label="Moov Money" />
            <PaymentBadge label="Visa/MC" />
          </div>
        </div>
      </div>

      {/* BARRE INFÉRIEURE */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p>© {currentYear} FestiSolde SARL. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Système opérationnel
            </span>
            <p>Fait avec ❤️ à Ouagadougou</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// --- SOUS-COMPOSANTS UTILITAIRES ---

function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="hover:text-indigo-400 transition-colors duration-200 block">
      {children}
    </Link>
  )
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
      aria-label={label}
    >
      {icon}
    </a>
  )
}

function PaymentBadge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-bold text-gray-400">
      {label}
    </span>
  )
}

// --- ICONES SVG ---

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
)

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
)