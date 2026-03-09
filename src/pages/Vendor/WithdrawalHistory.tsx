import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, 
  Wallet, Calendar, CreditCard, Loader2 
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
      // Récupérer d'abord le store_id
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
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Historique des <span className="text-orange-600">Retraits</span></h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Suivi de vos transactions</p>
        </div>
      </div>

      <div className="space-y-4">
        {withdrawals.length > 0 ? (
          withdrawals.map((w) => (
            <div key={w.id} className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm hover:border-orange-500/20 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Wallet className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black italic text-gray-900">{w.amount?.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-orange-600 uppercase">FCFA</p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 mt-1">
                      <Calendar size={12} /> {new Date(w.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-center min-w-[120px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Méthode</p>
                    <p className="text-[10px] font-black uppercase flex items-center justify-center gap-2">
                      <CreditCard size={12} className="text-orange-600" /> {w.payment_method}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-center min-w-[120px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Réception</p>
                    <p className="text-[10px] font-black">{w.payment_details}</p>
                  </div>

                  <div className="ml-auto md:ml-0">
                    {getStatusBadge(w.status)}
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-100 py-20 rounded-[3rem] text-center">
            <p className="text-[11px] font-black uppercase text-gray-300 italic tracking-[0.2em]">Aucun retrait enregistré pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}