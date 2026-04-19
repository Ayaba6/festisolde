import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, TrendingUp, Users, Download, Search, 
  ArrowUpRight, Loader2, Clock, CheckCircle2,
  FileText, X, Printer, FileSpreadsheet, Info, ChevronLeft
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';

export default function Revenues() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // CALCULS COMMISSION
  const requestedAmount = parseFloat(withdrawAmount) || 0;
  const commission = requestedAmount * 0.10;
  const netAmount = requestedAmount - commission;

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    let filtered = [...sales];
    if (dateStart) filtered = filtered.filter(s => new Date(s.created_at) >= new Date(dateStart));
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
      const { data: store } = await supabase.from('stores').select('id, balance').eq('owner_id', user.id).single();
      if (store) {
        setBalance(store.balance || 0);
        setStoreId(store.id);
        const { data: salesData } = await supabase.from('orders').select('*').eq('store_id', store.id).order('created_at', { ascending: false });
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      fetchSalesData(); 
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 500) return alert("Minimum 500 FCFA.");
    if (amount > balance) return alert("Solde insuffisant.");
    if (!paymentPhone) return alert("Numéro requis.");

    setIsWithdrawing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('withdrawal_requests').insert([{ vendor_id: user.id, store_id: storeId, amount, payment_method: paymentMethod, payment_details: paymentPhone, status: 'en_cours' }]);
      await supabase.rpc('deduct_balance', { vendor_id: user.id, amount_to_deduct: amount });
      setShowWithdrawModal(false);
      fetchSalesData();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || sale.customer_phone?.includes(searchTerm)
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'livré': return 'bg-green-50 text-green-600 border-green-100';
      case 'annulé': return 'bg-red-50 text-red-600 border-red-100';
      case 'en cours': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFDFD]">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-32">
      
      {/* HEADER & NAV */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trésorerie</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Suivi des revenus et retraits</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/withdrawal-history')} className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50">
            <Clock size={14} /> Historique
          </button>
          <button onClick={() => setShowExportModal(true)} className="flex-1 md:flex-none px-4 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <Download size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* PORTEFEUILLE STYLE STUDIO */}
      <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Solde disponible</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              {balance.toLocaleString()} <span className="text-sm font-medium text-slate-500 ml-1">FCFA</span>
            </h2>
          </div>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="w-full md:w-auto bg-orange-500 hover:bg-white hover:text-slate-950 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-orange-950/20"
          >
            <Wallet size={18} /> Effectuer un retrait
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CA Global" value={stats.total.toLocaleString()} unit="FCFA" icon={<TrendingUp size={16}/>} />
        <StatCard label="Ventes" value={stats.count} unit="CMD" icon={<CheckCircle2 size={16}/>} />
        <StatCard label="Panier Moyen" value={Math.round(stats.average).toLocaleString()} unit="FCFA" icon={<ArrowUpRight size={16}/>} />
        <StatCard label="Clients" value={stats.customers} unit="PERS" icon={<Users size={16}/>} />
      </div>

      {/* LISTE DES TRANSACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Ventes récentes</h3>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:border-orange-500 w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLEAU DESKTOP */}
        <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Commande</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Client</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Montant</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Statut</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/30 transition-all">
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-900">{new Date(sale.created_at).toLocaleDateString('fr-FR')}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">#{sale.id.slice(0,8)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-900 uppercase">{sale.customer_name}</p>
                    <p className="text-[10px] text-orange-500 font-bold italic">{sale.customer_phone}</p>
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-slate-900">
                    {sale.total_amount?.toLocaleString()} <span className="text-[9px] text-slate-400">F</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <select 
                      value={sale.status || 'nouveau'}
                      onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase outline-none ${getStatusStyle(sale.status)}`}
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="en cours">En cours</option>
                      <option value="livré">Livré ✅</option>
                      <option value="annulé">Annulé ❌</option>
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setSelectedOrder(sale)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase italic mb-1">{new Date(sale.created_at).toLocaleDateString('fr-FR')}</p>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">{sale.customer_name}</h3>
                  <p className="text-[10px] font-bold text-orange-500 italic">{sale.customer_phone}</p>
                </div>
                <p className="text-lg font-bold text-slate-900 tracking-tight">{sale.total_amount?.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">F</span></p>
              </div>
              <div className="flex gap-2">
                <select 
                  value={sale.status || 'nouveau'}
                  onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase outline-none ${getStatusStyle(sale.status)}`}
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en cours">En cours</option>
                  <option value="livré">Livré ✅</option>
                  <option value="annulé">Annulé ❌</option>
                </select>
                <button onClick={() => setSelectedOrder(sale)} className="p-3 bg-slate-900 text-white rounded-xl"><FileText size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL RETRAIT */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20} /></button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Demander un retrait</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Montant disponible</p>
                <p className="text-3xl font-bold text-slate-900">{balance.toLocaleString()} FCFA</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-blue-800 leading-tight">
                  Frais de service : <span className="font-bold">10%</span> déduits à la validation.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Montant à retirer</label>
                <input type="number" className="w-full p-4 bg-slate-50 border border-transparent focus:border-orange-500 rounded-xl text-sm font-bold outline-none" placeholder="Ex: 5000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                {requestedAmount > 0 && (
                  <p className="text-[10px] font-bold text-green-600 mt-2 px-1">NET À RECEVOIR : {netAmount.toLocaleString()} FCFA</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Méthode</label>
                  <select className="w-full p-4 bg-slate-50 border border-transparent rounded-xl text-[10px] font-bold uppercase outline-none" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option>Orange Money</option>
                    <option>Moov Money</option>
                    <option>Wave</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Numéro</label>
                  <input type="tel" className="w-full p-4 bg-slate-50 border border-transparent focus:border-orange-500 rounded-xl text-sm font-bold outline-none" placeholder="01020304" value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)} />
                </div>
              </div>

              <button 
                disabled={isWithdrawing || !withdrawAmount || requestedAmount < 500}
                onClick={handleWithdrawRequest}
                className="w-full py-4 bg-slate-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 transition-all disabled:bg-slate-200"
              >
                {isWithdrawing ? "Envoi..." : "Confirmer le retrait"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowExportModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20} /></button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Exporter mes ventes</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Début</label>
                  <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Fin</label>
                  <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none" />
                </div>
              </div>
              <button onClick={() => {}} className="w-full flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
                <FileSpreadsheet size={18} className="text-green-600" />
                <span className="text-[10px] font-bold uppercase">Télécharger le CSV</span>
              </button>
              <div className="pt-4 border-t border-slate-50 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">CA sur la période</p>
                <p className="text-2xl font-bold text-orange-500 tracking-tight">{previewData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toLocaleString()} F</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && <ModalFacture order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group hover:-translate-y-1 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
          {icon}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-xl font-bold text-slate-900 tracking-tight">
        {value} <span className="text-[9px] font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

