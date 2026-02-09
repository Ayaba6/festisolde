import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  Plus, Trash2, Tag, Hash, 
  Loader2, Package, X, Sparkles, Search, Upload, Layers, Image as ImageIcon, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [newCat, setNewCat] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCategoriesWithCount = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('name')
      
      if (error) throw error

      if (data) {
        const formatted = data.map(cat => ({
          ...cat,
          productCount: cat.products?.[0]?.count || 0
        }))
        setCategories(formatted)
      }
    } catch (err: any) {
      toast.error("Erreur de chargement : " + err.message)
    }
  }

  useEffect(() => { fetchCategoriesWithCount() }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
      toast.success("Image téléchargée !")
    } catch (error: any) {
      toast.error("Échec de l'upload.")
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCat.trim()) return

    setLoading(true)
    const slug = newCat.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const { error } = await supabase.from('categories').insert([
      { 
        name: newCat, 
        slug, 
        image_url: imageUrl || null, 
        parent_id: parentId || null 
      }
    ])
    
    if (error) {
      toast.error("Erreur : " + error.message)
    } else {
      toast.success(parentId ? "Sous-catégorie ajoutée !" : "Rayon principal créé !")
      setNewCat(''); setImageUrl(''); setParentId(null);
      setIsModalOpen(false)
      fetchCategoriesWithCount()
    }
    setLoading(false)
  }

  const handleDelete = async (cat: any) => {
    // Vérifier s'il y a des sous-catégories liées
    const hasChildren = categories.some(c => c.parent_id === cat.id)
    if (hasChildren) {
      toast.error("Supprimez d'abord les sous-catégories de ce rayon.");
      return
    }

    if (cat.productCount > 0) {
      toast.error(`Impossible : ${cat.productCount} produits utilisent ce rayon.`);
      return
    }

    if (!confirm(`Supprimer "${cat.name}" ?`)) return
    
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (!error) {
      toast.success("Rayon supprimé")
      fetchCategoriesWithCount()
    }
  }

  // Filtrage intelligent : regroupe les enfants sous les parents pour la liste
  const displayCategories = useMemo(() => {
    const filtered = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    // Si on recherche, on affiche une liste simple. Sinon, on garde la hiérarchie.
    if (searchQuery) return filtered

    const parents = filtered.filter(c => !c.parent_id)
    const result: any[] = []

    parents.forEach(p => {
      result.push(p)
      const children = filtered.filter(c => c.parent_id === p.id)
      result.push(...children)
    })

    return result
  }, [searchQuery, categories])

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Layers size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">
              Gestion des <span className="text-indigo-600">Rayons</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              SEMER L'AVENIR : {categories.length} segments
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-indigo-100 transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} /> Nouveau Rayon
          </button>
        </div>
      </div>

      {/* GRILLE DES CATÉGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {displayCategories.map((cat) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={cat.id} 
              className={`bg-white p-6 rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:shadow-xl ${cat.parent_id ? 'border-dashed border-slate-200 ml-8 bg-slate-50/30' : 'border-slate-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden border border-slate-50 flex-shrink-0">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {cat.parent_id && <ChevronRight size={12} className="text-indigo-400" />}
                      <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight leading-tight">{cat.name}</h4>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                      {cat.parent_id ? 'Sous-catégorie' : 'Rayon Principal'}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(cat)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Package size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.productCount} Articles</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${cat.productCount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {cat.productCount > 0 ? 'Actif' : 'Vide'}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL DE CRÉATION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl">
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                    Nouveau <br/><span className="text-indigo-600">Segment</span>
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl"><X size={20} /></button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <input 
                    autoFocus
                    type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)}
                    placeholder="Ex: Sandales..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de rayon</label>
                  <select 
                    value={parentId || ""} 
                    onChange={(e) => setParentId(e.target.value || null)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Rayon Principal (Parent)</option>
                    {categories.filter(c => !c.parent_id).map(p => (
                      <option key={p.id} value={p.id}>Enfant de : {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icône / Image</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                    {imageUrl ? (
                      <img src={imageUrl} className="w-24 h-24 object-cover rounded-2xl shadow-lg" />
                    ) : (
                      <>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                        {uploading ? <Loader2 className="animate-spin text-indigo-600" /> : <Upload className="text-slate-300" />}
                      </>
                    )}
                  </div>
                </div>

                <button 
                  disabled={loading || uploading}
                  type="submit"
                  className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  Confirmer
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}