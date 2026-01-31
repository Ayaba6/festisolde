import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react'

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logique d'envoi d'email ici
    alert("Message reçu ! L'équipe FestiSolde vous reviendra sous 24h.")
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="bg-brand-dark py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
            Contactez <span className="text-brand-primary">L'Équipe</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            Une question sur une commande ? Une envie de devenir partenaire ? 
            Nous sommes à votre écoute du lundi au samedi.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. CARTES D'INFO RAPIDES */}
          <div className="space-y-4">
            <ContactCard 
              icon={<Phone className="text-brand-primary" />}
              title="Téléphone"
              detail="+226 70 18 99 12"
              sub="Appel direct & Support"
            />
            <ContactCard 
              icon={<MessageCircle className="text-emerald-500" />}
              title="WhatsApp"
              detail="Discuter maintenant"
              sub="Réponse rapide"
              isLink
              href="https://wa.me/22670189912"
            />
            <ContactCard 
              icon={<Mail className="text-brand-primary" />}
              title="Email"
              detail="contact@festisolde.bf"
              sub="Support technique"
            />
             <ContactCard 
              icon={<Clock className="text-brand-primary" />}
              title="Horaires"
              detail="08h00 — 18h00"
              sub="Lundi au Samedi"
            />
          </div>

          {/* 2. FORMULAIRE DE CONTACT */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-brand-dark mb-8 flex items-center gap-3">
              Envoyez-nous un message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom Complet</label>
                  <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary transition-all outline-none text-brand-dark font-bold" placeholder="Ex: Ahmed Ouédraogo" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                  <input type="email" required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary transition-all outline-none text-brand-dark font-bold" placeholder="votre@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sujet</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary transition-all outline-none text-brand-dark font-bold appearance-none">
                  <option>Question sur une commande</option>
                  <option>Devenir Vendeur</option>
                  <option>Signaler un problème</option>
                  <option>Autre</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</label>
                <textarea rows={5} required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary transition-all outline-none text-brand-dark font-bold" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>

              <button type="submit" className="w-full md:w-auto bg-brand-dark text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary transition-all flex items-center justify-center gap-3 group">
                Envoyer le message
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* 3. SECTION LOCALISATION (OUAGA) */}
        <div className="mt-12 bg-white p-4 rounded-[40px] shadow-lg border border-slate-100 overflow-hidden h-[400px] relative">
            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                {/* Remplacez par une iframe Google Maps réelle ici */}
                <p className="font-bold text-slate-500 flex items-center gap-2">
                    <MapPin /> Carte de Ouagadougou (Dassasgho)
                </p>
            </div>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3897.123456789!2d-1.5000000!3d12.3700000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDIyJzEyLjAiTiAxwrAyOSc2MC4wIlc!5e0!3m2!1sfr!2sbf!4v1234567890" 
                className="w-full h-full rounded-[32px] relative z-10"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
            ></iframe>
        </div>
      </div>
    </div>
  )
}

// Composant Interne pour les cartes
function ContactCard({ icon, title, detail, sub, isLink, href }: any) {
  const Content = () => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
        <p className="text-brand-dark font-black text-lg leading-none mb-1">{detail}</p>
        <p className="text-xs text-slate-500 font-medium">{sub}</p>
      </div>
    </div>
  )

  return isLink ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block transform transition-transform active:scale-95">
      <Content />
    </a>
  ) : (
    <Content />
  )
}