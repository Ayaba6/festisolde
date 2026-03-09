import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, 
  Wallet, Calendar, CreditCard, Loader2, MessageSquareWarning, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (store) {
        const { data } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });
        
        setWithdrawals(data || []);
      }
    }
    setLoading(false);
  }

  // FONCTION DE RÉCLAMATION (WhatsApp)
  const handleClaim = (w) => {
    const date = new Date(w.created_at).toLocaleDateString('fr-FR');
    const message = `Bonjour, je souhaite faire une réclamation pour mon retrait du ${date}. \nMontant: ${w.amount} CFA \nID: #${w.id.slice(0, 8)} \nStatut: ${w.status}`;
    const whatsappUrl = `https://wa.me/225XXXXXXXX?text=${encodeURIComponent(message)}`; // Remplace par ton numéro
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valide': 
        return <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase flex items-center gap-2 border border-green-100"><CheckCircle2 size={12}/> Payé</span>;
      case 'rejete': 
        return <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase flex items-center gap-2 border border-red-100"><XCircle size={12}/> Refusé</span>;
      default: 
        return <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase flex items-center gap-2 border border-orange-100"><Clock size={12}/> En cours</span>;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans antialiased text-gray-900 pb-20">
      
      {/* HEADER NAVIGATION */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Suivi des <span className="text-orange-600">Retraits</span></h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transparence totale sur vos fonds</p>
        </div>
      </div>

      <div className="space-y-6">
        {withdrawals.length > 0 ? (
          withdrawals.map((w) => {
            const commission = w.amount * 0.10;
            const netAmount = w.amount - commission;

            return (
              <div key={w.id} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-orange-500/10 transition-all group">
                
                {/* Ligne 1: Montant et Statut */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 text-white">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Demande du {new Date(w.created_at).toLocaleDateString('fr-FR')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black italic tracking-tighter">{w.amount?.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-gray-400">CFA</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(w.status)}
                </div>

                {/* Ligne 2: Détails financiers (Transparence) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-[1.8rem] mb-6 border border-gray-100">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Brut demandé</p>
                    <p className="text-[11px] font-bold">{w.amount?.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Frais plateforme (10%)</p>
                    <p className="text-[11px] font-bold text-red-500">-{commission.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Net à percevoir</p>
                    <p className="text-[11px] font-extrabold text-green-600 underline decoration-2">{netAmount.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Méthode</p>
                    <p className="text-[11px] font-bold uppercase truncate">{w.payment_method}</p>
                  </div>
                </div>

                {/* Ligne 3: Actions et Réclamation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info size={14} />
                    <p className="text-[9px] font-bold uppercase tracking-tight">Envoyé vers : <span className="text-gray-900">{w.payment_details}</span></p>
                  </div>
                  
                  <button 
                    onClick={() => handleClaim(w)}
                    className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquareWarning size={14} /> Un problème ? Réclamer
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-100 py-20 rounded-[3rem] text-center">
            <p className="text-[11px] font-black uppercase text-gray-300 italic tracking-[0.2em]">Aucun retrait enregistré pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}