function ModalFacture({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Facture Client</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-orange-500 tracking-tighter">FACTURE</h3>
              <p className="text-[10px] font-medium text-slate-400 uppercase">ID: {order.id.slice(0, 12)}</p>
            </div>
            <p className="text-xs font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Client</p>
            <p className="text-sm font-bold uppercase text-slate-900">{order.customer_name}</p>
            <p className="text-xs font-bold text-slate-400 italic">{order.customer_phone}</p>
          </div>

          <div className="space-y-4">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Détails articles</p>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">{item.name} <span className="text-orange-500 font-bold ml-1">x{item.quantity}</span></span>
                <span className="font-bold text-slate-900">{(item.sale_price * item.quantity).toLocaleString()} F</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total payé</span>
            <span className="text-3xl font-bold text-slate-900 tracking-tighter">{order.total_amount?.toLocaleString()} <span className="text-sm font-medium text-slate-400 ml-1">FCFA</span></span>
          </div>
        </div>
        <div className="p-6 bg-slate-50 grid grid-cols-2 gap-3">
          <PDFDownloadLink document={<InvoicePDF order={order} />} fileName={`facture-${order.customer_name}.pdf`} className="w-full">
            {({ loading }) => (
              <button disabled={loading} className="w-full py-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Printer size={14} />} PDF
              </button>
            )}
          </PDFDownloadLink>
          <button onClick={onClose} className="w-full py-4 bg-slate-950 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-orange-500 transition-all">Fermer</button>
        </div>
      </div>
    </div>
  );
}