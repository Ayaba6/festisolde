import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react'

export default function Contact() {
  // Pas de serveur d'e-mail : le message est transmis au support via WhatsApp (pré-rempli).
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fields = Array.from(e.currentTarget.querySelectorAll('input, select, textarea')) as HTMLInputElement[]
    const [name, email, subject, message] = fields.map((f) => f.value.trim())
    const text =
      `Bonjour FestiSolde,\n\n${message}\n\n— ${name}` +
      (email ? ` (${email})` : '') +
      (subject ? `\nSujet : ${subject}` : '')
    window.open(`https://wa.me/22670189912?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="bg-ink py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 uppercase tracking-tight">
            Contactez <span className="text-orange-600">L'Équipe</span>
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto font-medium">
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
              icon={<Phone className="text-orange-600" />}
              title="Téléphone"
              detail={<span className="flex flex-col gap-1">{['70 18 99 12', '78 00 82 45', '78 95 71 50'].map((n) => <a key={n} href={`tel:+226${n.replace(/\s/g, '')}`} className="hover:text-orange-600">+226 {n}</a>)}</span>}
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
              icon={<Mail className="text-orange-600" />}
              title="Email"
              detail="contact@festisolde.bf"
              sub="Support technique"
            />
             <ContactCard 
              icon={<Clock className="text-orange-600" />}
              title="Horaires"
              detail="08h00 — 18h00"
              sub="Lundi au Samedi"
            />
          </div>

          {/* 2. FORMULAIRE DE CONTACT */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 md:p-12 border border-stone-100">
            <h2 className="text-2xl font-extrabold text-ink mb-8 flex items-center gap-3">
              Envoyez-nous un message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wide text-stone-400 ml-2">Nom Complet</label>
                  <input type="text" required className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none text-ink font-bold" placeholder="Ex: Ahmed Ouédraogo" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wide text-stone-400 ml-2">Email</label>
                  <input type="email" required className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none text-ink font-bold" placeholder="votre@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wide text-stone-400 ml-2">Sujet</label>
                <select className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none text-ink font-bold appearance-none">
                  <option>Question sur une commande</option>
                  <option>Devenir Vendeur</option>
                  <option>Signaler un problème</option>
                  <option>Autre</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wide text-stone-400 ml-2">Message</label>
                <textarea rows={5} required className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none text-ink font-bold" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>

              <button type="submit" className="w-full md:w-auto bg-ink text-white px-10 py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wide hover:bg-orange-600 transition-all flex items-center justify-center gap-3 group">
                Envoyer sur WhatsApp
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* 3. SECTION LOCALISATION (OUAGA) */}
        <div className="mt-12 bg-white p-4 rounded-[40px] shadow-lg border border-stone-100 overflow-hidden h-[400px] relative">
            <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
                {/* Remplacez par une iframe Google Maps réelle ici */}
                <p className="font-bold text-stone-500 flex items-center gap-2">
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
    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
      <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-stone-400 mb-1">{title}</p>
        <p className="text-ink font-extrabold text-lg leading-none mb-1">{detail}</p>
        <p className="text-xs text-stone-500 font-medium">{sub}</p>
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