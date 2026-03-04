import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Wallet, TrendingUp, Users, Download, Search, Calendar, 
  ArrowUpRight, Phone, Loader2, ArrowDown, Package, CheckCircle2,
  RefreshCcw, Clock, Truck, XCircle, FileText, X, Printer, MapPin,
  FileSpreadsheet, FileDown 
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';

export default function Revenues() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Modals States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // States pour l'export et l'aperçu
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    let filtered = [...sales];
    if (dateStart) {
      filtered = filtered.filter(s => new Date(s.created_at) >= new Date(dateStart));
    }
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(s => new Date(s.created_at) <= end);
    }
    setPreviewData(filtered);
  }, [dateStart, dateEnd, sales]);

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
          updateStats(salesData);
        }
      }
    }
    setLoading(false);
  }

  const updateStats = (data) => {
    const validSales = data.filter(s => s.status !== 'annulé');
    const total = validSales.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const uniqueCustomers = new Set(validSales.map(s => s.customer_phone)).size;
    const averageOrder = validSales.length > 0 ? total / validSales.length : 0;
    setStats({ total, count: validSales.length, customers: uniqueCustomers, average: averageOrder });
  };

  const exportCSV = () => {
    const data = previewData;
    const headers = ["Date", "Client", "Telephone", "Total (CFA)", "Statut"];
    const rows = data.map(s => [
      new Date(s.created_at).toLocaleDateString('fr-FR'),
      s.customer_name,
      s.customer_phone,
      s.total_amount,
      s.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export-ventes.csv`;
    link.click();
    setShowExportModal(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      const updatedSales = sales.map(sale => sale.id === orderId ? { ...sale, status: newStatus } : sale);
      setSales(updatedSales);
      updateStats(updatedSales);
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_phone?.includes(searchTerm)
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'livré': return 'bg-green-50 text-green-600 border-green-100';
      case 'annulé': return 'bg-red-50 text-red-600 border-red-100';
      case 'en cours': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  const statsPreview = {
    total: previewData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0),
    count: previewData.length
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased text-gray-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Mon <span className="text-orange-600">Trésor</span></h1>
        <button 
          onClick={() => setShowExportModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-lg"
        >
          <Download size={16} /> Exporter
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12">
        <StatCard label="CA Global" value={stats.total.toLocaleString()} unit="CFA" icon={<Wallet size={18}/>} color="bg-orange-500" />
        <StatCard label="Ventes" value={stats.count} unit="Cmds" icon={<TrendingUp size={18}/>} color="bg-green-500" />
        <StatCard label="Panier" value={Math.round(stats.average).toLocaleString()} unit="CFA" icon={<ArrowUpRight size={18}/>} color="bg-blue-500" />
        <StatCard label="Clients" value={stats.customers} unit="Unique" icon={<Users size={18}/>} color="bg-purple-500" />
      </div>

      {/* SEARCH */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input 
          type="text" 
          placeholder="RECHERCHER UN CLIENT..." 
          className="w-full pl-14 pr-6 py-5 border-2 border-gray-100 rounded-2xl text-[11px] font-black outline-none focus:border-orange-500 transition-all uppercase"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTE MOBILE (Visible uniquement sur mobile) */}
      <div className="md:hidden space-y-4 mb-20">
        {filteredSales.map((sale) => (
          <div key={sale.id} className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                </p>
                <h3 className="text-sm font-black uppercase mt-1">{sale.customer_name}</h3>
                <p className="text-[10px] font-bold text-orange-600 italic">{sale.customer_phone}</p>
              </div>
              <button onClick={() => setSelectedOrder(sale)} className="p-3 bg-gray-50 rounded-xl text-gray-400">
                <FileText size={18} />
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <p className="text-lg font-black italic">
                {sale.total_amount?.toLocaleString()} <span className="text-[10px] not-italic text-gray-300">CFA</span>
              </p>
              <select 
                value={sale.status || 'nouveau'}
                onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                className={`px-3 py-2 rounded-lg border-2 text-[9px] font-black uppercase outline-none ${getStatusStyle(sale.status)}`}
              >
                <option value="nouveau">Nouveau</option>
                <option value="en cours">En cours</option>
                <option value="livré">Livré</option>
                <option value="annulé">Annulé</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* TABLEAU PC (Caché sur mobile) */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b-2 border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="group hover:bg-orange-50/30 transition-all">
                <td className="px-8 py-6 font-black text-[10px] italic">
                  {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                  <p className="text-[9px] text-gray-300 not-italic uppercase font-bold">#{sale.id.slice(0,5)}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-black uppercase">{sale.customer_name}</p>
                  <p className="text-[10px] font-bold text-orange-600 italic">{sale.customer_phone}</p>
                </td>
                <td className="px-8 py-6 font-black text-sm italic">
                  {sale.total_amount?.toLocaleString()} <span className="text-[9px] not-italic text-gray-300">CFA</span>
                </td>
                <td className="px-8 py-6">
                  <select 
                    value={sale.status || 'nouveau'}
                    onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                    className={`px-4 py-2 rounded-xl border-2 text-[9px] font-black uppercase outline-none ${getStatusStyle(sale.status)}`}
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="en cours">En cours</option>
                    <option value="livré">Livré ✅</option>
                    <option value="annulé">Annulé ❌</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <button onClick={() => setSelectedOrder(sale)} className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-all">
                    <FileText size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL EXPORT AVEC FILTRES --- */}
      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 md:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Générer un <span className="text-orange-600">Rapport</span></h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Sélectionnez vos dates pour l'aperçu</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-white rounded-full shadow-sm text-gray-400 hover:text-black transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-y-auto max-h-[80vh] md:max-h-none">
              {/* SÉLECTION */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Calendar size={12} /> Période personnalisée
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:block md:space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase ml-2">Du</span>
                      <input 
                        type="date" 
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="w-full p-3 md:p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl text-[10px] md:text-xs font-black outline-none transition-all uppercase"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase ml-2">Au</span>
                      <input 
                        type="date" 
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="w-full p-3 md:p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl text-[10px] md:text-xs font-black outline-none transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 md:pt-4 space-y-3">
                   <button onClick={exportCSV} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all bg-white">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet size={18} className="text-green-600" />
                      <span className="text-[10px] font-black uppercase">Exporter CSV</span>
                    </div>
                    <ArrowDown size={14} className="text-gray-300" />
                  </button>

                  <button onClick={() => window.print()} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 transition-all bg-white">
                    <div className="flex items-center gap-3">
                      <FileDown size={18} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase">Rapport PDF</span>
                    </div>
                    <ArrowDown size={14} className="text-gray-300" />
                  </button>
                </div>
              </div>

              {/* APERÇU */}
              <div className="p-6 md:p-8 bg-gray-50/50">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4 md:mb-6">Aperçu du contenu</label>
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-white p-4 md:p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Chiffre d'affaires</p>
                    <p className="text-xl md:text-2xl font-black italic text-orange-600">
                      {statsPreview.total.toLocaleString()} <span className="text-[10px] not-italic text-gray-300">CFA</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[150px] md:max-h-none pr-1">
                    {previewData.length > 0 ? (
                      previewData.slice(0, 4).map((s, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100">
                          <p className="text-[8px] font-black uppercase truncate">{s.customer_name}</p>
                          <p className="text-[10px] font-black mt-1 text-gray-900">{s.total_amount?.toLocaleString()} F</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 border-2 border-dashed border-gray-200 rounded-2xl">
                        <p className="text-[9px] font-black text-gray-300 uppercase">Aucune donnée</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <ModalFacture order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 shadow-sm group hover:-translate-y-1 transition-all">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${color} text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-lg`}>
        {icon}
      </div>
      <p className="text-[8px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg md:text-xl font-black text-gray-900 italic uppercase tracking-tighter">{value}</span>
        <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">{unit}</span>
      </div>
    </div>
  );
}

