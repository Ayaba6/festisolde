import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
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
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={40} strokeWidth={3} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Synchronisation...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12 antialiased pb-24">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
        <div className="space-y-2">
          <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.3em]">Paramètrage</p>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none break-words">
            Identité <span className="text-gray-300 italic-none">boutique</span>
          </h1>
        </div>
        
        {message && (
          <div className="fixed top-4 right-4 md:static z-50 flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-5 py-3 rounded-2xl border border-green-100 shadow-xl animate-in fade-in slide-in-from-top-2 md:slide-in-from-bottom-2">
            <CheckCircle2 size={14} strokeWidth={3} /> {message}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* --- COLONNE GAUCHE : VISUELS --- */}
        <div className="lg:col-span-7 space-y-12 md:space-y-10">
          
          <div className="relative group">
            <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Aperçu Vitrine</p>
                <span className="text-[8px] font-black text-white bg-black px-2 py-1 rounded-md uppercase">Public view</span>
            </div>
            
            {/* Banner Container */}
            <div className="h-48 md:h-72 bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-2 border-gray-100 relative group/banner shadow-lg">
              {storeData.banner_url ? (
                <img src={storeData.banner_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover/banner:scale-110" alt="Banner" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-center px-4 uppercase tracking-widest text-gray-300 font-black italic">Aucune bannière définie</div>
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 md:group-hover/banner:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm lg:opacity-0 opacity-100 bg-black/20 md:bg-black/50">
                <div className="bg-white px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 text-[9px] md:text-[11px] font-black tracking-widest shadow-2xl text-black">
                  <Camera size={16} strokeWidth={3} /> CHANGER LA BANNIÈRE
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} />
              </label>
            </div>

            {/* Logo Overlay - Réajusté pour mobile */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-12">
              <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-1.5 md:p-2 shadow-2xl relative group/logo border-2 border-gray-50">
                <div className="w-full h-full rounded-[1.2rem] md:rounded-[2rem] overflow-hidden bg-gray-50 relative">
                  {storeData.logo_url ? (
                    <img src={storeData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-gray-200 uppercase italic">
                      {storeData.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-orange-600/90 md:opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                    <Upload size={24} className="text-white" strokeWidth={3} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* URL DE PARTAGE - Adapté pour mobile */}
          <div className="pt-8 md:pt-14">
             <div className="bg-gray-900 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 group shadow-2xl">
                <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center text-orange-500 shadow-inner">
                      <Globe size={20} md:size={24} strokeWidth={2.5} />
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lien de votre vitrine</p>
                      <p className="text-sm md:text-base font-black text-white italic tracking-tight truncate break-all">
                         festisolde.com/{(storeData.name || 'ma-boutique').toLowerCase().replace(/\s+/g, '-')}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full sm:w-auto p-4 bg-white/5 text-white hover:bg-orange-600 hover:text-white rounded-xl md:rounded-2xl transition-all active:scale-90 flex items-center justify-center"
                >
                   <Copy size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : ÉDITION --- */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
           <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-8 md:space-y-10">
              <div className="space-y-3 border-l-4 border-gray-100 pl-4 md:pl-8 focus-within:border-orange-500 transition-all duration-300">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nom du Store</label>
                <input 
                  value={storeData.name}
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full text-xl md:text-3xl font-black italic outline-none bg-transparent text-gray-900 placeholder:text-gray-100 uppercase"
                  placeholder="EX: M&M FASHION"
                />
              </div>

              <div className="space-y-3 border-l-4 border-gray-100 pl-4 md:pl-8 focus-within:border-orange-500 transition-all duration-300">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Description / Slogan</label>
                <textarea 
                  rows={4}
                  value={storeData.description}
                  onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                  className="w-full text-xs md:text-sm font-bold outline-none bg-transparent text-gray-500 leading-relaxed resize-none placeholder:font-normal placeholder:italic"
                  placeholder="Parlez de votre style, vos arrivages..."
                />
              </div>
           </div>

           <div className="space-y-4">
              <button 
                onClick={handleSave}
                disabled={updating}
                className="w-full bg-black text-white font-black py-5 md:py-6 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] tracking-[0.2em] md:tracking-[0.4em] shadow-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-100 active:scale-95"
              >
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={3} />}
                {updating ? "SYNCHRONISATION..." : "ENREGISTRER LES MODIFICATIONS"}
              </button>
              <p className="text-center text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest italic opacity-60 px-4">
                Les changements seront visibles immédiatement par vos clients.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}