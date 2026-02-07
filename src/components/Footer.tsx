import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Store, CheckCircle, Info } from 'lucide-react'

// Imports des logos de paiement
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
        
        {/* Colonne 1 : À propos + LOGO */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center group">
            <div className="h-[95px] w-auto transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/logo-festisolde1.png" 
                alt="FestiSolde" 
                className="h-full w-full object-contain brightness-110" 
              />
            </div>
          </Link>
          <p className="text-sm leading-relaxed pr-4 text-slate-400 italic">
            La première plateforme de déstockage certifiée au Burkina Faso. 
            Nous connectons les meilleures boutiques de Ouagadougou avec des acheteurs exigeants.
          </p>
          <div className="flex gap-3">
            <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
            <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
          </div>
        </div>

        {/* Colonne 2 : Espace Business */}
        <div>
          <h3 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Partenaires & Business</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li>
              <Link to="/vendre" className="text-brand-primary font-black italic flex items-center gap-2 group">
                <Store size={16} className="group-hover:scale-110 transition-transform" />
                VENDRE SUR FESTISOLDE
              </Link>
            </li>
            <li><FooterLink to="/vendor/create-shop">Ouvrir une boutique</FooterLink></li>
            <li><FooterLink to="/products">Toutes les offres</FooterLink></li>
            
            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Expérience</h4>
                <li><FooterLink to="/pack-creator">Atelier Packeo</FooterLink></li>
                <li><FooterLink to="/products?promo=true">Ventes Flash</FooterLink></li>
            </div>
          </ul>
        </div>

        {/* Colonne 3 : Support & À Propos (MISE À JOUR) */}
        <div>
          <h3 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Support Client</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li>
              {/* LIEN À PROPOS AJOUTÉ ICI */}
              <FooterLink to="/about" className="flex items-center gap-3 text-white font-black italic">
                <Info size={16} className="text-brand-primary" />
                <span>NOTRE HISTOIRE</span>
              </FooterLink>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-brand-primary" />
              <span>Ouagadougou, Dassasgho</span>
            </li>
            <li className="flex items-center gap-3 font-bold text-white">
              <Phone size={16} className="text-brand-primary" />
              <span>+226 70 18 99 12</span>
            </li>
            <li>
              <FooterLink to="/contact" className="flex items-center gap-3">
                <Mail size={16} className="text-brand-primary" />
                <span>Formulaire de contact</span>
              </FooterLink>
            </li>
            <li className="pt-4">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-white mb-2 flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-500" /> Boutique Vérifiée
                  </p>
                  <p className="text-[9px] leading-tight opacity-60">Vendeurs contrôlés physiquement pour votre sécurité.</p>
               </div>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Paiement & Sécurité */}
        <div>
          <h3 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Paiement Sécurisé</h3>
          <p className="text-xs mb-6 leading-relaxed italic">
            Transactions 100% sécurisées via les réseaux mobiles du Burkina Faso.
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <img src={LogoOM} alt="Orange Money" className="h-7 w-auto hover:scale-110 transition-transform grayscale hover:grayscale-0" />
            <img src={LogoMM} alt="Moov Money" className="h-7 w-auto hover:scale-110 transition-transform grayscale hover:grayscale-0" />
            <img src={LogoTM} alt="Telecel Money" className="h-9 w-auto hover:scale-110 transition-transform grayscale hover:grayscale-0" />
            <img src={LogoMC} alt="Mastercard" className="h-8 w-auto hover:scale-110 transition-transform grayscale hover:grayscale-0" />
          </div>
          
          <div className="mt-6 flex items-center gap-2 opacity-30">
            <div className="h-px flex-1 bg-white"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Technologie SSL</span>
            <div className="h-px flex-1 bg-white"></div>
          </div>
        </div>
      </div>

      {/* BARRE INFÉRIEURE */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest font-bold">
          <p>© {currentYear} FestiSolde  <span className="text-brand-primary">226 kodalink.</span></p>
          <div className="flex flex-wrap justify-center gap-8">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Plateforme Sécurisée
            </span>
            <p className="text-white/40 italic font-medium text-[9px]">Propulsé par KODALINK</p>
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
      className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all duration-300 border border-white/5 text-white"
      aria-label={label}
    >
      {icon}
    </a>
  )
}