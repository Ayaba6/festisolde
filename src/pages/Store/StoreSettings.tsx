import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Upload, 
  Save, 
  Loader2, 
  CheckCircle2,
  Globe,
  Camera,
  Copy
} from 'lucide-react';

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  
  const [storeData, setStoreData] = useState({
    id: '',
    name: '',
    description: '',
    logo_url: '',
    banner_url: '',
    slug: '',
  });

  useEffect(() => {
    fetchStore();
  }, []);

  async function fetchStore() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
      if (data) setStoreData(data);
    }
    setLoading(false);
  }

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${type}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      
      setStoreData(prev => ({ ...prev, [type]: urlData.publicUrl }));
      
      await supabase
        .from('stores')
        .update({ [type]: urlData.publicUrl })
        .eq('id', storeData.id);

      setMessage('Image mise à jour');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSave = async () => {
    if (!storeData.id) return;
    setUpdating(true);

    const newSlug = storeData.name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

    try {
      const { data, error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          description: storeData.description,
          logo_url: storeData.logo_url,
          banner_url: storeData.banner_url,
          slug: newSlug 
        })
        .eq('id', storeData.id)
        .select();

      if (error) throw error;
      if (data) setStoreData(data[0]);

      setMessage('Modifications enregistrées !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = () => {
    const url = `festisolde.com/${storeData.slug}`;
    navigator.clipboard.writeText(url);
    setMessage('Lien copié !');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 antialiased">
      
      {/* HEADER PLUS DISCRET */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Configuration</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profil de la boutique</h1>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-pulse">
            <CheckCircle2 size={14} /> {message}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLONNE VISUELS */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative">
            <div className="h-48 md:h-60 bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 relative group shadow-sm">
              {storeData.banner_url ? (
                <img src={storeData.banner_url} className="w-full h-full object-cover" alt="Banner" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-tighter">Aucune bannière</div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold text-black shadow-lg">
                  <Camera size={14} /> CHANGER LA COUVERTURE
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} />
              </label>
            </div>

            {/* LOGO AJUSTÉ */}
            <div className="absolute -bottom-6 left-8">
              <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl border border-gray-100 group/logo relative">
                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  {storeData.logo_url ? (
                    <img src={storeData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-300">{storeData.name?.charAt(0)}</span>
                  )}
                  <label className="absolute inset-0 bg-orange-600/80 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                    <Upload size={20} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* LIEN DE LA VITRINE - PLUS SOBRE */}
          <div className="pt-6">
             <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                      <Globe size={18} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Lien public</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">
                          festisolde.com/<span className="text-orange-600">{storeData.slug || '...'}</span>
                      </p>
                   </div>
                </div>
                <button onClick={copyToClipboard} className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                   <Copy size={18} />
                </button>
             </div>
          </div>
        </div>

        {/* COLONNE ÉDITION */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nom de l'enseigne</label>
                <input 
                  value={storeData.name}
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full text-lg font-bold outline-none bg-gray-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-100 transition-all border border-transparent focus:border-orange-200"
                  placeholder="EX: M&M FASHION"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description courte</label>
                <textarea 
                  rows={4}
                  value={storeData.description}
                  onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                  className="w-full text-sm font-medium outline-none bg-gray-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-100 transition-all border border-transparent focus:border-orange-200 resize-none leading-relaxed text-gray-600"
                  placeholder="Décrivez votre boutique en quelques mots..."
                />
              </div>
           </div>

           <button 
             onClick={handleSave}
             disabled={updating}
             className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl text-xs tracking-widest shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400 group"
           >
             {updating ? (
               <Loader2 className="animate-spin" size={16} />
             ) : (
               <Save size={16} className="group-hover:scale-110 transition-transform" />
             )}
             METTRE À JOUR LE PROFIL
           </button>
        </div>
      </div>
    </div>
  );
}