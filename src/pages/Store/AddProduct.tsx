import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  ChevronLeft, 
  Save, 
  X, 
  Loader2,
  Plus,
  Package,
  ShoppingBag,
  Tag
} from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState('simple'); 
  
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newPackItem, setNewPackItem] = useState('');

  // 1. GESTION DE LA MÉMOIRE (Décharge au démontage du composant)
  useEffect(() => {
    return () => {
      // Libère toutes les URLs créées pour éviter de saturer le navigateur
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
    if (files.length + imageFiles.length > 5) return alert("Max 5 photos");
    
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  // 2. SUPPRESSION IMAGE AVEC DÉCHARGE MÉMOIRE
  const removeImage = (index) => {
    const urlToRemove = previews[index];
    URL.revokeObjectURL(urlToRemove); // Libère la RAM pour cette image
    
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
      navigate('/products');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const labelStyle = "block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest";
  const inputStyle = "w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-sm";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
      
      {/* SÉLECTEUR DE TYPE */}
      <div className="flex gap-3 mb-8 bg-gray-100 p-1.5 rounded-3xl w-fit mx-auto md:mx-0">
        <button type="button" onClick={() => setProductType('simple')} className={`px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 transition-all ${productType === 'simple' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>
          <ShoppingBag size={14} /> SIMPLE
        </button>
        <button type="button" onClick={() => setProductType('pack')} className={`px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 transition-all ${productType === 'pack' ? 'bg-orange-600 shadow-sm text-white' : 'text-gray-400'}`}>
          <Package size={14} /> PACK PROMO
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. IMAGES AVEC BOUTON DE DÉCHARGE */}
        <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <label className={labelStyle}>Photos du produit (Max 5)</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border">
                <img src={src} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button>
              </div>
            ))}
            {previews.length < 5 && (
              <button type="button" onClick={() => document.getElementById('up').click()} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all">
                <Plus size={24} />
                <span className="text-[8px] font-black mt-1">AJOUTER</span>
              </button>
            )}
          </div>
          <input id="up" type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
        </section>

        {/* 2. INFOS PRINCIPALES + CATÉGORIE */}
        <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className={labelStyle}>Titre de l'article</label>
            <input required type="text" placeholder="Ex: Basket Nike Air Force 1" className={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className={labelStyle}>Description détaillée</label>
            <textarea rows="4" placeholder="Matière, style, conseils..." className={inputStyle} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <div>
            <label className={labelStyle}>Catégorie du produit</label>
            <div className="relative">
              <select 
                required
                className={`${inputStyle} appearance-none cursor-pointer`}
                value={formData.category}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, category: val});
                  if (val === "Packs Promo") setProductType('pack');
                }}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Tag size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* 3. PRIX / PROMO / STOCK */}
        <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelStyle}>Prix (CFA)</label>
            <input required type="number" placeholder="25000" className={inputStyle} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div>
            <label className={`${labelStyle} text-orange-500`}>Prix Promo</label>
            <input type="number" placeholder="Optionnel" className={`${inputStyle} bg-orange-50/50`} onChange={e => setFormData({...formData, sale_price: e.target.value})} />
          </div>
          <div>
            <label className={labelStyle}>Quantité Stock</label>
            <input required type="number" placeholder="10" className={inputStyle} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
          </div>
        </section>

        {/* 4. VARIANTES OU PACK */}
        {productType === 'simple' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <label className={labelStyle}>Couleurs disponibles</label>
              <div className="flex gap-2">
                <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Bleu, Rouge..." className={inputStyle} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('color', newColor))} />
                <button type="button" onClick={() => addTag('color', newColor)} className="bg-black text-white px-4 rounded-xl"><Plus size={20} /></button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.colors.map((c, i) => (
                  <span key={i} className="bg-gray-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">{c} <X size={12} className="cursor-pointer text-red-500" onClick={() => removeTag('color', i)} /></span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <label className={labelStyle}>Tailles disponibles</label>
              <div className="flex gap-2">
                <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="XL, 42, L..." className={inputStyle} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('size', newSize))} />
                <button type="button" onClick={() => addTag('size', newSize)} className="bg-black text-white px-4 rounded-xl"><Plus size={20} /></button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.sizes.map((s, i) => (
                  <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">{s} <X size={12} className="cursor-pointer" onClick={() => removeTag('size', i)} /></span>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-black p-8 rounded-[40px] text-white">
              <label className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Articles inclus dans le pack</label>
              <div className="flex gap-3">
                <input type="text" value={newPackItem} onChange={e => setNewPackItem(e.target.value)} placeholder="Ex: 1 Chemise + 1 Pantalon..." className="flex-1 bg-gray-900 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 text-white font-bold" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('pack_items', newPackItem))} />
                <button type="button" onClick={() => addTag('pack_items', newPackItem)} className="bg-orange-500 p-4 rounded-2xl text-white"><Plus /></button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.pack_items.map((item, i) => (
                  <span key={i} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-3">{item} <X size={14} className="text-red-400 cursor-pointer" onClick={() => removeTag('pack_items', i)} /></span>
                ))}
              </div>
          </section>
        )}

        <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-[32px] font-black text-xl shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-4">
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          {loading ? "PUBLICATION..." : "PUBLIER L'ARTICLE"}
        </button>

      </form>
    </div>
  );
}