import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  CreditCard,
  ExternalLink,
  ArrowLeft 
} from 'lucide-react';

export default function Aide() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "Comment commander un gros lot sur Festisolde ?",
      answer: "Sélectionnez le lot qui vous intéresse, ajoutez-le au panier et validez. Pour les commandes en gros (conteneurs ou palettes), un conseiller vous contactera pour finaliser les détails logistiques après paiement de l'acompte.",
      icon: <Truck size={18} className="text-orange-500" />
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "Nous acceptons les paiements via Orange Money, Moov Money, Wave, ainsi que les virements bancaires pour les transactions de gros montants (supérieurs à 500.000 FCFA).",
      icon: <CreditCard size={18} className="text-blue-500" />
    },
    {
      question: "Comment vendre mes propres stocks ?",
      answer: "Cliquez sur 'Vendre un stock' dans le menu. Créez votre boutique gratuitement, listez vos produits et commencez à vendre. Festisolde prélève une commission de 10% sur chaque vente réussie.",
      icon: <ShieldCheck size={18} className="text-green-500" />
    },
    {
      question: "Politique de retour et remboursement",
      answer: "En cas de produit non conforme à la description, vous disposez de 48h après réception pour signaler le litige. L'argent est bloqué par Festisolde jusqu'à votre confirmation de satisfaction.",
      icon: <RefreshCcw size={18} className="text-red-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-black text-white py-16 px-6 relative text-center">
        <Link 
          to="/" 
          className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour Accueil
        </Link>

        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
          Centre de <span className="text-orange-500">Support</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto">
          Besoin d'aide pour une commande ou pour vendre vos stocks ? Nous sommes là.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        
        {/* --- CONTACT QUICK CARDS --- */}
        {/* AJOUT : relative z-10 pour que les cartes restent au premier plan au survol */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
          <ContactCard 
            icon={<MessageCircle size={24} />}
            title="WhatsApp Live"
            desc="Réponse en moins de 15min"
            action="Démarrer le chat"
            link="https://wa.me/22600000000"
            color="bg-green-600"
          />
          <ContactCard 
            icon={<Mail size={24} />}
            title="Support Email"
            desc="Pour les litiges officiels"
            action="Envoyer un mail"
            link="mailto:support@festisolde.com"
            color="bg-black"
          />
          <ContactCard 
            icon={<Phone size={24} />}
            title="Ligne Directe"
            desc="Lun - Ven | 08h - 18h"
            action="Appeler maintenant"
            link="tel:+22600000000"
            color="bg-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* FAQ SECTION */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-orange-600 block"></span>
              Questions Fréquentes
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      {faq.icon}
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800">{faq.question}</span>
                    </div>
                    {openFaq === index ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-6 pt-0 animate-fadeIn">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl h-fit">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Écrivez-nous</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Votre Nom</label>
                <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Objet du message</label>
                <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all">
                  <option>Problème de commande</option>
                  <option>Devenir Grossiste</option>
                  <option>Litige / Remboursement</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Message</label>
                <textarea rows="4" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"></textarea>
              </div>
              <button className="w-full bg-black text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-black/10">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, action, link, color }) {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group block relative hover:z-20"
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-sm font-black uppercase tracking-tight mb-1 text-slate-900">{title}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{desc}</p>
      <div className="flex items-center gap-2 text-orange-600 font-black text-[9px] uppercase tracking-tighter">
        {action} <ExternalLink size={10} />
      </div>
    </a>
  );
}