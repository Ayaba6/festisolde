import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  X, Save, Loader2, Image as ImageIcon, 
  CheckCircle2, Plus
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

  const categories = ["Vêtements", "Chaussures", "Accessoires", "Beauté", "Électronique", "Maison", "Autre"];
  const inputStyle = "w-full border-[3px] border-black rounded-2xl px-5 py-4 text-sm font-bold focus:border-orange-500 outline-none bg-white transition-all placeholder:text-gray-400";

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
      console.error("Erreur compression:", err);
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
      alert(`Erreur: ${err.message || "Impossible de publier l'article"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-gray-900">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border-[3px] border-black">
        
        <div className="p-6 border-b-[3px] border-black flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black uppercase italic">{productToEdit ? 'Modifier' : 'Ajouter'} <span className="text-orange-600">Article</span></h2>
          <button onClick={onClose} type="button" className="p-3 border-2 border-black rounded-full hover:bg-red-50 text-red-500 transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          
          <div className="flex gap-4 p-1.5 bg-gray-100 rounded-2xl border-[3px] border-black">
            <button type="button" onClick={() => setProductType('simple')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${productType === 'simple' ? 'bg-black text-white' : 'text-gray-500'}`}>SIMPLE</button>
            <button type="button" onClick={() => setProductType('pack')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${productType === 'pack' ? 'bg-orange-600 text-white' : 'text-gray-500'}`}>PACK</button>
          </div>

          {/* SECTION SELECTION PHOTOS */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previews.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => document.getElementById('file-upload').click()} 
                  className="aspect-square border-[3px] border-dashed border-black rounded-[1.5rem] flex flex-col items-center justify-center gap-1 text-black bg-gray-50 hover:bg-orange-50 transition-colors"
                >
                  <ImageIcon size={24} />
                  <span className="text-[8px] font-black uppercase">Choisir</span>
                  {/* Suppression de capture="environment" pour mode SELECT classique */}
                  <input id="file-upload" type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
                </button>
              )}
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} className="w-full h-full object-cover rounded-[1.5rem] border-[3px] border-black shadow-sm" />
                  <button type="button" onClick={() => { setPreviews(p => p.filter((_, idx) => idx !== i)); setImageFiles(f => f.filter((_, idx) => idx !== i)); }} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1.5 border-2 border-white shadow-md transition-transform hover:scale-110"><X size={10}/></button>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-bold text-gray-400 italic px-1 italic">
              💡 Conseil : Utilisez des images avec un <span className="text-orange-600">fond blanc</span> pour plus de ventes.
            </p>
          </div>

          <div className="space-y-4">
            <input required className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="NOM DE L'ARTICLE *" />
            <textarea className={`${inputStyle} h-24 resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="DESCRIPTION (MATIÈRE, COUPE...)" />

            <div className="grid grid-cols-2 gap-4">
              <input type="number" required className={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="PRIX (FCFA) *" />
              <input type="number" className={`${inputStyle} text-orange-600`} value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} placeholder="PRIX PROMO" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className={inputStyle} value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} placeholder="COULEURS (EX: GRIS, NOIR)" />
              <input className={inputStyle} value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="TAILLES (EX: M, 42)" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select required className={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">CATÉGORIE</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" required className={inputStyle} value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} placeholder="STOCK DISPO" />
            </div>
          </div>

          <button disabled={processing} type="submit" className="w-full bg-black hover:bg-orange-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-gray-400">
            {processing ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {processing ? "PUBLICATION..." : "CONFIRMER LA VENTE"}
          </button>
        </form>
      </div>
    </div>
  );
}