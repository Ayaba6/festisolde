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
  Phone,
  Loader2,
  Filter,
  ArrowDown
} from 'lucide-react';

export default function Revenues() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSalesData();
  }, []);

  async function fetchSalesData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();

      if (store) {
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

  // Filtrage pour la recherche
  const filteredSales = sales.filter(sale => 
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Analyse financière...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 antialiased text-gray-900">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">
            MON <span className="text-orange-600 italic-none">TRÉSOR</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1">
            Performances & flux financiers
          </p>
        </div>
        
        <button className="flex items-center gap-3 bg-white border-2 border-gray-900 px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest hover:bg-black hover:text-white transition-all shadow-xl shadow-gray-100">
          <Download size={16} strokeWidth={3} /> EXPORTER (CSV)
        </button>
      </header>

      {/* --- STATS CARTES HARMONISÉES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <StatLine 
          label="Chiffre d'affaires" 
          value={(stats.total || 0).toLocaleString()} 
          unit="CFA" 
          trend="+12.5%" 
          icon={<Wallet className="text-orange-600" size={18}/>}
        />
        <StatLine 
          label="Transactions" 
          value={stats.count} 
          unit="Orders" 
          trend="Live" 
          icon={<TrendingUp className="text-orange-600" size={18}/>}
        />
        <StatLine 
          label="Clientèle" 
          value={stats.customers} 
          unit="Unique" 
          icon={<Users className="text-orange-600" size={18}/>}
        />
      </div>

      {/* --- SECTION TABLEAU --- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
             <h2 className="text-sm font-black uppercase tracking-widest">Journal des Ventes</h2>
          </div>
          
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600" size={16} />
            <input 
              type="text" 
              placeholder="NOM OU TÉLÉPHONE..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:border-orange-500 transition-all tracking-widest"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                  <th className="px-8 py-6">Date de transaction</th>
                  <th className="px-8 py-6">Profil Client</th>
                  <th className="px-8 py-6 text-center">Montant Collecté</th>
                  <th className="px-8 py-6 text-right">Canal de Vente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSales.length > 0 ? filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-gray-300" />
                        <span className="text-xs font-bold text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900 uppercase italic leading-none">{sale.customer_name || "Client Anonyme"}</p>
                      <div className="flex items-center gap-2 mt-2 text-orange-600/70">
                        <Phone size={10} strokeWidth={3} />
                        <span className="text-[10px] font-black tracking-tighter">{sale.customer_phone}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                         Lieu: {sale.customer_city || "Non spécifié"}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-block">
                        <span className="text-base font-black text-gray-900 tracking-tighter">
                          {(sale.total_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 ml-1">CFA</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#25D366] bg-green-50 border border-green-100 px-4 py-2 rounded-xl">
                        <div className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse"></div>
                        WhatsApp
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                       <ArrowDown className="mx-auto text-gray-200 mb-4 animate-bounce" size={32} />
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Aucun revenu enregistré</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sous-composant StatLine optimisé
function StatLine({ label, value, unit, trend, icon }) {
  return (
    <div className="relative overflow-hidden bg-white p-8 rounded-[2rem] border-2 border-gray-50 hover:border-orange-500 transition-all duration-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className="text-[9px] font-black text-[#25D366] bg-green-50 px-3 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{value}</span>
          <span className="text-[10px] font-black text-gray-300 uppercase italic">{unit}</span>
        </div>
      </div>
    </div>
  );
}