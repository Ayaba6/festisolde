import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

// Imports des logos avec les bonnes extensions
import LogoOM from '../assets/OM.png'
import LogoMM from '../assets/MM.png'
import LogoTM from '../assets/TM.png' 
import LogoMC from '../assets/MC.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-dark text-slate-400">
      {/* SECTION PRINCIPALE */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        
        {/* Colonne 1 : À propos */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-primary/20">f</div>
            <span className="text-white font-black text-2xl tracking-tighter">
              Festi<span className="text-brand-primary">Solde</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed pr-4">
            La première plateforme de déstockage certifiée au Burkina Faso. 
            Nous connectons les meilleures boutiques de Ouagadougou avec des acheteurs exigeants.
          </p>
          <div className="flex gap-3">
            <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
            <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
          </div>
        </div>

        {/* Colonne 2 : Navigation Boutique */}
        <div>
          <h3 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Boutique</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><FooterLink to="/products">Toutes les offres</FooterLink></li>
            <li><FooterLink to="/category/electronique">Électronique</FooterLink></li>
            <li><FooterLink to="/category/mode">Mode & Beauté</FooterLink></li>
            <li><FooterLink to="/vendor/register" className="text-brand-primary font-bold">Devenir Vendeur</FooterLink></li>
          </ul>
        </div>

        {/* Colonne 3 : Contact & Localisation */}
        <div>
          <h3 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Contact</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-brand-primary" />
              <span>Ouagadougou, Dassasgho</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-brand-primary" />
              <span>+226 70 18 99 12 / 54 60 54 83</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-brand-primary" />
              <span>contact@festisolde.bf</span>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Paiement & Sécurité */}
        <div>
          <h3 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Paiement Sécurisé</h3>
          <p className="text-xs mb-6 leading-relaxed">
            Transactions sécurisées. Nous acceptons les paiements mobiles locaux et cartes bancaires.
          </p>
          
          {/* Grille des logos de paiement */}
          <div className="flex flex-wrap gap-4 items-center">
            <img src={LogoOM} alt="Orange Money" className="h-7 w-auto hover:scale-110 transition-transform" />
            <img src={LogoMM} alt="Moov Money" className="h-7 w-auto hover:scale-110 transition-transform" />
            <img src={LogoTM} alt="Telecel Money" className="h-9 w-auto hover:scale-110 transition-transform" />
            <img src={LogoMC} alt="Mastercard" className="h-8 w-auto hover:scale-110 transition-transform" />
          </div>
          
          <div className="mt-4 flex items-center gap-2 opacity-50">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-[9px] font-black uppercase tracking-widest">Garanti SSL</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
        </div>
      </div>

      {/* BARRE INFÉRIEURE */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest font-bold">
          <p>© {currentYear} FestiSolde SARL. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-8">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Système opérationnel
            </span>
            <p className="text-white/40 italic">Fait avec ❤️ au Burkina Faso</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// --- SOUS-COMPOSANTS ---

function FooterLink({ to, children, className = "" }: { to: string, children: React.ReactNode, className?: string }) {
  return (
    <Link to={to} className={`hover:text-brand-primary transition-colors duration-300 block ${className}`}>
      {children}
    </Link>
  )
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all duration-300 border border-white/5"
      aria-label={label}
    >
      {icon}
    </a>
  )
}