import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Save, 
  Loader2, 
  CheckCircle2,
  Globe,
  Camera,
  Copy,
  ChevronLeft
} from 'lucide-react';

export default function StoreSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingField, setUploadingField] = useState(null); // 'logo_url' ou 'banner_url'
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

    setUploadingField(type);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Mise à jour immédiate en DB pour cette image
      await supabase
        .from('stores')
        .update({ [type]: publicUrl })
        .eq('id', storeData.id);

      setStoreData(prev => ({ ...prev, [type]: publicUrl }));
      showFeedback('Visuel mis à jour');
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      setUploadingField(null);
    }
  };

  const showFeedback = (txt) => {
    setMessage(txt);
    setTimeout(() => setMessage(''), 3000);
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
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          description: storeData.description,
          slug: newSlug 
        })
        .eq('id', storeData.id);

      if (error) throw error;
      setStoreData(prev => ({ ...prev, slug: newSlug }));
      showFeedback('Profil enregistré !');
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = () => {
    const url = `festisolde.com/${storeData.slug}`;
    navigator.clipboard.writeText(url);
    showFeedback('Lien copié !');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-ink" size={32} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 antialiased pb-24">
      
      {/* TOP BAR STYLE STUDIO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-stone-100 rounded-2xl text-stone-400 hover:text-ink transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">Ma vitrine</h1>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mt-1">Identité de votre enseigne</p>
          </div>
        </div>
        
        {message && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={14} strokeWidth={3} /> {message.toUpperCase()}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLONNE VISUELS (Gauches) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative">
            {/* BANNER */}
            <div className="h-56 md:h-72 bg-stone-50 rounded-3xl overflow-hidden border border-stone-100 relative group shadow-inner">
              {storeData.banner_url ? (
                <img src={storeData.banner_url} className="w-full h-full object-cover" alt="Banner" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs font-bold uppercase tracking-wide">Aucune bannière</div>
              )}
              <label className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold text-ink shadow-xl scale-90 group-hover:scale-100 transition-transform">
                  {uploadingField === 'banner_url' ? <Loader2 className="animate-spin" size={14}/> : <Camera size={14} />} 
                  MODIFIER LA COUVERTURE
                </div>
                <input type="file" className="hidden" accept="image/*" disabled={!!uploadingField} onChange={(e) => handleFileUpload(e, 'banner_url')} />
              </label>
            </div>

            {/* LOGO */}
            <div className="absolute -bottom-8 left-10">
              <div className="w-28 h-28 bg-white rounded-3xl p-1.5 shadow-2xl border border-stone-50 group/logo relative">
                <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-stone-50 flex items-center justify-center border border-stone-100">
                  {storeData.logo_url ? (
                    <img src={storeData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <span className="text-3xl font-bold text-stone-200">{storeData.name?.charAt(0)}</span>
                  )}
                  <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[1px]">
                    {uploadingField === 'logo_url' ? <Loader2 className="animate-spin text-white" size={20}/> : <Upload size={20} className="text-white" />}
                    <input type="file" className="hidden" accept="image/*" disabled={!!uploadingField} onChange={(e) => handleFileUpload(e, 'logo_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* LIEN PUBLIC STYLE "WIDGET" */}
          <div className="pt-10">
             <div className="bg-stone-50 border border-stone-100 p-6 rounded-3xl flex items-center justify-between transition-all hover:border-stone-200">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-ink shadow-sm border border-stone-100">
                      <Globe size={20} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-0.5">Ma Vitrine Digitale</p>
                      <p className="text-sm font-bold text-ink truncate tracking-tight">
                          festisolde.com/<span className="text-orange-600">{storeData.slug || 'chargement...'}</span>
                      </p>
                   </div>
                </div>
                <button 
                  onClick={copyToClipboard} 
                  className="p-3 text-stone-400 hover:text-ink hover:bg-white hover:shadow-sm rounded-xl transition-all"
                >
                   <Copy size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* COLONNE ÉDITION (Droite) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wide ml-1">Nom de l'enseigne</label>
                <input 
                  value={storeData.name}
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full text-lg font-bold outline-none bg-stone-50 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-stone-100 transition-all border border-transparent focus:border-stone-200 text-ink"
                  placeholder="Ex: Boutique Horizon"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wide ml-1">À propos</label>
                <textarea 
                  rows={5}
                  value={storeData.description}
                  onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                  className="w-full text-sm font-bold outline-none bg-stone-50 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-stone-100 transition-all border border-transparent focus:border-stone-200 resize-none leading-relaxed text-stone-600"
                  placeholder="Décrivez votre univers, vos délais de livraison..."
                />
              </div>
           </div>

           <button 
             onClick={handleSave}
             disabled={updating || !!uploadingField}
             className="w-full bg-ink text-white font-bold py-5 rounded-2xl text-xs tracking-wide shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:bg-stone-100 disabled:text-stone-300 group"
           >
             {updating ? (
               <Loader2 className="animate-spin" size={18} />
             ) : (
               <Save size={18} className="group-hover:scale-110 transition-transform" />
             )}
             ENREGISTRER LES MODIFICATIONS
           </button>
        </div>
      </div>
    </div>
  );
}