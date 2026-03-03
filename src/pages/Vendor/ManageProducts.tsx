import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Search, Trash2, X, ImageIcon, Save, Loader2, 
  ExternalLink 
} from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('Tout');
  const [searchTerm, setSearchTerm] = useState('');

  // GESTION MULTI-IMAGES
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock_quantity: '1',
    category: 'Vêtements'
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

  // Gestion de la sélection multiple
  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user?.id).single();

      // 1. Upload de toutes les images vers Storage
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      // 2. Détermination du type (pour activer la grille)
      const isPack = formData.category === 'Packs Promo' || formData.name.toLowerCase().includes('pack');

      // 3. Insertion dans la base de données
      const { error } = await supabase.from('products').insert([{
        store_id: store.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: uploadedUrls[0] || "", // Image de couverture
        images: uploadedUrls,             // TABLEAU pour la grille
        product_type: isPack ? 'pack' : 'simple',
        category: formData.category
      }]);

      if (!error) {
        setIsModalOpen(false);
        fetchProducts();
        setPreviews([]);
        setImageFiles([]);
        setFormData({ name: '', description: '', price: '', sale_price: '', stock_quantity: '1', category: 'Vêtements' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'En Stock') return matchesSearch && (p.stock_quantity || 0) > 0;
    if (filter === 'Rupture') return matchesSearch && (p.stock_quantity || 0) <= 0;
    return matchesSearch;
  });

  const inputStyle = "w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:font-normal text-gray-700";
  const labelStyle = "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1";

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Accès à l'inventaire...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">
            VOTRE <span className="text-orange-600 italic-none">STOCK</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            {filteredProducts.length} Articles affichés
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl text-[11px] font-black tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-gray-200"
        >
          <Plus size={18} strokeWidth={3} /> AJOUTER UNE RÉFÉRENCE
        </button>
      </div>

      {/* --- FILTRES & RECHERCHE (Inchangés) --- */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
          {['Tout', 'En Stock', 'Rupture'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === tab ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600" size={16} />
          <input 
            type="text" 
            placeholder="RECHERCHER UN ARTICLE..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:border-orange-500 transition-all tracking-widest"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLEAU INVENTAIRE (Inchangé) --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Article</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Prix</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 shadow-inner">
                        <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 uppercase truncate max-w-[200px]">{p.name || 'Sans nom'}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">REF: {p.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-sm font-black text-gray-900 tracking-tighter">
                      {(p.sale_price || p.price || 0).toLocaleString()} <span className="text-[10px] text-gray-400">CFA</span>
                    </p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      (p.stock_quantity || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {(p.stock_quantity || 0) > 0 ? 'Disponible' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                        <ExternalLink size={18} />
                      </button>
                      <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL AMELIOREE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 uppercase italic">Ajouter au Stock</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} strokeWidth={3}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* ZONE MULTI-UPLOAD */}
              <div className="space-y-3">
                <label className={labelStyle}>Photos de l'article (Max 3 pour la grille)</label>
                <div className="grid grid-cols-3 gap-4">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {previews.length < 3 && (
                    <button 
                      type="button"
                      onClick={() => document.getElementById('modal-upload')?.click()}
                      className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-orange-500 transition-all"
                    >
                      <Plus className="text-gray-300" size={24} />
                      <span className="text-[8px] font-black text-gray-400 mt-2 uppercase">Ajouter</span>
                    </button>
                  )}
                </div>
                <input id="modal-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelStyle}>Désignation</label>
                  <input required placeholder="Nom du produit..." className={inputStyle}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className={labelStyle}>Catégorie</label>
                  <select 
                    className={inputStyle}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Vêtements">Vêtements</option>
                    <option value="Chaussures">Chaussures</option>
                    <option value="Accessoires">Accessoires</option>
                    <option value="Packs Promo">Packs Promo (Active la grille)</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Prix Standard (CFA)</label>
                  <input required type="number" className={inputStyle}
                    onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <button 
                type="submit" disabled={adding || imageFiles.length === 0}
                className="w-full bg-black text-white font-black py-5 rounded-2xl text-[11px] tracking-[0.3em] hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
              >
                {adding ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {adding ? "CHARGEMENT..." : "ENREGISTRER L'ARTICLE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}