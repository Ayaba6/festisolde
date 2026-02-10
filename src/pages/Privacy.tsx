import { ShieldCheck, Lock, EyeOff, Trash2 } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8 text-red-600">
          <ShieldCheck size={40} />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Politique de Confidentialité</h1>
        </div>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-red-600" /> 1. Introduction
            </h2>
            <p>
              L'application <strong>FESTISOLDE</strong>, plateforme spécialisée dans la vente en solde et la liquidation, 
              s'engage à protéger la vie privée de ses utilisateurs. Cette politique détaille nos pratiques concernant 
              la collecte et le traitement de vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <EyeOff size={20} className="text-red-600" /> 2. Collecte des Données
            </h2>
            <p>Dans le cadre de nos activités de déstockage, nous collectons :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Identité :</strong> Nom, e-mail et téléphone pour le suivi des livraisons.</li>
              <li><strong>Transactions :</strong> Historique des achats effectués en solde.</li>
              <li><strong>Médias :</strong> Photos téléchargées pour la recherche visuelle d'articles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Utilisation des Données</h2>
            <p>
              Vos informations servent exclusivement à valider vos commandes de liquidation, assurer la livraison 
              et vous informer des prochaines ventes flash ou soldes exceptionnels sur FESTISOLDE.
            </p>
          </section>

          <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <h2 className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2">
              <Trash2 size={20} /> 4. Suppression de compte
            </h2>
            <p className="text-sm">
              Conformément aux exigences d'Apple et Google, vous pouvez demander la suppression de votre compte 
              et de toutes vos données personnelles à tout moment depuis votre espace client ou en contactant 
              notre support technique.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              FESTISOLDE — Spécialiste de la liquidation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}