import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Image as ImageIcon, 
  ChevronLeft, 
  Save, 
  X, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    image_file: null as File | null
  });

  // Gestion de l'upload d'image (Prévisualisation)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image_file: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      // 1. Récupérer l'ID de la boutique
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      // 2. Upload de l'image dans le Storage Supabase
      let image_url = "";
      if (formData.image_file) {
        const fileExt = formData.image_file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, formData.image_file);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        image_url = urlData.publicUrl;
      }

      // 3. Insertion du produit
      const { error } = await supabase.from('products').insert([{
        store_id: store.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: parseFloat(formData.sale_price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: image_url
      }]);

      if (error) throw error;
      navigate('/products'); // Redirection vers la liste

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
            <p className="text-sm text-gray-500">Créez une offre irrésistible pour vos clients.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche : Infos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Pack Business Digital Ultime"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea 
                rows={5}
                placeholder="Décrivez les avantages de votre produit..."
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prix normal (FCFA)</label>
                <input 
                  required
                  type="number" 
                  placeholder="25000"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prix promo (FCFA)</label>
                <input 
                  required
                  type="number" 
                  placeholder="9900"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <label className="block text-sm font-bold text-gray-700 mb-2">Stock disponible</label>
             <input 
                type="number" 
                placeholder="Ex: 100"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
              />
          </div>
        </div>

        {/* Colonne Droite : Image & Action */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Image du produit</label>
            
            <div 
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                previewUrl ? 'border-none' : 'border-gray-200 hover:border-yellow-400 hover:bg-gray-50'
              }`}
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={40} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Cliquez pour uploader</p>
                </>
              )}
              <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-400">
               <AlertCircle size={14} className="shrink-0" />
               <p>Utilisez des images carrées (1080x1080) pour un meilleur rendu sur votre boutique.</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-lg shadow-yellow-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? "Publication..." : "Publier l'offre"}
          </button>
        </div>
      </form>
    </div>
  );
}