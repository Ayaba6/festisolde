import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Search, Filter, MoreVertical, Trash2, 
  X, ImageIcon, Save, Loader2, FileText, ExternalLink 
} from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('Tout');

  // État du formulaire
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock_quantity: '1',
    image_file: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();
      if (store) {
        const { data } = await supabase.from('products').select('*').eq('store_id', store.id).order('created_at', { ascending: false });
        setProducts(data || []);
      }
    }
    setLoading(false);
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image_file: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user?.id).single();

      let image_url = "";
      if (formData.image_file && user) {
        const filePath = `${user.id}/${Math.random()}.${formData.image_file.name.split('.').pop()}`;
        await supabase.storage.from('product-images').upload(filePath, formData.image_file);
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        image_url = urlData.publicUrl;
      }

      const { error } = await supabase.from('products').insert([{
        store_id: store.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: parseFloat(formData.sale_price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url
      }]);

      if (!error) {
        setIsModalOpen(false);
        fetchProducts();
        setPreviewUrl(null);
        setFormData({ name: '', description: '', price: '', sale_price: '', stock_quantity: '1', image_file: null });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gray-400 font-light">Accès à l'inventaire...</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 antialiased">
      
      {/* --- HEADER ÉPURÉ --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[#0866FF] uppercase tracking-[0.4em] ml-1">Catalogue</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Gestion des <span className="text-gray-300">Produits</span></h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full text-[11px] font-bold tracking-widest hover:bg-[#0866FF] transition-all duration-500 shadow-xl shadow-gray-200"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" /> AJOUTER UNE RÉFÉRENCE
        </button>
      </header>

      {/* --- BARRE DE RECHERCHE & FILTRES (DÉZOOMÉS) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
        <div className="flex gap-8">
          {['Tout', 'Publié', 'Brouillon'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-2 ${
                filter === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {filter === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0866FF]" />}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0866FF] transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="RECHERCHER..." 
            className="pl-10 pr-4 py-2 bg-transparent border-b border-gray-100 text-[11px] focus:border-[#0866FF] outline-none w-64 transition-all tracking-widest" 
          />
        </div>
      </div>

      {/* --- TABLEAU INVENTAIRE (STYLE PRO) --- */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[9px] uppercase font-bold tracking-[0.2em]">
            <tr>
              <th className="px-8 py-4">Article</th>
              <th className="px-8 py-4 text-center border-x border-gray-50/50">Prix de vente</th>
              <th className="px-8 py-4 text-center">Disponibilité</th>
              <th className="px-8 py-4 text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-sm overflow-hidden bg-gray-100 border border-gray-50 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img src={p.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800 tracking-tight">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-light mt-0.5 truncate w-48">{p.description || "Aucune description"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="text-[13px] font-bold text-gray-900 tracking-tighter italic">{p.sale_price?.toLocaleString()}</span>
                  <span className="text-[9px] text-gray-400 ml-1">CFA</span>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                    En Ligne
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL HARMONISÉE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-[#0866FF] uppercase tracking-[0.3em]">Nouvelle Entrée</p>
                <h2 className="text-xl font-light text-gray-900 tracking-tight">Configuration Produit</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
              {/* Upload Image Minimaliste */}
              <div 
                onClick={() => document.getElementById('modal-upload')?.click()}
                className="w-full h-48 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0866FF] hover:bg-blue-50/30 transition-all group overflow-hidden relative"
              >
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto text-gray-200 group-hover:text-[#0866FF] transition-colors mb-3" size={32} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliquer pour charger un visuel</p>
                  </div>
                )}
                <input id="modal-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="space-y-6">
                <div className="space-y-2 border-l-2 border-gray-100 pl-4 focus-within:border-[#0866FF] transition-colors">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Libellé du produit</label>
                  <input 
                    required placeholder="Nom de l'article..." 
                    className="w-full text-lg font-light outline-none bg-transparent"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-2 border-l-2 border-gray-100 pl-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix Standard</label>
                    <input 
                      required type="number" placeholder="0.00"
                      className="w-full text-lg font-light outline-none bg-transparent"
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 border-l-2 border-[#0866FF] pl-4">
                    <label className="text-[10px] font-bold text-[#0866FF] uppercase tracking-widest">Prix Solde</label>
                    <input 
                      required type="number" placeholder="0.00"
                      className="w-full text-lg font-black outline-none bg-transparent text-[#0866FF]"
                      onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 border-l-2 border-gray-100 pl-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[10px]">Description & Détails</label>
                  <textarea 
                    placeholder="Informations complémentaires..." rows={2}
                    className="w-full text-sm font-light outline-none bg-transparent resize-none"
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={adding}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-full text-[11px] tracking-[0.2em] shadow-xl hover:bg-[#0866FF] transition-all flex items-center justify-center gap-3"
              >
                {adding ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {adding ? "SYNCHRONISATION..." : "ENREGISTRER LA RÉFÉRENCE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}