import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  X, Save, Loader2, Plus, Package, ShoppingBag, Tag 
} from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState('simple'); 
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newPackItem, setNewPackItem] = useState('');

  const categories = ["Packs Promo", "Vêtements", "Chaussures", "Accessoires", "Beauté", "Électronique", "Maison", "Autre"];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    sizes: [],
    colors: [],
    pack_items: []
  });

  // Nettoyage mémoire des previews d'images
  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  if (!isOpen) return null;

  const addTag = (type, value) => {
    if (!value) return;
    const val = value.trim();
    if (type === 'color') {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, val] }));
      setNewColor('');
    } else if (type === 'size') {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, val.toUpperCase()] }));
      setNewSize('');
    } else if (type === 'pack_items') {
      setFormData(prev => ({ ...prev, pack_items: [...prev.pack_items, val] }));
      setNewPackItem('');
    }
  };

  const removeTag = (type, index) => {
    const key = type === 'color' ? 'colors' : (type === 'size' ? 'sizes' : 'pack_items');
    setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) return alert("Maximum 5 photos autorisées");
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Veuillez choisir une catégorie");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();

      const uploadedUrls = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from('product-images').upload(`${user.id}/${fileName}`, file);
        const { data: url } = supabase.storage.from('product-images').getPublicUrl(`${user.id}/${fileName}`);
        uploadedUrls.push(url.publicUrl);
      }

      const { error } = await supabase.from('products').insert([{
        store_id: store.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        image_url: uploadedUrls[0] || "",
        images: uploadedUrls,
        sizes: formData.sizes,
        colors: formData.colors,
        product_type: productType,
        pack_items: productType === 'pack' ? formData.pack_items : []
      }]);

      if (error) throw error;
      onSuccess(); 
      onClose();   
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest";
  const inputStyle = "w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-sm";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        {/* BOUTON FERMER */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-red-100 hover:text-red-500 rounded-full transition-all z-10">
          <X size={20} />
        </button>

        <div className="p-6 md:p-10">
          <header className="mb-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tight">Ajouter un <span className="text-orange-600">Article</span></h2>
            <div className="flex gap-3 mt-6 bg-gray-100 p-1.5 rounded-2xl w-fit">
              <button type="button" onClick={() => setProductType('simple')} className={`px-6 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all ${productType === 'simple' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>
                <ShoppingBag size={14} /> SIMPLE
              </button>
              <button type="button" onClick={() => setProductType('pack')} className={`px-6 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all ${productType === 'pack' ? 'bg-orange-600 shadow-sm text-white' : 'text-gray-400'}`}>
                <Package size={14} /> PACK PROMO
              </button>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* IMAGES */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button>
                </div>
              ))}
              {previews.length < 5 && (
                <button type="button" onClick={() => document.getElementById('modal-up').click()} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all">
                  <Plus size={24} />
                  <span className="text-[8px] font-black mt-1">PHOTO</span>
                </button>
              )}
              <input id="modal-up" type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
            </div>

            {/* INFOS GÉNÉRALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelStyle}>Titre de l'article</label>
                <input required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Chemise en lin blanc" />
              </div>
              
              <div className="md:col-span-2">
                <label className={labelStyle}>Description</label>
                <textarea rows="3" className={`${inputStyle} resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détails, matière, état de l'article..." />
              </div>

              <div>
                <label className={labelStyle}>Catégorie</label>
                <select required className={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Sélectionner</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Stock</label>
                <input type="number" required className={inputStyle} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}>Prix (CFA)</label>
                <input type="number" required className={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className={`${labelStyle} text-orange-500`}>Prix Promo</label>
                <input type="number" className={`${inputStyle} bg-orange-50/50`} value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} />
              </div>
            </div>

            {/* COULEURS ET TAILLES (Visible si Produit Simple) */}
            {productType === 'simple' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BLOC COULEURS */}
                <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                  <label className={labelStyle}>Couleurs Disponibles</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      value={newColor} 
                      onChange={e => setNewColor(e.target.value)} 
                      className="flex-1 p-3 rounded-xl border-none font-bold text-sm shadow-inner" 
                      placeholder="Ex: Noir" 
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('color', newColor))}
                    />
                    <button type="button" onClick={() => addTag('color', newColor)} className="bg-black text-white px-4 rounded-xl hover:bg-orange-600 transition-colors">
                      <Plus size={18}/>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((c, i) => (
                      <span key={i} className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-sm border border-gray-100">
                        {c} <X size={12} className="text-red-500 cursor-pointer" onClick={() => removeTag('color', i)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* BLOC TAILLES */}
                <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                  <label className={labelStyle}>Tailles Disponibles</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      value={newSize} 
                      onChange={e => setNewSize(e.target.value)} 
                      className="flex-1 p-3 rounded-xl border-none font-bold text-sm shadow-inner" 
                      placeholder="Ex: XL" 
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('size', newSize))}
                    />
                    <button type="button" onClick={() => addTag('size', newSize)} className="bg-black text-white px-4 rounded-xl hover:bg-orange-600 transition-colors">
                      <Plus size={18}/>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((s, i) => (
                      <span key={i} className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-orange-100">
                        {s} <X size={12} className="cursor-pointer" onClick={() => removeTag('size', i)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BLOC PACK (Visible si Produit Pack) */}
            {productType === 'pack' && (
              <div className="bg-black p-8 rounded-[32px] text-white">
                <label className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-4 block">Articles inclus dans le pack</label>
                <div className="flex gap-3">
                  <input 
                    value={newPackItem} 
                    onChange={e => setNewPackItem(e.target.value)} 
                    className="flex-1 bg-gray-900 p-4 rounded-2xl border-none outline-none text-white font-bold" 
                    placeholder="Ex: 1 Chemise + 1 Pantalon" 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('pack_items', newPackItem))}
                  />
                  <button type="button" onClick={() => addTag('pack_items', newPackItem)} className="bg-orange-500 p-4 rounded-2xl text-white hover:bg-orange-400 transition-colors">
                    <Plus />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.pack_items.map((item, i) => (
                    <span key={i} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-3">
                      {item} <X size={14} className="text-red-400 cursor-pointer" onClick={() => removeTag('pack_items', i)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all hover:bg-orange-700 shadow-xl shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="animate-spin" /> : <Save />}
              {loading ? "PUBLICATION..." : "PUBLIER L'ARTICLE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}