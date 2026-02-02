import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  Plus, Trash2, Tag, Hash, 
  Loader2, Package, X, Sparkles, Search 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newCat, setNewCat] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchCategoriesWithCount = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        products:products(count)
      `)
      .order('name')
    
    if (!error) {
      const formatted = data.map(cat => ({
        ...cat,
        productCount: cat.products?.[0]?.count || 0
      }))
      setCategories(formatted)
    }
  }

  useEffect(() => { fetchCategoriesWithCount() }, [])

  // LOGIQUE DE FILTRE (Recherche)
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, categories])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCat.trim()) return

    setLoading(true)
    const slug = newCat.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const { error } = await supabase.from('categories').insert([{ name: newCat, slug }])
    
    if (error) {
      toast.error("Erreur ou catégorie déjà existante")
    } else {
      toast.success("Catégorie créée !")
      setNewCat('')
      setIsModalOpen(false)
      fetchCategoriesWithCount()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      toast.error(`Impossible : ${count} produits utilisent cette catégorie.`);
      return;
    }
    if (!confirm("Supprimer cette catégorie ?")) return
    
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      toast.success("Catégorie supprimée")
      fetchCategoriesWithCount()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER AVEC RECHERCHE ET BOUTON AJOUT */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Tag size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">
              Catalogue <span className="text-purple-600">Catégories</span>
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
              {categories.length} sections enregistrées
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm transition-all focus:bg-white focus:border-purple-200"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1E1B4B] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <Plus size={18} /> Créer
          </button>
        </div>
      </div>

      {/* GRILLE DES CATÉGORIES FILTRÉES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredCategories.map((cat) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={cat.id} 
              className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors duration-500">
                    <Hash size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">{cat.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold italic tracking-widest uppercase">ID: {cat.slug}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(cat.id, cat.productCount)} className="p-2 text-gray-200 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <Package size={12} className="text-gray-400" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {cat.productCount} Articles liés
                  </span>
                </div>
                {cat.productCount > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                    <div className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-[8px] font-black uppercase">Actif</span>
                  </div>
                ) : (
                  <span className="text-[8px] font-black text-gray-300 uppercase">Vide</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Message si aucun résultat */}
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Tag size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE CRÉATION (Inchangé) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#1E1B4B]/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              <div className="relative">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/40">
                      <Sparkles size={24} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">
                      Nouvelle <br/><span className="text-purple-600">Catégorie</span>
                    </h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Nom du rayon</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      placeholder="Ex: Sneakers, Robes d'été..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold text-gray-900 focus:border-purple-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-purple-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    Enregistrer la catégorie
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}