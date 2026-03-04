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
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 antialiased">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.5em]">Settings</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            Store <span className="text-gray-300 italic-none">Identity</span>
          </h1>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-6 py-3 rounded-2xl border border-green-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={16} strokeWidth={3} /> {message}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- COLONNE GAUCHE : VISUELS --- */}
        <div className="lg:col-span-7 space-y-10">
          
          <div className="relative group">
            <div className="flex justify-between items-center mb-4 px-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Aperçu Vitrine</p>
                <span className="text-[8px] font-black text-white bg-black px-2 py-1 rounded-md uppercase">Public view</span>
            </div>
            
            {/* Banner Container */}
            <div className="h-72 bg-gray-50 rounded-[2.5rem] overflow-hidden border-2 border-gray-100 relative group/banner shadow-xl">
              {storeData.banner_url ? (
                <img src={storeData.banner_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover/banner:scale-110" alt="Banner" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-300 font-black italic">Aucune bannière définie</div>
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/banner:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm">
                <div className="bg-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[11px] font-black tracking-[0.2em] shadow-2xl scale-90 group-hover/banner:scale-100 transition-transform text-black">
                  <Camera size={18} strokeWidth={3} /> MODIFIER LA BANNIÈRE
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} />
              </label>
            </div>

            {/* Logo Overlay */}
            <div className="absolute -bottom-10 left-12">
              <div className="w-36 h-36 bg-white rounded-[2.5rem] p-2 shadow-2xl relative group/logo border-2 border-gray-100">
                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-50 relative">
                  {storeData.logo_url ? (
                    <img src={storeData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-200 uppercase italic">
                      {storeData.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-orange-600/90 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                    <Upload size={28} className="text-white" strokeWidth={3} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* URL DE PARTAGE */}
          <div className="pt-14">
             <div className="bg-gray-900 p-8 rounded-[2.5rem] flex items-center justify-between group shadow-2xl">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                      <Globe size={24} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Votre lien de vitrine</p>
                      <p className="text-base font-black text-white italic tracking-tight">
                         festisolde.com/{(storeData.name || 'ma-boutique').toLowerCase().replace(/\s+/g, '-')}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-4 bg-white/5 text-white hover:bg-orange-600 hover:text-white rounded-2xl transition-all active:scale-90"
                >
                   <Copy size={22} />
                </button>
             </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : ÉDITION --- */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-10">
              <div className="space-y-4 border-l-4 border-gray-100 pl-8 focus-within:border-orange-500 transition-all duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom du Store</label>
                <input 
                  value={storeData.name}
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full text-3xl font-black italic outline-none bg-transparent text-gray-900 placeholder:text-gray-100 uppercase"
                  placeholder="EX: M&M FASHION"
                />
              </div>

              <div className="space-y-4 border-l-4 border-gray-100 pl-8 focus-within:border-orange-500 transition-all duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description / Slogan</label>
                <textarea 
                  rows={5}
                  value={storeData.description}
                  onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                  className="w-full text-sm font-bold outline-none bg-transparent text-gray-500 leading-relaxed resize-none placeholder:font-normal placeholder:italic"
                  placeholder="Parlez de votre style, vos arrivages et votre univers..."
                />
              </div>
           </div>

           <div className="space-y-6">
              <button 
                onClick={handleSave}
                disabled={updating}
                className="w-full bg-black text-white font-black py-6 rounded-2xl text-[12px] tracking-[0.4em] shadow-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-4 disabled:bg-gray-100 active:scale-95"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={3} />}
                {updating ? "SYNCHRONISATION..." : "SAUVEGARDER L'IDENTITÉ"}
              </button>
              <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] italic opacity-60">
                Mise à jour immédiate de la vitrine
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}