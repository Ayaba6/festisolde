import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-20 pb-10 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* --- COLONNE 1 : BRAND --- */}
          <div className="space-y-6">
            <img src="/logo-festisolde.png" alt="Festisolde" className="h-10 brightness-0 invert opacity-80" />
            <p className="text-gray-500 text-[11px] leading-relaxed uppercase tracking-widest font-medium">
              La première marketplace de liquidation au Burkina. Directement des grossistes aux revendeurs.
            </p>
            <div className="flex gap-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-500 hover:text-red-600 transition-colors">
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* --- COLONNE 2 : SHOPPING --- */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 mb-8">Navigation</h4>
            <ul className="space-y-4">
              {['Tous les produits', 'Grossistes', 'Ventes Flash', 'Nouveautés'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[10px] font-medium text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- COLONNE 3 : AIDE --- */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 mb-8">Support</h4>
            <ul className="space-y-4">
              {['Centre d\'aide', 'Comment vendre', 'Livraison', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[10px] font-medium text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- COLONNE 4 : CONTACT --- */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 mb-8">Contact</h4>
            <div className="space-y-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-red-600" />
                <span>Ouagadougou, Burkina Faso</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-red-600" />
                <span>+226 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-red-600" />
                <span>contact@festisolde.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-medium text-gray-600 uppercase tracking-[0.3em]">
            Festisolde © 2026 — Tous droits réservés
          </p>
          
          <div className="flex gap-8">
            {['Mentions Légales', 'Confidentialité'].map((item) => (
              <span key={item} className="text-[9px] font-medium text-gray-600 uppercase tracking-[0.3em] hover:text-white cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>

          {/* Moyens de paiement factices mais stylés */}
          <div className="flex gap-3 opacity-30 grayscale">
             <div className="px-2 py-1 border border-gray-600 text-[8px] font-bold">ORANGE MONEY</div>
             <div className="px-2 py-1 border border-gray-600 text-[8px] font-bold">MOOV MONEY</div>
          </div>
        </div>

      </div>
    </footer>
  );
}