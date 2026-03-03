import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Store, 
  Image as ImageIcon, 
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

      // Upload vers le bucket 'store-assets'
      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      
      setStoreData(prev => ({ ...prev, [type]: urlData.publicUrl }));
      
      // Mise à jour immédiate en base pour ne pas perdre l'image
      await supabase
        .from('stores')
        .update({ [type]: urlData.publicUrl })
        .eq('id', storeData.id);

      setMessage('Image mise à jour');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'envoi de l'image");
    } finally {
      setUpdating(false);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('stores')
      .update({
        name: storeData.name,
        description: storeData.description,
        logo_url: storeData.logo_url,
        banner_url: storeData.banner_url
      })
      .eq('id', storeData.id);

    if (!error) {
      setMessage('Identité mise à jour');
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  const copyToClipboard = () => {
    const url = `festisolde.com/${storeData.name?.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(url);
    setMessage('Lien copié !');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Configuration du studio...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 antialiased">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] ml-1">Configuration</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">
            IDENTITÉ DE <span className="text-gray-300 italic-none">MARQUE</span>
          </h1>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-[#25D366] text-[10px] font-black uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={14} /> {message}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* --- COLONNE GAUCHE : VISUELS --- */}
        <div className="lg:col-span-7 space-y-12">
          
          <div className="relative group">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Aperçu de la vitrine</p>
            
            {/* Banner Container */}
            <div className="h-64 bg-gray-100 rounded-[2rem] overflow-hidden border border-gray-100 relative group/banner shadow-inner">
              {storeData.banner_url ? (
                <img src={storeData.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105" alt="Banner" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-300 font-black italic">Fond de boutique vide</div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm">
                <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black tracking-widest shadow-2xl scale-90 group-hover/banner:scale-100 transition-transform">
                  <Camera size={16} /> ÉDITER LA BANNIÈRE
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} />
              </label>
            </div>

            {/* Logo Overlay */}
            <div className="absolute -bottom-8 left-10">
              <div className="w-32 h-32 bg-white rounded-[2rem] p-2 shadow-2xl shadow-gray-300/50 relative group/logo border border-gray-50">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-50 relative border border-gray-100">
                  {storeData.logo_url ? (
                    <img src={storeData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-200 uppercase italic">
                      {storeData.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-orange-600/80 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                    <Upload size={24} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* LIEN PUBLIC COMPACT */}
          <div className="pt-12">
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between group shadow-sm">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                      <Globe size={20} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">URL de partage boutique</p>
                      <p className="text-sm font-bold text-gray-900 italic">
                        festisolde.com/{(storeData.name || 'ma-boutique').toLowerCase().replace(/\s+/g, '-')}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                >
                   <Copy size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : ÉDITION --- */}
        <div className="lg:col-span-5 space-y-10">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="space-y-3 border-l-4 border-gray-50 pl-6 focus-within:border-orange-500 transition-all">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom Commercial</label>
                <input 
                  value={storeData.name}
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full text-2xl font-black italic outline-none bg-transparent text-gray-900 placeholder:text-gray-200"
                  placeholder="NOM DE VOTRE STORE"
                />
              </div>

              <div className="space-y-3 border-l-4 border-gray-50 pl-6 focus-within:border-orange-500 transition-all">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slogan de la marque</label>
                <textarea 
                  rows={4}
                  value={storeData.description}
                  onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                  className="w-full text-sm font-bold outline-none bg-transparent text-gray-500 leading-relaxed resize-none placeholder:font-normal"
                  placeholder="Décrivez l'univers de votre boutique..."
                />
              </div>
           </div>

           <div>
              <button 
                onClick={handleSave}
                disabled={updating}
                className="w-full bg-black text-white font-black py-5 rounded-[2rem] text-[11px] tracking-[0.3em] shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {updating ? "SYNCHRONISATION..." : "METTRE À JOUR L'IDENTITÉ"}
              </button>
              <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-6 italic opacity-50">
                Les changements impactent votre vitrine publique instantanément.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}