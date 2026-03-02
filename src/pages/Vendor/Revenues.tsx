import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Download, 
  Search,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Phone
} from 'lucide-react';

export default function Revenues() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  async function fetchSalesData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();

      if (store) {
        // On récupère les commandes de la table 'orders'
        const { data: salesData } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });

        if (salesData) {
          setSales(salesData);
          
          const total = salesData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
          const uniqueCustomers = new Set(salesData.map(s => s.customer_phone)).size;
          
          setStats({
            total: total,
            count: salesData.length,
            customers: uniqueCustomers
          });
        }
      }
    }
    setLoading(false);
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gray-400">Analyse financière en cours...</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 antialiased">
      
      {/* --- HEADER COMPACT --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pb-8 border-b border-gray-100">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[#0866FF] uppercase tracking-[0.4em] ml-1">Performances</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Revenus & <span className="text-gray-300">Statistiques</span></h1>
        </div>
        <button className="flex items-center gap-3 border border-gray-200 px-5 py-2.5 rounded-full text-[11px] font-semibold text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all">
          <Download size={14} /> EXPORTER LES DONNÉES
        </button>
      </header>

      {/* --- STATS FINES (Harmonisées avec Dashboard) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        <StatLine label="Chiffre d'affaires" value={stats.total.toLocaleString()} unit="FCFA" trend="+12%" />
        <StatLine label="Volume de ventes" value={stats.count} unit="Transactions" />
        <StatLine label="Fidélité client" value={stats.customers} unit="Contacts" />
      </div>

      {/* --- TABLEAU DES TRANSACTIONS --- */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Historique des transactions</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0866FF] transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="RECHERCHER UN CLIENT..." 
                className="pl-10 pr-4 py-2 bg-transparent border-b border-gray-100 text-[11px] focus:border-[#0866FF] outline-none w-64 transition-all tracking-widest uppercase" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                <th className="px-8 py-4 font-semibold">Date</th>
                <th className="px-8 py-4 font-semibold">Client</th>
                <th className="px-8 py-4 font-semibold">Localisation</th>
                <th className="px-8 py-4 font-semibold text-center">Montant</th>
                <th className="px-8 py-4 font-semibold text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.length > 0 ? sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5 text-[11px] text-gray-400 font-medium tracking-tighter">
                    {new Date(sale.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[13px] font-semibold text-gray-800">{sale.customer_name}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-medium"><Phone size={10}/> {sale.customer_phone}</p>
                  </td>
                  <td className="px-8 py-5 text-[11px] text-gray-500 font-light italic">
                    {sale.customer_city || "Non spécifié"}
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-[13px] text-gray-900">
                    {sale.total_amount.toLocaleString()} <span className="text-[10px] font-light text-gray-400">CFA</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#25D366] bg-green-50 px-3 py-1 rounded-full">
                      WhatsApp Order
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[11px] text-gray-400 uppercase tracking-widest font-light">
                    Aucune activité enregistrée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les lignes de stats fines
function StatLine({ label, value, unit, trend }) {
  return (
    <div className="border-l border-gray-100 pl-8 py-2 hover:border-[#0866FF] transition-colors duration-500 group">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] group-hover:text-gray-600 transition-colors">{label}</p>
        {trend && <span className="text-[9px] font-bold text-[#25D366]">{trend}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extralight text-gray-900 tracking-tighter group-hover:tracking-normal transition-all duration-700">{value}</span>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  );
}