function ModalFacture({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-full ml-8">Aperçu du reçu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 md:p-8 bg-white" id="invoice-content">
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-orange-600 leading-none">FACTURE</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">#{order.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-gray-900 italic">
                {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="mb-6 p-4 md:p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 text-left">Client</p>
            <p className="text-xs font-black uppercase text-left">{order.customer_name}</p>
            <p className="text-[10px] font-bold text-gray-500 mt-1 text-left">{order.customer_phone}</p>
          </div>
          <div className="space-y-3 mb-6 md:mb-8">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest border-b pb-2 text-left">Articles</p>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase">
                <span className="text-gray-600 truncate mr-2">{item.name} <span className="text-orange-600 italic">x{item.quantity}</span></span>
                <span className="whitespace-nowrap">{(item.sale_price * item.quantity).toLocaleString()} F</span>
              </div>
            ))}
          </div>
          <div className="pt-4 md:pt-6 border-t-2 border-gray-100 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest">Total</span>
            <span className="text-xl md:text-2xl font-black italic text-gray-900">{order.total_amount?.toLocaleString()} <span className="text-xs not-italic">CFA</span></span>
          </div>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 flex gap-3">
          <PDFDownloadLink 
            document={<InvoicePDF order={order} />} 
            fileName={`facture-${order.customer_name}.pdf`}
            className="flex-1"
          >
            {({ loading }) => (
              <button disabled={loading} className="w-full py-4 bg-white border-2 border-black rounded-2xl text-[9px] md:text-[10px] font-black uppercase flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Printer size={14} />}
                {loading ? '...' : 'PDF'}
              </button>
            )}
          </PDFDownloadLink>
          <button onClick={onClose} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase">Fermer</button>
        </div>
      </div>
    </div>
  );
}