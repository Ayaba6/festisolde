import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  Truck, 
  CreditCard, 
  RefreshCcw, 
  ChevronDown, 
  MessageSquare 
} from 'lucide-react';

const faqs = [
  {
    category: "Commandes & Livraison",
    icon: <Truck className="text-blue-500" size={20} />,
    questions: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Pour les produits de la collection 'Semer l'Avenir', les délais sont de 24h à 48h pour les livraisons urbaines et de 3 à 5 jours pour les zones périphériques."
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Une fois votre commande validée, vous recevrez un code de suivi par SMS ou vous pourrez consulter l'état directement dans votre espace client."
      }
    ]
  },
  {
    category: "Paiements & Sécurité",
    icon: <CreditCard className="text-green-500" size={20} />,
    questions: [
      {
        q: "Quels modes de paiement acceptez-vous ?",
        a: "Nous acceptons les paiements via Mobile Money (Orange Money, Moov Money), les cartes bancaires et le paiement à la livraison pour certains lots."
      }
    ]
  },
  {
    category: "Retours & Remboursements",
    icon: <RefreshCcw className="text-orange-500" size={20} />,
    questions: [
      {
        q: "Puis-je échanger un produit en liquidation ?",
        a: "Les articles en liquidation (Ventes Flash) sont échangeables uniquement en cas de défaut de fabrication constaté à la réception."
      }
    ]
  }
];

export default function Aide() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 font-sans">
      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full mb-4"
        >
          <HelpCircle size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Centre d'assistance</span>
        </motion.div>
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">
          Comment pouvons-nous <span className="text-brand-primary">vous aider ?</span>
        </h1>
        
        {/* BARRE DE RECHERCHE */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher une réponse (ex: livraison, paiement...)"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-brand-primary transition-all text-slate-900"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      {/* FAQ CONTENT */}
      <div className="max-w-3xl mx-auto px-4">
        {faqs.map((section, idx) => (
          <div key={idx} className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              {section.icon}
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{section.category}</h2>
            </div>

            <div className="space-y-4">
              {section.questions
                .filter(item => item.q.toLowerCase().includes(searchTerm) || item.a.toLowerCase().includes(searchTerm))
                .map((item, qIdx) => (
                <div key={qIdx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => setActiveQuestion(activeQuestion === item.q ? null : item.q)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-bold text-slate-700">{item.q}</span>
                    <motion.div
                      animate={{ rotate: activeQuestion === item.q ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="text-slate-400" size={20} />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {activeQuestion === item.q && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-slate-500 text-sm leading-relaxed border-t border-slate-50">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CONTACT SECTION */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-12 relative overflow-hidden text-center">
          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-black text-white mb-4 uppercase italic">
              Vous n'avez pas trouvé <span className="text-brand-primary">votre réponse ?</span>
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Notre équipe d'assistance est disponible pour vous accompagner dans votre aventure entrepreneuriale.
            </p>
            <a 
              href="https://wa.me/VOTRE_NUMERO" 
              className="inline-flex items-center gap-3 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
            >
              <MessageSquare size={18} />
              Discuter sur WhatsApp
            </a>
          </div>
          {/* Déco background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}