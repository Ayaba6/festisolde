import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-20 pb-10 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* --- COLONNE 1 : BRAND --- */}
          <div className="space-y-6">
            <img 
              src="/logo-festisolde.png" 
              alt="Festisolde" 
              className="h-10 brightness-0 invert opacity-90" 
            />
            <p className="text-gray-500 text-[11px] leading-relaxed uppercase tracking-widest font-medium">
              Le carrefour stratégique du gros et des opportunités promotionnelles au Burkina Faso. Des stocks directs, des prix imbattables.
            </p>
            <div className="flex gap-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* --- COLONNE 2 : SHOPPING --- */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: 'Catalogue Complet', link: '/products' },
                { name: 'Vente en Gros', link: '/products?type=gros' },
                { name: 'Arrivages Promo', link: '/products?type=promo' },
                { name: 'Nos Grossistes', link: '/grossistes' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.link} className="text-[10px] font-medium text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- COLONNE 3 : AIDE --- */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-8">Business</h4>
            <ul className="space-y-4">
              {[
                'Devenir Vendeur',
                'Guide Grossiste',
                'Tarifs Logistique',
                'Contact Support'
              ].map((item) => (
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
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-8">Contact</h4>
            <div className="space-y-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-orange-500 mt-0.5" />
                <span>Ouagadougou, Burkina Faso<br /><span className="text-gray-600 text-[9px]">Secteur 15, Ouaga 2000</span></span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-orange-500" />
                <span>+226 70 18 99 12</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-orange-500" />
                <span>contact@festisolde.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-medium text-gray-600 uppercase tracking-[0.3em]">
            Festisolde © 2026 — Plateforme B2B & Promotionnelle
          </p>
          
          <div className="flex gap-8">
            {['CGV', 'Confidentialité'].map((item) => (
              <span key={item} className="text-[9px] font-medium text-gray-600 uppercase tracking-[0.3em] hover:text-white cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>

          {/* Moyens de paiement */}
          <div className="flex gap-3">
             <div className="px-2 py-1 border border-gray-800 text-[7px] font-bold text-gray-500 tracking-tighter">ORANGE MONEY</div>
             <div className="px-2 py-1 border border-gray-800 text-[7px] font-bold text-gray-500 tracking-tighter">MOOV MONEY</div>
          </div>
        </div>

      </div>
    </footer>
  );
}