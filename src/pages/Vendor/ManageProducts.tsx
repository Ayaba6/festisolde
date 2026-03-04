import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Trash2, X, Save, Loader2, Edit3, RefreshCcw, Image as ImageIcon, ShoppingCart 
} from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [productType, setProductType] = useState('simple'); 
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    sale_price: '',
    stock_quantity: '1',
    sizes: [],
    colors: [],
    pack_items: []
  });

  const categories = ["Vêtements", "Chaussures", "Accessoires", "Beauté", "Électronique", "Maison", "Autre"];

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

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock_quantity: product.stock_quantity || '1',
      sizes: product.sizes || [],
      colors: product.colors || [],
      pack_items: product.pack_items || []
    });
    setProductType(product.product_type || 'simple');
    setPreviews(product.images && product.images.length > 0 ? product.images : [product.image_url]);
    setImageFiles([]); 
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet article définitivement ?")) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
      } catch (err) { alert("Erreur suppression"); }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles([...imageFiles, ...files]);
    setPreviews([...previews, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();

      let finalImages = previews.filter(p => p.startsWith('http')); 

      for (const file of imageFiles) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        await supabase.storage.from('product-images').upload(filePath, file);
        const { data: url } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalImages.push(url.publicUrl);
      }

      const productData = {
        store_id: store.id,
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
        product_type: productType
      };

      if (editingId) {
        await supabase.from('products').update(productData).eq('id', editingId);
      } else {
        await supabase.from('products').insert([{ ...productData, sold_count: 0 }]);
      }

      setIsModalOpen(false);
      setEditingId(null);
      fetchProducts();
      setFormData({ name: '', description: '', category: '', price: '', sale_price: '', stock_quantity: '1', sizes: [], colors: [], pack_items: [] });
      setPreviews([]);
      setImageFiles([]);
    } catch (err) { console.error(err); } finally { setProcessing(false); }
  };

  const inputStyle = "w-full border-2 border-gray-400 rounded-xl px-4 py-3 text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-white font-medium";
  const labelStyle = "block text-sm font-black text-gray-800 mb-2 uppercase tracking-wider text-[11px]";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Gestion <span className="text-orange-600">Stock</span></h1>
        <button 
          onClick={() => { setEditingId(null); setFormData({name:'', description:'', category:'', price:'', sale_price:'', stock_quantity:'1', sizes:[], colors:[], pack_items:[]}); setPreviews([]); setIsModalOpen(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl font-black text-[10px] md:text-xs tracking-widest flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">AJOUTER UN PRODUIT</span><span className="sm:hidden">AJOUTER</span>
        </button>
      </div>

      {/* VERSION MOBILE : LISTE EN CARDS */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="bg-white border-2 border-gray-100 rounded-[2rem] p-4 shadow-xl flex items-center gap-4 relative">
            <div className="relative flex-shrink-0">
              <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100" />
              {p.sold_count > 5 && (
                <span className="absolute -top-2 -left-2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">TOP</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">{p.category}</p>
              <h3 className="text-sm font-black uppercase text-gray-900 truncate">{p.name}</h3>
              <p className="text-orange-600 font-black text-sm">{p.price.toLocaleString()} CFA</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${p.stock_quantity > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {p.stock_quantity > 0 ? `${p.stock_quantity} EN STOCK` : 'ÉPUISÉ'}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">{p.sold_count || 0} VENTES</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-orange-600 bg-gray-50 rounded-xl transition-all"><Edit3 size={18} /></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* VERSION DESKTOP : TABLEAU */}
      <div className="hidden md:block bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b-2 border-gray-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Article</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Prix</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vendu</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="relative">
                    <img src={p.image_url} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-200" />
                    {p.sold_count > 5 && (
                      <span className="absolute -top-2 -left-2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">TOP</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-gray-900">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest">{p.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-black text-sm text-gray-800">{p.price.toLocaleString()} CFA</td>
                <td className="px-6 py-4 text-center">
                   <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-orange-600">{p.sold_count || 0}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Ventes</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${p.stock_quantity > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {p.stock_quantity > 0 ? `${p.stock_quantity} EN STOCK` : 'ÉPUISÉ'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && !loading && (
        <div className="p-20 text-center flex flex-col items-center gap-4">
          <ShoppingCart size={48} className="text-gray-200" />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aucun produit dans votre stock</p>
        </div>
      )}

      {/* MODAL (AJOUT & MODIF) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-2 border-gray-300">
            <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900 uppercase italic">
                {editingId ? 'Modifier' : 'Nouveau'} <span className="text-orange-600">Produit</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              
              <div className="flex gap-4 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                <button type="button" onClick={() => setProductType('simple')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest ${productType === 'simple' ? 'bg-white shadow-md text-orange-600' : 'text-gray-500'}`}>ARTICLE SIMPLE</button>
                <button type="button" onClick={() => setProductType('pack')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest ${productType === 'pack' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500'}`}>PACK PROMO</button>
              </div>

              <div>
                <label className={labelStyle}>Photos du produit</label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} className="w-full aspect-square object-cover rounded-xl border-2 border-gray-900" />
                      <button type="button" onClick={() => { setPreviews(prev => prev.filter((_, idx) => idx !== i)); setImageFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1"><X size={10}/></button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button type="button" onClick={() => document.getElementById('file-up').click()} className="aspect-square border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-all">
                      <ImageIcon size={24} />
                    </button>
                  )}
                </div>
                <input id="file-up" type="file" hidden multiple onChange={handleImageChange} />
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Nom de l'article *</label>
                  <input required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Basket Nike..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Catégorie</label>
                    <select required className={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="">Choisir</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Stock initial</label>
                    <input type="number" required className={inputStyle} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Prix Normal (CFA)</label>
                    <input type="number" required className={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className={`${labelStyle} text-orange-600`}>Prix Promo (CFA)</label>
                    <input type="number" className={`${inputStyle} border-orange-300 bg-orange-50/20`} value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={processing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all disabled:bg-gray-400 mt-4"
              >
                {processing ? <Loader2 className="animate-spin" /> : (editingId ? <RefreshCcw size={20}/> : <Save size={20}/>)}
                {processing ? "ENREGISTREMENT..." : (editingId ? "METTRE À JOUR" : "METTRE EN VENTE")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}