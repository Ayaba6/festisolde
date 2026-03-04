import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import RequestBoost from './RequestBoost';
import { 
  Plus, ShoppingBag, Users, Wallet, ArrowUpRight, Zap, X, TrendingUp, 
  Image as ImageIcon, Loader2, Save, Trash2, Edit3, ShoppingCart 
} from 'lucide-react';

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, salesCount: 0, customersCount: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: storeData } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
      if (storeData) {
        setStore(storeData);
        const { data: pData } = await supabase.from('products').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
        setProducts(pData || []);
        
        const { data: oData } = await supabase.from('orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
        if (oData) {
          setOrders(oData);
          const totalRevenue = oData.reduce((acc, order) => acc + (order.total_amount || 0), 0);
          const uniqueCustomers = new Set(oData.map(o => o.customer_phone)).size;
          const recentSales = oData.filter(o => new Date(o.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
          setStats({ totalRevenue, salesCount: recentSales, customersCount: uniqueCustomers });
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased text-gray-900 space-y-12 pb-20">
      
      {/* --- MODAL AJOUT --- */}
      {isAddModalOpen && (
        <AddProductModal 
          storeId={store?.id} 
          onClose={() => setIsAddModalOpen(false)} 
          onRefresh={fetchDashboardData}
        />
      )}

      {/* --- MODAL BOOST --- */}
      {showBoostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-gray-800 rounded-[2.5rem] bg-white">
            <button onClick={() => setShowBoostModal(false)} className="absolute top-6 right-6 z-10 p-3 bg-black text-white rounded-full"><X size={20}/></button>
            <RequestBoost />
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight leading-none">
            STUDIO <span className="text-orange-600">{store?.name}</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Now</span>
             </div>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Vendeur vérifié</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowBoostModal(true)} className="flex items-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest shadow-xl shadow-orange-100 active:scale-95">
            <Zap size={16} fill="white" /> BOOSTER VISIBILITÉ
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-black text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest shadow-xl active:scale-95">
            <Plus size={16} strokeWidth={3} /> AJOUTER ARTICLE
          </button>
        </div>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Chiffre d'Affaires" value={stats.totalRevenue.toLocaleString()} unit="FCFA" icon={<Wallet size={20} />} trend="+12%" />
        <StatCard label="Ventes (7j)" value={stats.salesCount} unit="COMMANDES" icon={<ShoppingBag size={20} />} trend="Live" />
        <StatCard label="Clients" value={stats.customersCount} unit="UNIQUES" icon={<Users size={20} />} trend="Global" />
      </div>

      {/* --- CONTENU --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-1.5 h-6 bg-black rounded-full"></div>
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 italic">Dernières Transactions</h2>
          </div>
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden divide-y-2 divide-gray-50">
            {orders.length > 0 ? orders.slice(0, 5).map(o => (
              <div key={o.id} className="p-6 flex justify-between items-center group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-xs text-gray-400 group-hover:text-orange-600 transition-colors">
                      {o.customer_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-black uppercase italic tracking-tight">{o.customer_name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{o.customer_phone}</p>
                    </div>
                 </div>
                 <p className="text-sm font-black">{o.total_amount.toLocaleString()} <span className="text-[10px] text-orange-600 italic">FCFA</span></p>
              </div>
            )) : <div className="p-20 text-center text-gray-300 font-black text-[10px] uppercase">Aucune vente</div>}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-black p-8 rounded-[2.5rem] text-white shadow-2xl group cursor-pointer" onClick={() => setShowBoostModal(true)}>
             <Zap size={20} className="text-orange-600 mb-4 animate-pulse" fill="currentColor"/>
             <h3 className="text-xl font-black uppercase italic leading-none">Vendez <br/><span className="text-orange-600">3x plus vite</span></h3>
             <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">Marketing intelligent activé.</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] italic">Top Stock</h2>
            <div className="space-y-3">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border-2 border-gray-100 flex items-center gap-4 group hover:border-black transition-all">
                  <img src={p.image_url} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase truncate italic">{p.name}</p>
                    <p className="text-[10px] font-black text-orange-600">{p.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-right px-2">
                    <p className="text-sm font-black italic">{p.stock_quantity}</p>
                    <p className="text-[8px] font-black text-gray-300 uppercase">UNIT</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LE MODAL FCFA ---
function AddProductModal({ storeId, onClose, onRefresh }) {
  const [processing, setProcessing] = useState(false);
  const [productType, setProductType] = useState('simple');
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', price: '', sale_price: '', stock_quantity: '1', sizes: [], colors: []
  });

  const categories = ["Vêtements", "Chaussures", "Accessoires", "Beauté", "Électronique", "Maison", "Autre"];
  const inputStyle = "w-full border-2 border-gray-400 rounded-xl px-4 py-3 text-gray-900 focus:border-orange-500 outline-none bg-white font-medium";
  const labelStyle = "block text-sm font-black text-gray-800 mb-2 uppercase tracking-wider text-[11px]";

  const addTag = (type, value) => {
    if (!value.trim()) return;
    const key = type === 'size' ? 'sizes' : 'colors';
    const val = type === 'size' ? value.toUpperCase() : value;
    if (!formData[key].includes(val)) setFormData({ ...formData, [key]: [...formData[key], val] });
    type === 'size' ? setNewSize('') : setNewColor('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    setPreviews([...previews, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let finalImages = [];
      for (const file of imageFiles) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        await supabase.storage.from('product-images').upload(path, file);
        const { data: url } = supabase.storage.from('product-images').getPublicUrl(path);
        finalImages.push(url.publicUrl);
      }

      await supabase.from('products').insert([{
        store_id: storeId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: finalImages[0] || "",
        images: finalImages,
        sizes: formData.sizes,
        colors: formData.colors,
        product_type: productType,
        sold_count: 0
      }]);
      onRefresh();
      onClose();
    } catch (err) { console.error(err); } finally { setProcessing(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-2 border-gray-300">
        <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-900 uppercase italic">Nouveau <span className="text-orange-600">Produit</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="flex gap-4 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
            <button type="button" onClick={() => setProductType('simple')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${productType === 'simple' ? 'bg-white shadow-md text-orange-600' : 'text-gray-500'}`}>ARTICLE SIMPLE</button>
            <button type="button" onClick={() => setProductType('pack')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${productType === 'pack' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500'}`}>PACK PROMO</button>
          </div>

          <div className="space-y-5">
            <input required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="NOM DE L'ARTICLE *" />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" required className={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="PRIX (FCFA) *" />
              <input type="number" className={`${inputStyle} bg-orange-50/50`} value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} placeholder="PRIX PROMO (FCFA)" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select required className={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">CATÉGORIE</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" required className={inputStyle} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} placeholder="STOCK" />
            </div>
            
            {/* Reste du formulaire (Images, Tailles, Couleurs)... */}
            <div>
              <label className={labelStyle}>Photos du produit</label>
              <div className="grid grid-cols-5 gap-3 mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} className="w-full aspect-square object-cover rounded-xl border-2 border-gray-900 shadow-sm" />
                    <button type="button" onClick={() => { setPreviews(p => p.filter((_, idx) => idx !== i)); setImageFiles(f => f.filter((_, idx) => idx !== i)); }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1"><X size={10}/></button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <button type="button" onClick={() => document.getElementById('file-up-dash').click()} className="aspect-square border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-all">
                    <ImageIcon size={24} />
                  </button>
                )}
              </div>
              <input id="file-up-dash" type="file" hidden multiple onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelStyle}>Tailles (XL, 42...)</label>
                <div className="flex gap-2">
                  <input className={inputStyle} placeholder="Add" value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('size', newSize))} />
                  <button type="button" onClick={() => addTag('size', newSize)} className="bg-black text-white px-4 rounded-xl font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sizes.map(s => <span key={s} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-2">{s} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, sizes: formData.sizes.filter(x => x !== s)})}/></span>)}
                </div>
              </div>
              <div>
                <label className={labelStyle}>Couleurs (Bleu, Noir...)</label>
                <div className="flex gap-2">
                  <input className={inputStyle} placeholder="Add" value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('color', newColor))} />
                  <button type="button" onClick={() => addTag('color', newColor)} className="bg-black text-white px-4 rounded-xl font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.colors.map(c => <span key={c} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-2 border border-gray-200">{c} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, colors: formData.colors.filter(x => x !== c)})}/></span>)}
                </div>
              </div>
            </div>
          </div>

          <button disabled={processing} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4">
            {processing ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {processing ? "ENREGISTREMENT..." : "PUBLIER L'ARTICLE"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, trend }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-xl hover:border-black transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all text-gray-900">{icon}</div>
        <div className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-lg uppercase tracking-widest italic">{trend}</div>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">{value}</span>
        <span className="text-[10px] font-black text-orange-600 uppercase italic">{unit}</span>
      </div>
    </div>
  );
}