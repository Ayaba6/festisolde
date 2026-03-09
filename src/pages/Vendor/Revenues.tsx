import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, TrendingUp, Users, Download, Search, Calendar, 
  ArrowUpRight, Phone, Loader2, ArrowDown, Package, CheckCircle2,
  RefreshCcw, Clock, Truck, XCircle, FileText, X, Printer, MapPin,
  FileSpreadsheet, FileDown 
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';

export default function Revenues() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  const [balance, setBalance] = useState(0);
  const [storeId, setStoreId] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Orange Money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
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
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: store } = await supabase
        .from('stores')
        .select('id, balance')
        .eq('owner_id', user.id)
        .single();

      if (store) {
        setBalance(store.balance || 0);
        setStoreId(store.id);

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

  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 500) {
      alert("⚠️ Le montant minimum de retrait est de 500 CFA.");
      return;
    }
    if (amount > balance) {
      alert("⚠️ Solde insuffisant.");
      return;
    }
    if (!paymentPhone) {
      alert("⚠️ Veuillez saisir le numéro de réception.");
      return;
    }

    setIsWithdrawing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: requestError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          vendor_id: user.id,
          store_id: storeId,
          amount: amount,
          payment_method: paymentMethod,
          payment_details: paymentPhone,
          status: 'en_cours'
        }]);

      if (requestError) throw requestError;

      const { error: rpcError } = await supabase.rpc('deduct_balance', {
        vendor_id: user.id,
        amount_to_deduct: amount
      });

      if (rpcError) throw rpcError;

      alert("✅ Demande envoyée !");
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setPaymentPhone('');
      fetchSalesData();
      
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      fetchSalesData(); 
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ["Date", "Client", "Telephone", "Total (CFA)", "Statut"];
    const rows = previewData.map(s => [
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
    link.download = `rapport-ventes.csv`;
    link.click();
    setShowExportModal(false);
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased text-gray-900 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Mon <span className="text-orange-600">Trésor</span></h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/withdrawal-history')} 
            className="flex-1 md:flex-none bg-white border-2 border-black text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <Clock size={16} /> Historique
          </button>

          <button 
            onClick={() => setShowExportModal(true)} 
            className="flex-1 md:flex-none bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-lg"
          >
            <Download size={16} /> Exporter
          </button>
        </div>
      </div>

      {/* SECTION PORTEFEUILLE */}
      <div className="mb-12 bg-black rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-orange-600/20 transition-all"></div>
        <div className="relative z-10 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Solde Retirable</p>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">
            {balance.toLocaleString()} <span className="text-sm not-italic text-orange-600 uppercase ml-1">CFA</span>
          </h2>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="relative z-10 w-full md:w-auto bg-orange-600 hover:bg-white hover:text-black text-white px-10 py-5 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Wallet size={18} /> Retirer mes fonds
        </button>
      </div>

      {/* STATS - ALIGNEMENT ICONE/TITRE MODIFIÉ ICI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12">
        <StatCard label="CA Global" value={stats.total.toLocaleString()} unit="CFA" icon={<Wallet size={18}/>} color="bg-orange-500" />
        <StatCard label="Ventes" value={stats.count} unit="Cmds" icon={<TrendingUp size={18}/>} color="bg-green-500" />
        <StatCard label="Panier" value={Math.round(stats.average).toLocaleString()} unit="CFA" icon={<ArrowUpRight size={18}/>} color="bg-blue-500" />
        <StatCard label="Clients" value={stats.customers} unit="Unique" icon={<Users size={18}/>} color="bg-purple-500" />
      </div>

      {/* RECHERCHE */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input 
          type="text" 
          placeholder="RECHERCHER UN CLIENT..." 
          className="w-full pl-14 pr-6 py-5 border-2 border-gray-100 rounded-2xl text-[11px] font-black outline-none focus:border-orange-500 transition-all uppercase shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- VUE LISTE (MOBILE CARDS) --- */}
      <div className="md:hidden space-y-4">
        {filteredSales.map((sale) => (
          <div key={sale.id} className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase italic">
                  {new Date(sale.created_at).toLocaleDateString('fr-FR')} 
                  <span className="ml-2 not-italic">#{sale.id.slice(0, 5)}</span>
                </p>
                <h3 className="text-sm font-black uppercase mt-1">{sale.customer_name}</h3>
                <p className="text-[10px] font-bold text-orange-600 italic">{sale.customer_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black italic tracking-tighter">
                  {sale.total_amount?.toLocaleString()} 
                  <span className="text-[9px] not-italic text-gray-400 ml-1 uppercase">CFA</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <select 
                  value={sale.status || 'nouveau'}
                  onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase outline-none ${getStatusStyle(sale.status)}`}
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en cours">En cours</option>
                  <option value="livré">Livré ✅</option>
                  <option value="annulé">Annulé ❌</option>
                </select>
              </div>
              <button 
                onClick={() => setSelectedOrder(sale)} 
                className="p-3 bg-black text-white rounded-xl hover:bg-orange-600 transition-all"
              >
                <FileText size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- VUE TABLEAU (DESKTOP) --- */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
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

      {/* MODALS */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95 shadow-2xl relative">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-gray-300 hover:text-black transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6">Demander un <span className="text-orange-600">Retrait</span></h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-5 rounded-[1.8rem] border border-gray-100 mb-2 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Montant Disponible</p>
                <p className="text-3xl font-black italic text-gray-900">{balance.toLocaleString()} CFA</p>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Combien retirer ?</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl text-sm font-black outline-none transition-all shadow-inner"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Mode de paiement</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl text-sm font-black outline-none transition-all uppercase"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Orange Money</option>
                  <option>Moov Money</option>
                  <option>CASH (Sur place)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Numéro de réception</label>
                <input 
                  type="tel" 
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl text-sm font-black outline-none transition-all shadow-inner"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button 
                  disabled={isWithdrawing}
                  onClick={handleWithdrawRequest}
                  className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 transition-all disabled:bg-gray-200 flex items-center justify-center gap-2"
                >
                  {isWithdrawing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isWithdrawing ? "Envoi en cours..." : "Confirmer le retrait"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Générer un <span className="text-orange-600">Rapport</span></h2>
              <button onClick={() => setShowExportModal(false)} className="p-2 text-gray-400 hover:text-black"><X size={20} /></button>
            </div>
            <div className="grid md:grid-cols-2 divide-x divide-gray-100">
               <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Période</label>
                    <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full p-3 bg-gray-50 rounded-2xl text-[10px] font-black" />
                    <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full p-3 bg-gray-50 rounded-2xl text-[10px] font-black" />
                  </div>
                  <button onClick={exportCSV} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet size={18} className="text-green-600" />
                      <span className="text-[10px] font-black uppercase">Exporter CSV</span>
                    </div>
                  </button>
               </div>
               <div className="p-8 bg-gray-50/50 flex flex-col justify-center items-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">CA Période</p>
                  <p className="text-3xl font-black italic text-orange-600">{previewData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toLocaleString()} F</p>
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

// COMPOSANT STATCARD MIS À JOUR (ALIGNE TITRE ET ICONE)
function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm group hover:-translate-y-1 transition-all">
      {/* Conteneur Flex pour aligner icône et titre */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 md:w-10 md:h-10 ${color} text-white rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
          {icon}
        </div>
        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          {label}
        </p>
      </div>
      
      {/* Valeur numérique en dessous */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg md:text-xl font-black text-gray-900 italic uppercase tracking-tighter">
          {value}
        </span>
        <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">
          {unit}
        </span>
      </div>
    </div>
  );
}

function ModalFacture({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/30">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-full ml-8 italic">Reçu de vente</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 bg-white overflow-y-auto max-h-[60vh]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-orange-600 leading-none">FACTURE</h3>
              <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">ID: {order.id.slice(0, 8)}</p>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-900 italic">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="mb-6 p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Détails Client</p>
            <p className="text-xs font-black uppercase">{order.customer_name}</p>
            <p className="text-[10px] font-bold text-gray-500 mt-1 italic">{order.customer_phone}</p>
          </div>
          <div className="space-y-3 mb-8">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest border-b pb-2">Articles commandés</p>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase">
                <span className="text-gray-600 truncate mr-2">{item.name} <span className="text-orange-600 italic">x{item.quantity}</span></span>
                <span className="whitespace-nowrap">{(item.sale_price * item.quantity).toLocaleString()} F</span>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t-2 border-gray-100 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest">Total Payé</span>
            <span className="text-2xl font-black italic text-gray-900">{order.total_amount?.toLocaleString()} <span className="text-xs not-italic text-gray-400 ml-1">CFA</span></span>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col xs:flex-row gap-3">
          <PDFDownloadLink document={<InvoicePDF order={order} />} fileName={`facture-${order.customer_name}.pdf`} className="flex-1">
            {({ loading }) => (
              <button disabled={loading} className="w-full py-4 bg-white border-2 border-black rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Printer size={14} />} EXPORTER PDF
              </button>
            )}
          </PDFDownloadLink>
          <button onClick={onClose} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-orange-600/20">Fermer</button>
        </div>
      </div>
    </div>
  );
}