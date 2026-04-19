import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  X, Save, Loader2, Image as ImageIcon, 
  Plus, Trash2, Camera
} from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AddProductModal({ storeId, productToEdit, onClose, onRefresh }) {
  const [processing, setProcessing] = useState(false);
  const [productType, setProductType] = useState(productToEdit?.product_type || 'simple');
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState(
    productToEdit ? (Array.isArray(productToEdit.images) ? productToEdit.images : [productToEdit.image_url]) : []
  );

  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    description: productToEdit?.description || '',
    category: productToEdit?.category || '',
    price: productToEdit?.price || '',
    sale_price: productToEdit?.sale_price || '',
    stock_quantity: productToEdit?.stock_quantity || '1',
    colors: productToEdit?.colors || '', 
    sizes: productToEdit?.sizes || ''    
  });

  const categories = ["Vêtements", "Chaussures", "Accessoires", "Beauté", "Électronique", "Maison", "Packeo", "Grossistes", "Liquidation", "Autre"];

  // Style des inputs modernisé : fini les bordures noires, place au Slate-50 épuré
  const inputStyle = "w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none";

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setProcessing(true);
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, options);
          return { file: compressed, preview: URL.createObjectURL(compressed) };
        })
      );
      setImageFiles(prev => [...prev, ...results.map(r => r.file)]);
      setPreviews(prev => [...prev, ...results.map(r => r.preview)]);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (previews.length === 0) return alert("Ajoutez au moins une photo !");
    
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      let finalImages = previews.filter(p => p.startsWith('http'));

      for (const file of imageFiles) {
        const path = `${user.id}/${Date.now()}-${Math.random()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        finalImages.push(urlData.publicUrl);
      }

      const productData = {
        store_id: storeId,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        sale_price: formData.sale_price && formData.sale_price !== '' ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        colors: formData.colors || null,
        sizes: formData.sizes || null,
        image_url: finalImages[0] || null,
        images: finalImages,
        product_type: productType,
      };

      const { error } = productToEdit 
        ? await supabase.from('products').update(productData).eq('id', productToEdit.id)
        : await supabase.from('products').insert([{ ...productData, sold_count: 0 }]);

      if (error) throw error;
      onRefresh();
      onClose();
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header épuré */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {productToEdit ? 'Modifier' : 'Nouvel article'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Édition de votre inventaire</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          
          {/* Switch Type de Produit Premium */}
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl">
            <button 
              type="button" 
              onClick={() => setProductType('simple')} 
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${productType === 'simple' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              SIMPLE
            </button>
            <button 
              type="button" 
              onClick={() => setProductType('pack')} 
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${productType === 'pack' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              PACK (LOT)
            </button>
          </div>

          {/* Galerie Photo Style Studio */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Photos de l'article (max 5)</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {previews.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => document.getElementById('file-upload').click()} 
                  className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-50/30 transition-all group"
                >
                  <div className="p-2 bg-slate-50 rounded-full group-hover:bg-orange-100 transition-colors">
                    <Camera size={20} />
                  </div>
                  <input id="file-upload" type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
                </button>
              )}
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square group">
                  <img src={src} className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm" />
                  <button 
                    type="button" 
                    onClick={() => { setPreviews(p => p.filter((_, idx) => idx !== i)); setImageFiles(f => f.filter((_, idx) => idx !== i)); }} 
                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-xl border border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Informations de base</label>
               <input required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nom de l'article (ex: Veste en lin)" />
            </div>
            
            <textarea className={`${inputStyle} h-28 resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description détaillée..." />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 ml-1">PRIX DE VENTE (FCFA)</label>
                <input type="number" required className={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-orange-500/70 ml-1">PRIX PROMO (OPTIONNEL)</label>
                <input type="number" className={`${inputStyle} text-orange-600 bg-orange-50/30`} value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className={inputStyle} value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} placeholder="Couleurs (Noir, Blanc...)" />
              <input className={inputStyle} value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="Tailles (M, L, XL...)" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select required className={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">CATÉGORIE</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" required className={inputStyle} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} placeholder="Stock disponible" />
            </div>
          </div>

          <button 
            disabled={processing} 
            type="submit" 
            className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400 mt-4 shadow-xl shadow-slate-200"
          >
            {processing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {processing ? "PUBLICATION EN COURS..." : productToEdit ? "MODIFIER L'ARTICLE" : "METTRE EN VENTE"}
          </button>
        </form>
      </div>
    </div>
  );
}