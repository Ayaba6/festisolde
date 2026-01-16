import { User as UserIcon, Mail, Shield, Calendar, LogOut, Key } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

interface AccountPageProps {
  user: any
  setUser: (user: any | null) => void
}

export default function AccountPage({ user, setUser }: AccountPageProps) {
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold italic uppercase">Utilisateur non connecté</p>
        </div>
      </div>
    )
  }

  // Extraction des infos depuis les métadonnées Supabase
  const fullName = user.user_metadata?.full_name || 'Utilisateur FestiSolde'
  const role = user.role || 'Client'
  const createdAt = new Date(user.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 lg:py-20">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* HEADER DE LA PAGE */}
        <header className="mb-10">
          <h1 className="text-3xl font-black text-brand-dark tracking-tight italic uppercase">
            Mon <span className="text-brand-primary">Espace</span>
          </h1>
          <p className="text-slate-500 font-medium">Gérez vos informations personnelles et votre sécurité.</p>
        </header>

        <div className="grid gap-6">
          
          {/* CARTE PROFIL PRINCIPALE */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-brand-dark p-8 flex items-center gap-6">
              <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand-primary/20">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">{fullName}</h2>
                <span className="inline-block bg-white/10 text-brand-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mt-2">
                  Membre Privilège
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Infos détaillées */}
              <div className="grid md:grid-cols-2 gap-6">
                <InfoItem 
                  icon={<Mail size={18} />} 
                  label="Adresse Email" 
                  value={user.email} 
                />
                <InfoItem 
                  icon={<Shield size={18} />} 
                  label="Rôle" 
                  value={role} 
                  highlight 
                />
                <InfoItem 
                  icon={<Calendar size={18} />} 
                  label="Inscrit le" 
                  value={createdAt} 
                />
              </div>

              <div className="h-px bg-slate-50 my-4" />

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-brand-dark rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200">
                  <Key size={16} />
                  Modifier le mot de passe
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-rose-100"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* SECTION INFO SÉCURITÉ (Bonus Design) */}
          <div className="bg-brand-primary/5 rounded-[1.5rem] p-6 border border-brand-primary/10 flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-brand-primary">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-brand-dark font-bold text-sm">Votre compte est sécurisé</p>
              <p className="text-slate-500 text-xs mt-1">
                Seul vous pouvez accéder à vos données personnelles. FestiSolde utilise un cryptage de bout en bout pour protéger vos transactions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Sous-composant pour les éléments d'information
function InfoItem({ icon, label, value, highlight }: { icon: any, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`font-bold ${highlight ? 'text-brand-primary' : 'text-brand-dark'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}