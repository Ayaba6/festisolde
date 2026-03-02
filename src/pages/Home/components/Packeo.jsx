import { Link } from 'react-router-dom';
import { Package, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gray-50 py-16 overflow-hidden border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* --- TEXTE GAUCHE : CONCEPT PACKEO --- */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl mb-6 shadow-xl">
              <Package size={18} className="text-red-600" />
              <span className="text-xs font-black uppercase tracking-widest">Concept Packeo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-[0.85] uppercase">
              ACHETEZ EN <br/>
              <span className="text-red-600 italic">PACKS COMPLETS</span>
            </h1>

            <p className="text-gray-500 text-lg font-medium mb-8 uppercase tracking-tight leading-snug max-w-lg mx-auto lg:mx-0">
              Ne cherchez plus l'unité. Prenez le <span className="text-black font-black">lot entier</span>, profitez du prix de gros et maximisez votre marge à la revente.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Prix imbattables sur le volume",
                "Articles triés et prêts à la revente",
                "Livraison sécurisée partout au Burkina"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                  <CheckCircle2 size={18} className="text-red-600" />
                  <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{text}</span>
                </div>
              ))}
            </div>

            <Link to="/auth" className="inline-flex items-center gap-4 bg-red-600 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-red-200">
              Voir tous les packs <ArrowRight size={18} />
            </Link>
          </div>

          {/* --- DROITE : VISUEL DU PACK (Inspiré de ton image) --- */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl border border-gray-100 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="/h1.jpg" 
                alt="Pack de vêtements" 
                className="w-full h-auto rounded-[2.5rem] object-cover"
              />
              
              {/* Badge flottant Prix du Pack */}
              <div className="absolute -bottom-6 -left-6 bg-black text-white p-6 rounded-[2rem] shadow-2xl border-4 border-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Prix du lot</p>
                <p className="text-3xl font-black tracking-tighter">85.000 <span className="text-xs">CFA</span></p>
              </div>

              {/* Badge Flash */}
              <div className="absolute -top-4 -right-4 bg-red-600 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-xl animate-bounce">
                <Zap size={20} fill="currentColor" />
                <span className="text-[9px] font-black uppercase italic">-40%</span>
              </div>
            </div>

            {/* Décoration arrière-plan */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-600/5 rounded-full blur-3xl"></div>
          </div>

        </div>
      </div>
    </section>
  );
}