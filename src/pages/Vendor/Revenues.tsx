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
  Phone,
  Loader2,
  ArrowDown
} from 'lucide-react';

export default function Revenues() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0, average: 0 });
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
          const averageOrder = salesData.length > 0 ? total / salesData.length : 0;
          setStats({ total, count: salesData.length, customers: uniqueCustomers, average: averageOrder });
        }
      }
    }
    setLoading(false);
  }

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
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased text-gray-900">
      
      {/* HEADER - Identique au Stock */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">
          Mon <span className="text-orange-600">Trésor</span>
        </h1>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-black text-xs tracking-widest flex items-center gap-2 shadow-lg transition-transform active:scale-95">
          <Download size={18} strokeWidth={3} /> EXPORTER (CSV)
        </button>
      </div>

      {/* STATS CARDS - Bordures et style ajustés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          label="Chiffre d'affaires" 
          value={(stats.total || 0).toLocaleString()} 
          unit="CFA" 
          icon={<Wallet className="text-orange-600" size={20} strokeWidth={3}/>}
        />
        <StatCard 
          label="Transactions" 
          value={stats.count} 
          unit="Ventes" 
          icon={<TrendingUp className="text-orange-600" size={20} strokeWidth={3}/>}
        />
        <StatCard 
          label="Panier Moyen" 
          value={Math.round(stats.average).toLocaleString()} 
          unit="CFA" 
          icon={<ArrowUpRight className="text-orange-600" size={20} strokeWidth={3}/>}
        />
        <StatCard 
          label="Clients" 
          value={stats.customers} 
          unit="Unique" 
          icon={<Users className="text-orange-600" size={20} strokeWidth={3}/>}
        />
      </div>

      {/* RECHERCHE - Même style que tes inputs de modal */}
      <div className="mb-6 relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600" size={16} />
        <input 
          type="text" 
          placeholder="RECHERCHER UN CLIENT OU TÉLÉPHONE..." 
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl text-[11px] font-black outline-none focus:border-orange-500 bg-white shadow-sm transition-all tracking-widest uppercase"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLEAU - Même style que Gestion Stock */}
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b-2 border-gray-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Montant</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Canal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSales.length > 0 ? filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3 text-gray-500 font-bold text-xs">
                    <Calendar size={14} />
                    {new Date(sale.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-black uppercase text-gray-900 leading-none">{sale.customer_name || "Client Anonyme"}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-orange-600/70">
                    <Phone size={10} strokeWidth={3} />
                    <span className="text-[10px] font-black">{sale.customer_phone}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-sm font-black text-gray-900">{sale.total_amount?.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-gray-400 ml-1">CFA</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-block px-3 py-1 bg-[#25D366]/10 text-[#25D366] text-[9px] font-black rounded-lg uppercase tracking-tighter">
                    WhatsApp
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                   <ArrowDown className="mx-auto text-gray-200 mb-4 animate-bounce" size={32} />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aucune transaction</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant Card ajusté pour matcher le style "Stock"
function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-xl hover:border-orange-500 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-gray-900 italic uppercase">{value}</span>
          <span className="text-[9px] font-black text-gray-300 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );
}