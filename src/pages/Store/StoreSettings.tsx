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

      await supabase.storage.from('store-assets').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      
      setStoreData({ ...storeData, [type]: urlData.publicUrl });
    } catch (error) {
      console.error(error);
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
      setMessage('Modifications enregistrées');
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gray-400 font-light">Configuration du studio...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 antialiased">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[#0866FF] uppercase tracking-[0.4em] ml-1">Configuration</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Identité de <span className="text-gray-300">Marque</span></h1>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-[#25D366] text-[10px] font-bold uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-fade-in">
            <CheckCircle2 size={14} /> {message}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* --- COLONNE GAUCHE : VISUELS (7/12) --- */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* BANNIÈRE & LOGO COMBINÉS */}
          <div className="relative group">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Aperçu de la vitrine</p>
            
            {/* Banner Container */}
            <div className="h-56 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group/banner">
              {storeData.banner_url ? (
                <img src={storeData.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-300 font-light">Fond de boutique vide</div>
              )}
              <label className="absolute inset-0 bg-gray-900/20 opacity-0 group-hover/banner:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-widest shadow-2xl">
                  <Camera size={14} /> ÉDITER LA BANNIÈRE
                </div>
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'banner_url')} />
              </label>
            </div>

            {/* Logo Overlay */}
            <div className="absolute -bottom-6 left-8">
              <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-2xl shadow-gray-200 relative group/logo border border-gray-50">
                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 relative">
                  {storeData.logo_url ? (
                    <img src={storeData.logo_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-light text-gray-300 uppercase">
                      {storeData.name.charAt(0)}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-[#0866FF]/60 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                    <Upload size={18} className="text-white" />
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* LIEN PUBLIC COMPACT */}
          <div className="pt-8">
             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0866FF] shadow-sm">
                      <Globe size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">URL de partage</p>
                      <p className="text-[12px] font-medium text-gray-700">festisolde.com/{storeData.name.toLowerCase().replace(/\s+/g, '-')}</p>
                   </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-[#0866FF] transition-colors">
                   <Copy size={16} />
                </button>
             </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : ÉDITION (5/12) --- */}
        <div className="lg:col-span-5 space-y-8">
           <div className="space-y-6">
              <div className="space-y-2 border-l-2 border-gray-100 pl-6 focus-within:border-[#0866FF] transition-all">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Nom Commercial</label>
                <input 
                  value={storeData.name}
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full text-xl font-light outline-none bg-transparent text-gray-900"
                />
              </div>

              <div className="space-y-2 border-l-2 border-gray-100 pl-6 focus-within:border-[#0866FF] transition-all">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Signature / Slogan</label>
                <textarea 
                  rows={4}
                  value={storeData.description}
                  onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                  className="w-full text-[13px] font-light outline-none bg-transparent text-gray-500 leading-relaxed resize-none"
                  placeholder="Décrivez l'âme de votre boutique en quelques mots..."
                />
              </div>
           </div>

           <div className="pt-10">
              <button 
                onClick={handleSave}
                disabled={updating}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-full text-[11px] tracking-[0.3em] shadow-2xl hover:bg-[#0866FF] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {updating ? "SYNCHRONISATION..." : "METTRE À JOUR L'IDENTITÉ"}
              </button>
              <p className="text-center text-[9px] text-gray-300 uppercase tracking-widest mt-4">Ces modifications seront visibles instantanément par vos clients.</p>
           </div>
        </div>
      </div>
    </div>
  );
}